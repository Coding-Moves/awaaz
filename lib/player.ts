// Playback engine: plays chunks one after another and pre-generates the next ones
// in the background, so there is no waiting between sentences.

import { speakable } from "./text";

export type EngineKind = "kokoro" | "browser";
export type ModelStatus = "idle" | "loading" | "ready" | "error";

export type PlayerEvents = {
  onIndex: (index: number) => void;
  onPlaying: (playing: boolean) => void;
  onBuffering: (buffering: boolean) => void;
  onModel: (status: ModelStatus, progress: number, error?: string) => void;
  onFinished: () => void;
  onChunkError: (message: string) => void;
};

const PREFETCH = 3; // how many chunks ahead to prepare

type WorkerReply =
  | { type: "progress"; loaded: number; total: number }
  | { type: "ready" }
  | { type: "error"; message: string }
  | { type: "audio"; id: number; audio: Float32Array; sampleRate: number }
  | { type: "gen-error"; id: number; message: string };

export class Player {
  private texts: string[] = [];
  private index = 0;
  private playing = false;

  engine: EngineKind = "kokoro";
  voice = "af_heart";
  browserVoice = "";
  speed = 1;

  // kokoro state
  private worker: Worker | null = null;
  private modelStatus: ModelStatus = "idle";
  private ctx: AudioContext | null = null;
  private cache = new Map<number, AudioBuffer>();
  private inflight: { reqId: number; index: number; epoch: number } | null = null;
  private failed = new Set<number>();
  private epoch = 0;
  private reqCounter = 0;
  private source: AudioBufferSourceNode | null = null;
  private waitingFor: number | null = null;

  // browser state
  private utterance: SpeechSynthesisUtterance | null = null;

  constructor(private ev: PlayerEvents) {}

  /* ---------- setup ---------- */

  loadModel() {
    if (this.worker || typeof window === "undefined") return;
    this.modelStatus = "loading";
    this.ev.onModel("loading", 0);
    try {
      this.worker = new Worker("/tts-worker.js", { type: "module" });
    } catch (err) {
      this.failModel(String(err));
      return;
    }
    this.worker.onmessage = (e: MessageEvent<WorkerReply>) => this.onWorker(e.data);
    this.worker.onerror = (e) => this.failModel(e.message || "Voice model failed to start.");
    this.worker.postMessage({ type: "init" });
  }

  get model() {
    return this.modelStatus;
  }

  private failModel(message: string) {
    this.modelStatus = "error";
    this.worker?.terminate();
    this.worker = null;
    this.ev.onModel("error", 0, message);
  }

  retryModel() {
    this.worker?.terminate();
    this.worker = null;
    this.loadModel();
  }

  setTexts(texts: string[], startAt = 0) {
    this.stopOutput();
    this.texts = texts;
    this.clearCache();
    this.index = Math.min(Math.max(0, startAt), Math.max(0, texts.length - 1));
    this.setPlaying(false);
    this.ev.onIndex(this.index);
  }

  get current() {
    return this.index;
  }

  get isPlaying() {
    return this.playing;
  }

  /* ---------- controls ---------- */

  async play() {
    if (!this.texts.length) return;
    this.setPlaying(true);
    if (this.engine === "kokoro") {
      this.ensureContext();
      if (this.ctx!.state === "suspended") await this.ctx!.resume();
      if (this.source) return; // was paused mid-chunk; context resume continues it
      if (this.modelStatus === "idle") this.loadModel();
    }
    this.playChunk(this.index);
  }

  pause() {
    this.setPlaying(false);
    if (this.engine === "kokoro") {
      void this.ctx?.suspend();
    } else {
      // Browser pause/resume is unreliable; restart the current sentence on resume instead.
      this.cancelUtterance();
    }
    this.ev.onBuffering(false);
    this.waitingFor = null;
  }

  toggle() {
    if (this.playing) this.pause();
    else void this.play();
  }

  seek(index: number) {
    if (!this.texts.length) return;
    const i = Math.min(Math.max(0, index), this.texts.length - 1);
    this.stopOutput();
    this.index = i;
    this.ev.onIndex(i);
    if (this.playing) this.playChunk(i);
    else if (this.engine === "kokoro") this.pump();
  }

  next() {
    this.seek(this.index + 1);
  }

  prev() {
    this.seek(this.index - 1);
  }

  setVoice(voice: string) {
    if (voice === this.voice) return;
    this.voice = voice;
    this.settingsChanged();
  }

  setBrowserVoice(name: string) {
    this.browserVoice = name;
    if (this.engine === "browser") this.settingsChanged();
  }

  setSpeed(speed: number) {
    if (speed === this.speed) return;
    this.speed = speed;
    this.settingsChanged();
  }

  setEngine(engine: EngineKind) {
    if (engine === this.engine) return;
    const wasPlaying = this.playing;
    this.stopOutput();
    this.engine = engine;
    this.clearCache();
    if (engine === "kokoro" && this.modelStatus === "idle") this.loadModel();
    if (wasPlaying) void this.play();
  }

  destroy() {
    this.stopOutput();
    this.worker?.terminate();
    this.worker = null;
    void this.ctx?.close();
    this.ctx = null;
  }

  /* ---------- internals ---------- */

  private setPlaying(p: boolean) {
    this.playing = p;
    this.ev.onPlaying(p);
  }

