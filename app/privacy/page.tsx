import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy — Awaaz | Coding Moves" };

export default function Privacy() {
  return (
    <article className="legal">
      <p className="eyebrow">Privacy</p>
      <h1>Your text stays on your device.</h1>
      <p className="updated">Last updated: 15 November 2026</p>

      <h2>What Awaaz does with your text</h2>
      <p>
        Awaaz turns text into speech inside your own browser. The text you paste and the files you
        upload are processed on your device and are never sent to Coding Moves or any other server.
      </p>

      <h2>What is downloaded</h2>
      <p>
        The first time you use the natural voice, your browser downloads the open-source Kokoro voice
        model (about 90&nbsp;MB) from Hugging Face and the speech runtime from jsDelivr. These are
        stored in your browser&apos;s cache so later visits start faster. Like any website, those
        services can see your IP address when the files are downloaded.
      </p>

      <h2>What is saved</h2>
      <ul>
        <li>Your recent texts and reading position are saved in your browser (IndexedDB) so you can continue later.</li>
        <li>Your chosen voice and speed are saved in your browser&apos;s local storage.</li>
        <li>You can remove any saved text from the &ldquo;Continue listening&rdquo; list, or clear your browser data at any time.</li>
      </ul>

      <h2>Accounts and tracking</h2>
      <p>There are no accounts, no ads, and no tracking cookies.</p>

      <h2>Browser voice</h2>
      <p>
        If you choose the &ldquo;Browser&rdquo; engine, speech is produced by your operating system or
        browser. Some browsers may use their own online voices; check your browser&apos;s privacy
        policy for details.
      </p>

      <h2>Contact</h2>
      <p>Questions? Contact Coding Moves at <a href="https://codingmoves.com/products/contact/">codingmoves.com/products/contact</a>.</p>
    </article>
  );
}
