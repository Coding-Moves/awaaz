import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://awaaz.codingmoves.com"),
  title: "Awaaz — free read-aloud | Coding Moves Lab",
  description:
    "Awaaz reads your text and books aloud with a natural voice. Free, no sign-up, and your text never leaves your device. A Coding Moves Lab experiment.",
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
    description: "Free, private text-to-speech for your books and notes. A Coding Moves Lab experiment.",
    url: "https://awaaz.codingmoves.com",
    siteName: "Awaaz",
    type: "website",
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
            <a className="brand-family" href="https://codingmoves.com/lab/">A Coding Moves Lab experiment</a>
          </div>
          <nav aria-label="Primary navigation">
            <Link href="/#how-it-works">How it works</Link>
            <a href="https://codingmoves.com/lab/contact/">Contact</a>
            <Link href="/privacy/">Privacy</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>© 2026 <a href="https://codingmoves.com/">Coding Moves</a></p>
          <div>
            <a href="https://codingmoves.com/lab/contact/">Contact</a>
            <Link href="/privacy/">Privacy</Link>
            <Link href="/terms/">Terms</Link>
            <a href="https://github.com/Coding-Moves/awaaz">GitHub</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
