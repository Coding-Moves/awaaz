// Copies browser-only bundles into public/vendor so they are served from our own domain.
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const out = join(root, "public", "vendor");
mkdirSync(out, { recursive: true });

const files = [
  ["node_modules/kokoro-js/dist/kokoro.web.js", "kokoro.web.js"],
  ["node_modules/pdfjs-dist/build/pdf.worker.min.mjs", "pdf.worker.min.mjs"],
];
for (const [from, to] of files) copyFileSync(join(root, from), join(out, to));

console.log("vendor files copied to public/vendor");
