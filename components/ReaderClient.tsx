"use client";

import dynamic from "next/dynamic";

// The reader uses browser-only APIs (audio, workers, IndexedDB), so it renders on the client only.
const Reader = dynamic(() => import("./Reader"), {
  ssr: false,
  loading: () => (
    <div className="reader" style={{ minHeight: 420, display: "grid", placeItems: "center", color: "var(--muted)" }}>
      Loading reader…
    </div>
  ),
});

export default Reader;
