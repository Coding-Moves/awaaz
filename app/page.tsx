import Reader from "@/components/ReaderClient";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Awaaz",
      url: "https://awaaz.codingmoves.com",
      description:
        "A free, private read-aloud app for listening to pasted text, PDFs, EPUBs and TXT files in your browser.",
      applicationCategory: "ProductivityApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript and a modern browser.",
      isAccessibleForFree: true,
      image: "https://awaaz.codingmoves.com/awaaz-logo/preview.png",
      author: { "@type": "Organization", name: "Coding Moves", url: "https://codingmoves.com" },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Natural and browser text-to-speech voices",
        "PDF, EPUB and TXT reading",
        "Sentence highlighting and playback controls",
        "Local-only reading progress",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is Awaaz free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Awaaz is free to use with no account, subscription or paywall.",
          },
        },
        {
          "@type": "Question",
          name: "Can I use Awaaz with a PDF or EPUB?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Awaaz can read text-based PDFs, EPUBs and TXT files, as well as text pasted into the reader.",
          },
        },
        {
          "@type": "Question",
          name: "Does Awaaz upload my text?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Awaaz does not upload your text or files. They are processed in your browser and your reading progress is saved on your device. If you choose a browser voice, that browser may use its own online voice service.",
          },
        },
        {
          "@type": "Question",
          name: "Does Awaaz work on phones and tablets?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Awaaz runs in modern mobile and desktop browsers, with a browser voice fallback when the natural voice is unavailable.",
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
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

      <section className="contribute" id="contribute" aria-labelledby="contribute-title">
        <p className="eyebrow">Open source</p>
        <h2 id="contribute-title">Built in the open. Better with you.</h2>
        <p className="contribute-intro">Awaaz is free and MIT-licensed. Found a bug, a word it says wrong, or a typo in the docs? Every small fix helps.</p>
        <div className="capability-grid">
          <article>
            <h3>Spotted a bug?</h3>
            <p><a href="https://github.com/Coding-Moves/awaaz/issues/new?template=bug_report.yml" target="_blank" rel="noopener noreferrer">Tell us what broke.</a></p>
          </article>
          <article>
            <h3>Docs need your attention</h3>
            <p><a href="https://github.com/Coding-Moves/awaaz/issues?q=is%3Aopen+label%3Adocumentation" target="_blank" rel="noopener noreferrer">Fix a typo or explain something better.</a></p>
          </article>
          <article>
            <h3>First time contributing?</h3>
            <p><a href="https://github.com/Coding-Moves/awaaz/issues?q=is%3Aopen+label%3A%22good+first+issue%22" target="_blank" rel="noopener noreferrer">Start with a good first issue.</a></p>
          </article>
          <article>
            <h3>Got an idea?</h3>
            <p><a href="https://github.com/Coding-Moves/awaaz/issues/new?template=feature_request.yml" target="_blank" rel="noopener noreferrer">Suggest a feature or a new voice.</a></p>
          </article>
        </div>
        <div className="hero-actions">
          <a className="button button-primary" href="https://github.com/Coding-Moves/awaaz" target="_blank" rel="noopener noreferrer">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .7a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.4-5.5-6A4.7 4.7 0 0 1 5.9 9c-.1-.3-.6-1.6.1-3.3 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 3 .1 3.3a4.7 4.7 0 0 1 1.2 3.3c0 4.6-2.8 5.7-5.5 6 .4.3.8 1 .8 2v3c0 .3.2.7.8.6A12 12 0 0 0 12 .7Z" />
            </svg>
            View on GitHub
          </a>
          <a className="button button-secondary" href="https://github.com/Coding-Moves/awaaz/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">Read the contributing guide</a>
        </div>
      </section>

      <section className="faq" aria-labelledby="faq-title">
        <div className="section-heading">
          <p className="eyebrow">Good to know</p>
          <h2 id="faq-title">Questions people ask before listening.</h2>
        </div>
        <div className="faq-list">
          <details>
            <summary>Is Awaaz free?</summary>
            <p>Yes. Awaaz is free to use with no account, subscription or paywall.</p>
          </details>
          <details>
            <summary>Can I use Awaaz with a PDF or EPUB?</summary>
            <p>Yes. Awaaz reads text-based PDFs, EPUBs and TXT files, as well as text pasted into the reader.</p>
          </details>
          <details>
            <summary>Does Awaaz upload my text?</summary>
            <p>No. Awaaz does not upload your text or files. They are processed in your browser and your reading progress is saved on your device. If you choose a browser voice, that browser may use its own online voice service.</p>
          </details>
          <details>
            <summary>Does Awaaz work on phones and tablets?</summary>
            <p>Yes. Awaaz works in modern mobile and desktop browsers, with a browser voice fallback when needed.</p>
          </details>
        </div>
      </section>

      <section className="closing" aria-labelledby="closing-title">
        <p className="eyebrow">A Coding Moves product</p>
        <h2 id="closing-title">Awaaz is an open-source read-aloud app, free for everyone.</h2>
        <p>
          No paywalls and no accounts — just a clean reader that respects your time. Have feedback or
          an idea? Coding Moves would love to hear it.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#reader">Start listening</a>
          <a className="button button-secondary" href="#contribute">Contribute on GitHub</a>
        </div>
      </section>
    </>
  );
}
