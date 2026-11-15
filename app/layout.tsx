import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://awaaz.codingmoves.com"),
  title: "Awaaz — free read-aloud | Coding Moves",
  description:
    "Awaaz reads your text and books aloud with a natural voice. Free, no sign-up, and your text never leaves your device. A Coding Moves product.",
  applicationName: "Awaaz",
  keywords: [
    "text to speech",
    "read aloud",
    "free text to speech",
    "PDF reader",
    "EPUB reader",
    "private text to speech",
  ],
  authors: [{ name: "Coding Moves", url: "https://codingmoves.com" }],
  creator: "Coding Moves",
  publisher: "Coding Moves",
  category: "productivity",
  referrer: "origin-when-cross-origin",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/awaaz-logo/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/awaaz-logo/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/awaaz-logo/apple-touch-icon.png",
  },
  openGraph: {
    title: "Awaaz — paste it, press play, just listen",
    description: "Free, private text-to-speech for your books and notes from Coding Moves.",
    url: "https://awaaz.codingmoves.com",
    siteName: "Awaaz",
    type: "website",
    locale: "en_US",
    images: [{ url: "/awaaz-logo/preview.png", width: 900, height: 360, alt: "Awaaz free read-aloud app" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Awaaz — paste it, press play, just listen",
    description: "Free, private text-to-speech for books, notes and articles.",
    images: ["/awaaz-logo/preview.png"],
  },
};

export const viewport: Viewport = { themeColor: "#f9f7f1", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div>
            <Link className="brand" href="/" aria-label="Awaaz home">
              <Image src="/awaaz-logo/awaaz-wordmark.svg" alt="Awaaz" width={156} height={42} priority />
            </Link>
            <a className="brand-family" href="https://codingmoves.com/products/">A Coding Moves product</a>
          </div>
          <nav aria-label="Primary navigation">
            <Link href="/#how-it-works">How it works</Link>
            <a href="https://codingmoves.com/products/contact/">Contact</a>
            <Link href="/privacy/">Privacy</Link>
            <a href="https://github.com/Coding-Moves/awaaz" target="_blank" rel="noopener noreferrer" aria-label="View Awaaz on GitHub">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .7a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.4-5.5-6A4.7 4.7 0 0 1 5.9 9c-.1-.3-.6-1.6.1-3.3 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 3 .1 3.3a4.7 4.7 0 0 1 1.2 3.3c0 4.6-2.8 5.7-5.5 6 .4.3.8 1 .8 2v3c0 .3.2.7.8.6A12 12 0 0 0 12 .7Z" />
              </svg>
              <span className="github-nav-label visually-hidden">GitHub</span>
            </a>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>© 2026 <a href="https://codingmoves.com/">Coding Moves</a></p>
          <div>
            <a href="https://codingmoves.com/products/contact/">Contact</a>
            <Link href="/privacy/">Privacy</Link>
            <Link href="/terms/">Terms</Link>
            <Link href="/#contribute">Contribute</Link>
            <a href="https://github.com/Coding-Moves" target="_blank" rel="noopener noreferrer">More from Coding Moves</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
