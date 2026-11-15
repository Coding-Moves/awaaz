"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { extractFile } from "@/lib/extract";
import { Player, type EngineKind, type ModelStatus } from "@/lib/player";
import { deleteBook, getBook, listBooks, saveBook, updatePosition, type SavedBook } from "@/lib/storage";
import { guessTitle, hashText, prepareText, type Prepared } from "@/lib/text";

const KOKORO_VOICES: { id: string; label: string }[] = [
  { id: "af_heart", label: "Heart — US, female" },
  { id: "af_bella", label: "Bella — US, female" },
  { id: "af_nicole", label: "Nicole — US, soft" },
  { id: "af_sarah", label: "Sarah — US, female" },
  { id: "am_michael", label: "Michael — US, male" },
  { id: "am_fenrir", label: "Fenrir — US, male" },
  { id: "am_puck", label: "Puck — US, male" },
  { id: "bf_emma", label: "Emma — UK, female" },
  { id: "bf_isabella", label: "Isabella — UK, female" },
  { id: "bm_george", label: "George — UK, male" },
  { id: "bm_fable", label: "Fable — UK, male" },
];

const SPEEDS = [0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];
const CHARS_PER_SECOND = 14.5; // rough speaking rate at 1x

type Book = { id: string; title: string; text: string; prepared: Prepared };

const PREFS_KEY = "awaaz:prefs";
type Prefs = { voice: string; speed: number; engine: EngineKind; browserVoice: string };

function loadPrefs(): Partial<Prefs> {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
  } catch {
    return {};
  }
}

