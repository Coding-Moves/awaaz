# Awaaz

**Paste it. Press play. Just listen.**

<!-- TODO: Add the project logo when public/logo.svg is available. -->

[![License: MIT](https://img.shields.io/badge/license-MIT-347763.svg)](./LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-347763.svg)](https://github.com/Coding-Moves/awaaz/pulls)
[![Good first issues](https://img.shields.io/github/issues/Coding-Moves/awaaz/good%20first%20issue?label=good%20first%20issues)](https://github.com/Coding-Moves/awaaz/issues?q=is%3Aopen+label%3A%22good+first+issue%22)
[![Made by Coding Moves](https://img.shields.io/badge/made%20by-Coding%20Moves-347763.svg)](https://codingmoves.com)

> [!TIP]
> **We need your attention 👀** Docs to improve, voices to test, bugs to squash. Pick a [good first issue](https://github.com/Coding-Moves/awaaz/issues?q=is%3Aopen+label%3A%22good+first+issue%22) and make your first contribution today.

## What it does

Awaaz is a free read-aloud app for books, notes, and articles. Paste text or upload a PDF, EPUB, or TXT file. No account is needed.

## Live demo

Try Awaaz at [awaaz.codingmoves.com](https://awaaz.codingmoves.com).

## Features

- Natural Kokoro voices, with WebGPU when available.
- Browser speech as a quick fallback.
- Sentence highlighting, speed controls, and saved reading position.
- PDF, EPUB, TXT, and Markdown text extraction.
- Private by default. Your text stays on your device.

## How it works

Kokoro runs in a Web Worker, so model work does not freeze the page. Awaaz splits text into short sentences and prefetches the next chunks while you listen. If the natural voice is not available, the Web Speech API provides a browser voice.

There is no backend. Text, files, and reading position stay in IndexedDB on your device. Cross-origin isolation headers allow multi-threaded WASM where the browser supports it.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Before opening a pull request, run:

```bash
npm run typecheck && npm run lint && npm run build
```

## Project structure

```text
app/                  Pages, layout, and theme styles
components/           Reader UI
lib/                  Text, playback, storage, and file helpers
public/tts-worker.js  Kokoro Web Worker
scripts/              Vendor copy script
```

## Contributing

All levels are welcome, including one-line fixes. Read [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

## Privacy

Nothing is uploaded. Awaaz has no account system, analytics, or server that receives your text.

## Credits

Awaaz uses [Kokoro-82M](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX) (Apache-2.0), [kokoro-js](https://www.npmjs.com/package/kokoro-js), [Transformers.js](https://huggingface.co/docs/transformers.js), [pdf.js](https://github.com/mozilla/pdf.js), and [JSZip](https://stuk.github.io/jszip/).

## License

MIT. See [LICENSE](./LICENSE).

## More from Coding Moves

Coding Moves has more open-source projects to explore and improve. Visit [github.com/Coding-Moves](https://github.com/Coding-Moves) and [codingmoves.com](https://codingmoves.com).
