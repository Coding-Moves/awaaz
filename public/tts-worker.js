// Awaaz TTS worker — runs the Kokoro model off the main thread so the page never freezes.
import { KokoroTTS } from "/vendor/kokoro.web.js";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

let tts = null;
let loading = null;
const files = new Map();

function reportProgress(event) {
  if (event.status !== "progress" && event.status !== "done") return;
  if (!event.file) return;
  const prev = files.get(event.file) || { loaded: 0, total: 0 };
  const total = event.total || prev.total;
  const loaded = event.status === "done" ? total || prev.loaded : event.loaded || prev.loaded;
  files.set(event.file, { loaded, total });
  let l = 0;
  let t = 0;
  for (const f of files.values()) { l += f.loaded; t += f.total; }
  self.postMessage({ type: "progress", loaded: l, total: t });
}

async function init() {
  if (tts) return tts;
  if (!loading) {
    loading = KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: "q8",
      device: "wasm",
      progress_callback: reportProgress,
    });
  }
  tts = await loading;
  return tts;
}

self.onmessage = async (e) => {
  const msg = e.data;
  if (msg.type === "init") {
    try {
      await init();
      self.postMessage({ type: "ready" });
    } catch (err) {
      loading = null;
      self.postMessage({ type: "error", message: String(err && err.message ? err.message : err) });
    }
    return;
  }

  if (msg.type === "generate") {
    try {
      const model = await init();
      const result = await model.generate(msg.text, { voice: msg.voice, speed: msg.speed });
      const audio = result.audio; // Float32Array
      self.postMessage(
        { type: "audio", id: msg.id, audio, sampleRate: result.sampling_rate },
        [audio.buffer],
      );
    } catch (err) {
      self.postMessage({ type: "gen-error", id: msg.id, message: String(err && err.message ? err.message : err) });
    }
  }
};
