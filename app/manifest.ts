import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Awaaz — free read-aloud",
    short_name: "Awaaz",
    description: "A free, private read-aloud app for text, books and notes.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f7f1",
    theme_color: "#f9f7f1",
    icons: [
      { src: "/awaaz-logo/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/awaaz-logo/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
