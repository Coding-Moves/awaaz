import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms — Awaaz | Coding Moves" };

export default function Terms() {
  return (
    <article className="legal">
      <p className="eyebrow">Terms</p>
      <h1>Simple terms for a free tool.</h1>
      <p className="updated">Last updated: 15 November 2026</p>

      <h2>Free to use</h2>
      <p>Awaaz is a free Coding Moves product. You can use it for personal and work reading.</p>

      <h2>Your content</h2>
      <p>
        You are responsible for the text and books you use with Awaaz. Only use content you have the
        right to read or listen to.
      </p>

      <h2>No guarantees</h2>
      <p>
        Awaaz is provided as is. Speech may mispronounce some words, and some files (for example
        scanned PDFs) may not contain readable text.
      </p>

      <h2>Open-source parts</h2>
      <p>
        The natural voice uses the Kokoro-82M model (Apache 2.0) via kokoro-js and Transformers.js.
        PDF reading uses pdf.js (Apache 2.0).
      </p>

      <h2>Contact</h2>
      <p>Contact Coding Moves at <a href="https://codingmoves.com/products/contact/">codingmoves.com/products/contact</a>.</p>
    </article>
  );
}