  private settingsChanged() {
    // Generated audio no longer matches the new voice/speed: regenerate from the current sentence.
    this.clearCache();
    if (this.playing) {
      this.stopOutput();
      this.playChunk(this.index);
    } else {
      this.stopOutput();
      if (this.engine === "kokoro") this.pump();
    }
  }

  private clearCache() {
    this.epoch++;
    this.cache.clear();
    this.failed.clear();
    this.inflight = null;
  }

  private stopOutput() {
    if (this.source) {
      const s = this.source;
      this.source = null; // set first so onended is ignored
      try { s.stop(); } catch { /* already stopped */ }
      s.disconnect();
    }
    this.cancelUtterance();
    this.waitingFor = null;
    this.ev.onBuffering(false);
  }

  private cancelUtterance() {
    if (typeof speechSynthesis === "undefined") return;
    this.utterance = null;
    speechSynthesis.cancel();
  }

  private ensureContext() {
    if (!this.ctx) this.ctx = new AudioContext();
  }

  private playChunk(i: number) {
    if (i >= this.texts.length) {
      this.setPlaying(false);
      this.ev.onFinished();
      return;
    }
    this.index = i;
    this.ev.onIndex(i);
    if (this.engine === "browser") this.speakBrowser(i);
    else this.playKokoro(i);
  }

  private advance() {
    if (!this.playing) return;
    this.playChunk(this.index + 1);
  }

  /* kokoro */

  private playKokoro(i: number) {
    if (this.failed.has(i)) {
      // Skip a sentence the model couldn't read rather than getting stuck.
      this.ev.onChunkError(`Skipped a sentence the voice couldn't read.`);
      this.advance();
      return;
    }
    const buffer = this.cache.get(i);
    if (!buffer || !this.ctx) {
      this.waitingFor = i;
      this.ev.onBuffering(true);
      this.pump();
      return;
    }
    this.waitingFor = null;
    this.ev.onBuffering(false);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.ctx.destination);
    src.onended = () => {
      if (this.source !== src) return;
      this.source = null;
      src.disconnect();
      this.advance();
    };
    this.source = src;
    src.start();
    this.prune();
    this.pump();
  }

  /** Ask the worker for the next missing chunk (one request at a time keeps seeks responsive). */
  private pump() {
    if (this.engine !== "kokoro" || !this.worker || this.modelStatus === "error") return;
    if (this.inflight) return;
    const start = this.waitingFor ?? this.index;
    for (let i = start; i < Math.min(this.texts.length, this.index + 1 + PREFETCH); i++) {
      if (this.cache.has(i) || this.failed.has(i)) continue;
      const text = speakable(this.texts[i]);
      if (!text) {
        this.failed.add(i);
        continue;
      }
      const reqId = ++this.reqCounter;
      this.inflight = { reqId, index: i, epoch: this.epoch };
      this.worker.postMessage({ type: "generate", id: reqId, text, voice: this.voice, speed: this.speed });
      return;
    }
  }

  private prune() {
    for (const k of this.cache.keys()) {
      if (k < this.index - 1 || k > this.index + PREFETCH + 2) this.cache.delete(k);
    }
  }

  private onWorker(msg: WorkerReply) {
    switch (msg.type) {
      case "progress": {
        const pct = msg.total > 0 ? Math.min(99, Math.round((msg.loaded / msg.total) * 100)) : 0;
        this.ev.onModel("loading", pct);
        return;
      }
      case "ready":
        this.modelStatus = "ready";
        this.ev.onModel("ready", 100);
        this.pump();
        return;
      case "error":
        this.failModel(msg.message);
        return;
      case "audio":
      case "gen-error": {
        const req = this.inflight;
        if (!req || req.reqId !== msg.id) return; // stale reply
        this.inflight = null;
        if (req.epoch === this.epoch) {
          if (msg.type === "audio") {
            this.ensureContext();
            const buf = this.ctx!.createBuffer(1, msg.audio.length, msg.sampleRate);
            buf.copyToChannel(new Float32Array(msg.audio), 0);
            this.cache.set(req.index, buf);
          } else {
            this.failed.add(req.index);
          }
          if (this.playing && this.waitingFor === req.index) this.playKokoro(req.index);
        }
        this.pump();
        return;
      }
    }
  }

  /* browser speech */

  private speakBrowser(i: number) {
    if (typeof speechSynthesis === "undefined") {
      this.ev.onChunkError("This browser has no built-in speech.");
      this.setPlaying(false);
      return;
    }
    this.cancelUtterance();
    const u = new SpeechSynthesisUtterance(speakable(this.texts[i]));
    u.rate = this.speed;
    const v = speechSynthesis.getVoices().find((x) => x.name === this.browserVoice);
    if (v) { u.voice = v; u.lang = v.lang; }
    u.onend = () => { if (this.utterance === u) { this.utterance = null; this.advance(); } };
    u.onerror = (e) => {
      if (this.utterance !== u) return;
      this.utterance = null;
      if (e.error === "interrupted" || e.error === "canceled") return;
      // Don't race through the whole book on repeated errors — stop and tell the user.
      this.setPlaying(false);
      this.ev.onChunkError("Your browser couldn't speak this sentence. Try another voice, or press play to retry.");
    };
    this.utterance = u;
    speechSynthesis.speak(u);
  }
}