function formatDuration(seconds: number) {
  const m = Math.round(seconds / 60);
  if (m < 1) return "under a minute";
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function formatRemaining(seconds: number) {
  if (Math.round(seconds / 60) < 1) return "Less than a minute left";
  return `~${formatDuration(seconds)} left`;
}

export default function Reader() {
  const [draft, setDraft] = useState("");
  const [book, setBook] = useState<Book | null>(null);
  const [library, setLibrary] = useState<SavedBook[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [model, setModel] = useState<{ status: ModelStatus; progress: number; error?: string }>({ status: "idle", progress: 0 });
  // This component only renders in the browser (see ReaderClient), so localStorage is safe here.
  const [initialPrefs] = useState(loadPrefs);
  const [engine, setEngineState] = useState<EngineKind>(initialPrefs.engine ?? "kokoro");
  const [voice, setVoiceState] = useState(initialPrefs.voice ?? "af_heart");
  const [browserVoice, setBrowserVoiceState] = useState(initialPrefs.browserVoice ?? "");
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speed, setSpeedState] = useState(initialPrefs.speed ?? 1);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const playerRef = useRef<Player | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bookRef = useRef<Book | null>(null);
  const lastSaved = useRef(0);

  useEffect(() => {
    bookRef.current = book;
  }, [book]);

  /* ---------- player setup ---------- */

  useEffect(() => {
    const p = new Player({
      onIndex: setIndex,
      onPlaying: setPlaying,
      onBuffering: setBuffering,
      onModel: (status, progress, err) => {
        setModel({ status, progress, error: err });
        if (status === "error") {
          // Keep reading with the built-in browser voice instead of stopping.
          p.setEngine("browser");
          setEngineState("browser");
          setNotice("The natural voice couldn't load on this device, so Awaaz switched to your browser's voice.");
        }
      },
      onFinished: () => setNotice("Finished reading. 🎉"),
      onChunkError: (m) => setNotice(m),
    });
    if (initialPrefs.voice) p.voice = initialPrefs.voice;
    if (initialPrefs.speed) p.speed = initialPrefs.speed;
    if (initialPrefs.browserVoice) p.browserVoice = initialPrefs.browserVoice;
    if (initialPrefs.engine) p.engine = initialPrefs.engine;
    playerRef.current = p;

    listBooks().then(setLibrary);

    return () => p.destroy();
  }, [initialPrefs]);

  // Browser voices load asynchronously.
  useEffect(() => {
    if (typeof speechSynthesis === "undefined") return;
    const load = () => {
      const all = speechSynthesis.getVoices();
      const sorted = [...all].sort((a, b) => {
        const ae = a.lang.startsWith("en") ? 0 : 1;
        const be = b.lang.startsWith("en") ? 0 : 1;
        return ae - be || a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name);
      });
      setBrowserVoices(sorted);
    };
    load();
    speechSynthesis.addEventListener("voiceschanged", load);
    return () => speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  const savePrefs = useCallback((patch: Partial<Prefs>) => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ ...loadPrefs(), ...patch }));
    } catch {
      /* ignore */
    }
  }, []);

  const warmUp = useCallback(() => {
    const p = playerRef.current;
    if (p && p.engine === "kokoro" && p.model === "idle") p.loadModel();
  }, []);

  /* ---------- open / save books ---------- */

  const openBook = useCallback(async (text: string, title?: string) => {
    const prepared = prepareText(text);
    if (!prepared.chunks.length) {
      setError("There's no readable text here yet.");
      return;
    }
    setError(null);
    setNotice(null);
    const id = hashText(text);
    const existing = await getBook(id);
    const startAt = existing && existing.position < prepared.chunks.length ? existing.position : 0;
    const b: Book = { id, title: title || existing?.title || guessTitle(text), text, prepared };
    setBook(b);
    playerRef.current?.setTexts(prepared.chunks.map((c) => c.text), startAt);
    warmUp();
    await saveBook({ id, title: b.title, text, position: startAt, total: prepared.chunks.length, updatedAt: Date.now() });
    listBooks().then(setLibrary);
    if (startAt > 0) setNotice(`Welcome back — continuing from where you stopped.`);
  }, [warmUp]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setExtracting("Opening file…");
    warmUp();
    try {
      const { title, text } = await extractFile(file, setExtracting);
      await openBook(text, title);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that file.");
    } finally {
      setExtracting(null);
    }
  }, [openBook, warmUp]);

  const closeBook = useCallback(() => {
    playerRef.current?.pause();
    const b = bookRef.current;
    if (b) void updatePosition(b.id, playerRef.current?.current ?? 0).then(() => listBooks().then(setLibrary));
    setBook(null);
    setNotice(null);
  }, []);

  // Save reading position (throttled), and when the tab is hidden.
  useEffect(() => {
    if (!book) return;
    if (Math.abs(index - lastSaved.current) >= 3 || !playing) {
      lastSaved.current = index;
      void updatePosition(book.id, index);
    }
  }, [book, index, playing]);

  useEffect(() => {
    const onHide = () => {
      const b = bookRef.current;
      if (b && document.visibilityState === "hidden") void updatePosition(b.id, playerRef.current?.current ?? 0);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  /* ---------- highlight + autoscroll ---------- */

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !book) return;
    panel.querySelector(".chunk.active")?.classList.remove("active");
    const el = panel.querySelector<HTMLElement>(`[data-i="${index}"]`);
    if (!el) return;
    el.classList.add("active");
    const top = el.offsetTop - panel.clientHeight / 2 + el.offsetHeight / 2;
    panel.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [index, book]);

  /* ---------- keyboard + media session ---------- */

  useEffect(() => {
    if (!book) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      const p = playerRef.current;
      if (!p) return;
      if (e.code === "Space") { e.preventDefault(); p.toggle(); }
      else if (e.code === "ArrowRight") { e.preventDefault(); p.next(); }
      else if (e.code === "ArrowLeft") { e.preventDefault(); p.prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [book]);

  useEffect(() => {
    if (!book || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: book.title, artist: "Awaaz", album: "Coding Moves" });
    const p = playerRef.current!;
    navigator.mediaSession.setActionHandler("play", () => void p.play());
    navigator.mediaSession.setActionHandler("pause", () => p.pause());
    navigator.mediaSession.setActionHandler("nexttrack", () => p.next());
    navigator.mediaSession.setActionHandler("previoustrack", () => p.prev());
    return () => {
      for (const a of ["play", "pause", "nexttrack", "previoustrack"] as MediaSessionAction[]) navigator.mediaSession.setActionHandler(a, null);
    };
  }, [book]);

  useEffect(() => {
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, [playing]);

  /* ---------- derived ---------- */

  const total = book?.prepared.chunks.length ?? 0;
  const remaining = useMemo(() => {
    if (!book) return 0;
    let chars = 0;
    for (let i = index; i < book.prepared.chunks.length; i++) chars += book.prepared.chunks[i].text.length;
    return chars / CHARS_PER_SECOND / speed;
  }, [book, index, speed]);

  const modelLabel =
    engine === "browser"
      ? "Browser voice"
      : model.status === "ready"
        ? "Natural voice ready"
        : model.status === "loading"
          ? `Downloading voice… ${model.progress}% (first time only)`
          : model.status === "error"
            ? "Natural voice unavailable"
            : "Natural voice";
  const dotClass = engine === "browser" ? "ready" : model.status === "ready" ? "ready" : model.status === "loading" ? "loading" : model.status === "error" ? "error" : "";

  /* ---------- render ---------- */

  return (
    <div className="reader" id="reader">
      <div className="reader-top">
        {book ? <p className="reader-title" title={book.title}>{book.title}</p> : <p className="reader-title">Paste text or upload a book</p>}
        <div className="model-status" aria-live="polite">
          <span className={`dot ${dotClass}`} />
          {modelLabel}
          {model.status === "error" && engine === "kokoro" && (
            <button className="button button-secondary button-small" onClick={() => playerRef.current?.retryModel()}>Retry</button>
          )}
        </div>
      </div>

      {!book ? (
        <div className="input-area">
          <label htmlFor="text" className="visually-hidden">Text to read aloud</label>
          <textarea
            id="text"
            value={draft}
            placeholder="Paste a chapter, an article, your notes — anything you want to listen to."
            onChange={(e) => setDraft(e.target.value)}
            onFocus={warmUp}
          />

          <div
            className={`dropzone${dragging ? " drag" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) void handleFile(f);
            }}
          >
            <small>{extracting ?? "Or drop a PDF, EPUB or TXT file here"}</small>
            <button className="button button-secondary button-small" onClick={() => fileRef.current?.click()} disabled={!!extracting}>
              Upload a book
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.epub,.txt,.md,application/pdf,application/epub+zip,text/plain"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = "";
              }}
            />
          </div>

          <div className="input-footer">
            <p className="hint">
              {draft.trim() ? `${draft.trim().split(/\s+/).length.toLocaleString()} words · about ${formatDuration(draft.length / CHARS_PER_SECOND)} to listen` : "Nothing is uploaded — your text stays on this device."}
            </p>
            <button className="button button-primary" disabled={!draft.trim() || !!extracting} onClick={() => void openBook(draft)}>
              Start listening
            </button>
          </div>
          {error && <p className="error-text" role="alert">{error}</p>}

          {library.length > 0 && (
            <div className="library">
              <h3>Continue listening</h3>
              <ul>
                {library.map((b) => (
                  <li key={b.id}>
                    <div>
                      <button className="link" onClick={() => void openBook(b.text, b.title)}>{b.title}</button>
                      <br />
                      <small>{Math.round((b.position / Math.max(1, b.total)) * 100)}% done</small>
                    </div>
                    <button
                      className="remove"
                      aria-label={`Remove ${b.title}`}
                      onClick={() => void deleteBook(b.id).then(() => listBooks().then(setLibrary))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <>
          <div
            className="reading-panel"
            ref={panelRef}
            style={{ position: "relative" }}
            onClick={(e) => {
              const el = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
              if (el) playerRef.current?.seek(Number(el.dataset.i));
            }}
          >
            <BookText prepared={book.prepared} />
          </div>

          <div className="player">
            {notice && <p className="hint" style={{ marginBottom: ".6rem" }}>{notice}</p>}
            <label htmlFor="progress" className="visually-hidden">Reading position</label>
            <input
              id="progress"
              className="progress"
              type="range"
              min={0}
              max={Math.max(0, total - 1)}
              value={index}
              onChange={(e) => playerRef.current?.seek(Number(e.target.value))}
            />
            <div className="progress-meta">
              <span>Sentence {(index + 1).toLocaleString()} of {total.toLocaleString()} · {Math.round(((index + 1) / Math.max(1, total)) * 100)}%</span>
              <span>{formatRemaining(remaining)}</span>
            </div>

            <div className="controls">
              <div className="transport">
                <button className="icon-btn" aria-label="Previous sentence" onClick={() => playerRef.current?.prev()} disabled={index === 0}>
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M6 5h2v14H6zM20 5v14L9 12z" /></svg>
                </button>
                <button className="icon-btn play" aria-label={playing ? "Pause" : "Play"} onClick={() => playerRef.current?.toggle()}>
                  {playing ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
                <button className="icon-btn" aria-label="Next sentence" onClick={() => playerRef.current?.next()} disabled={index >= total - 1}>
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M16 5h2v14h-2zM4 5l11 7-11 7z" /></svg>
                </button>
                {buffering && playing && (
                  <span className="buffering">
                    {engine === "kokoro" && model.status === "loading" ? `Preparing voice… ${model.progress}%` : "Preparing…"}
                  </span>
                )}
              </div>

              <div className="settings">
                <label>
                  Engine
                  <select
                    value={engine}
                    onChange={(e) => {
                      const v = e.target.value as EngineKind;
                      setEngineState(v);
                      playerRef.current?.setEngine(v);
                      savePrefs({ engine: v });
                      setNotice(null);
                    }}
                  >
                    <option value="kokoro">Natural (AI)</option>
                    <option value="browser">Browser (instant)</option>
                  </select>
                </label>

                {engine === "kokoro" ? (
                  <label>
                    Voice
                    <select
                      value={voice}
                      onChange={(e) => {
                        setVoiceState(e.target.value);
                        playerRef.current?.setVoice(e.target.value);
                        savePrefs({ voice: e.target.value });
                      }}
                    >
                      {KOKORO_VOICES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                    </select>
                  </label>
                ) : (
                  <label>
                    Voice
                    <select
                      value={browserVoice}
                      onChange={(e) => {
                        setBrowserVoiceState(e.target.value);
                        playerRef.current?.setBrowserVoice(e.target.value);
                        savePrefs({ browserVoice: e.target.value });
                      }}
                    >
                      <option value="">Default</option>
                      {browserVoices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                    </select>
                  </label>
                )}

                <label>
                  Speed
                  <select
                    value={speed}
                    onChange={(e) => {
                      const s = Number(e.target.value);
                      setSpeedState(s);
                      playerRef.current?.setSpeed(s);
                      savePrefs({ speed: s });
                    }}
                  >
                    {SPEEDS.map((s) => <option key={s} value={s}>{s}×</option>)}
                  </select>
                </label>

                <label>
                  &nbsp;
                  <button className="button button-secondary button-small" onClick={closeBook}>New text</button>
                </label>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** Rendered once per book; highlight is applied directly to the DOM so long books stay fast. */
const BookText = memo(function BookText({ prepared }: { prepared: Prepared }) {
  return (
    <>
      {prepared.paragraphs.map((ids, p) => (
        <p key={p}>
          {ids.map((i) => (
            <span key={i} className="chunk" data-i={i}>
              {prepared.chunks[i].text}{" "}
            </span>
          ))}
        </p>
      ))}
    </>
  );
});
