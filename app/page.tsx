import Reader from "@/components/ReaderClient";

export default function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">Free read-aloud for busy people</p>
        <h1 id="hero-title">Paste it. Press play.<br />Just listen.</h1>
        <p className="hero-copy">
          Awaaz reads your books, notes and articles aloud in a natural voice — free, with no
          sign-up, and without your text ever leaving your device.
        </p>
      </section>

      <section className="app-section" aria-label="Reader">
        <Reader />
      </section>

      <section className="promise" aria-label="Awaaz privacy promise">
        <div>
          <p className="eyebrow">Private by design</p>
          <h2>Your books stay yours. Nothing is uploaded.</h2>
        </div>
        <p>
          The voice runs inside your browser. Your text and files are never sent to a server, and
          there is no account to create. Your reading progress is saved only on this device.
        </p>
      </section>

      <section className="steps" id="how-it-works" aria-labelledby="steps-title">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2 id="steps-title">Listen in three simple steps.</h2>
        </div>
        <ol>
          <li>
            <span>01</span>
            <h3>Paste or upload</h3>
            <p>Paste any text, or drop in a PDF, EPUB or TXT book. Awaaz pulls out the words for you.</p>
          </li>
          <li>
            <span>02</span>
            <h3>Press play</h3>
            <p>Reading starts in seconds. The next sentences are prepared in the background, so it never stops to wait.</p>
          </li>
          <li>
            <span>03</span>
            <h3>Pick up where you left off</h3>
            <p>Close the tab anytime. Your place is remembered, and you can continue from the same sentence later.</p>
          </li>
        </ol>
      </section>

      <section className="capabilities" aria-labelledby="capabilities-title">
        <p className="eyebrow">Made for real reading</p>
        <h2 id="capabilities-title">Simple, natural, and in your control.</h2>
        <div className="capability-grid">
          <article>
            <h3>Natural voices</h3>
            <p>Eleven US and UK voices from the open Kokoro model, plus your browser&apos;s own voices as an instant option.</p>
          </article>
          <article>
            <h3>Follow along</h3>
            <p>The sentence being read is highlighted. Tap any sentence to jump there, and change speed from 0.75× to 2×.</p>
          </article>
          <article>
            <h3>Works with books</h3>
            <p>Text-based PDFs and EPUBs are read chapter by chapter. Use the space bar to play or pause, and arrow keys to skip.</p>
          </article>
        </div>
      </section>

      <section className="closing" aria-labelledby="closing-title">
        <p className="eyebrow">Coding Moves Lab</p>
        <h2 id="closing-title">Awaaz is an open-source experiment, free for everyone.</h2>
        <p>
          No paywalls and no accounts — just a clean reader that respects your time. Have feedback or
          an idea? The Lab would love to hear it.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#reader">Start listening</a>
          <a className="button button-secondary" href="https://codingmoves.com/lab/contact/">Contact the Lab</a>
        </div>
      </section>
    </>
  );
}
