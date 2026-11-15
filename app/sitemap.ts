import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-11-15");

  return [
    { url: "https://awaaz.codingmoves.com", lastModified, changeFrequency: "monthly", priority: 1 },
    { url: "https://awaaz.codingmoves.com/privacy/", lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: "https://awaaz.codingmoves.com/terms/", lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
