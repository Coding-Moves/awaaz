# Awaaz

**Paste it. Press play. Just listen.**
Awaaz is a free read-aloud web app from **Coding Moves Lab**. Paste text or upload a PDF, EPUB or TXT book, and it reads it aloud in a natural voice. No sign-up is needed.

Live: https://awaaz.codingmoves.com

## How it works
- **Natural voice:** [Kokoro-82M](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX) through [kokoro-js](https://www.npmjs.com/package/kokoro-js). It uses WebGPU with fp32 when available, and falls back to WASM with q8, inside a Web Worker. The model is downloaded once and then cached.
- **Instant fallback:** the browser's built-in Web Speech API. This also covers languages Kokoro doesn't support, such as Urdu, when the device has a voice for them.
- **No waiting:** text is split into short sentence chunks. Chunk 1 starts playing as soon as it's ready, and the next 4 chunks are generated in the background.
- **Private:** there is no backend and no database. Text, files and reading position stay on the device (IndexedDB).
- **Files:** PDF uses pdf.js, EPUB uses JSZip and DOMParser, TXT/MD are read as plain text. Scanned PDFs (images) are not supported.

## Develop
```bash
npm install      # postinstall copies kokoro + pdf.js worker bundles into public/vendor
npm run dev
npm run typecheck && npm run lint && npm run build
```

## Deploy
Vercel with the Next.js preset (no env vars needed). Domain: `awaaz.codingmoves.com` (CNAME → `cname.vercel-dns.com`, DNS only, on Cloudflare).

## License
MIT © Coding Moves
