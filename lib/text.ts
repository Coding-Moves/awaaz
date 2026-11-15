export type Chunk = { text: string; para: number };
export type Prepared = { paragraphs: number[][]; chunks: Chunk[] };

const MAX_CHARS = 280; // Kokoro handles ~510 tokens; keep chunks short so audio starts fast
const MIN_CHARS = 30; // merge tiny sentences ("Yes." "Hi.") with the next one
const FIRST_CHUNK_MAX = 100;

/** Normalise pasted / extracted text: fix hyphenated line breaks, keep paragraph breaks. */
export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/­/g, "") // soft hyphens
    .replace(/(\w)-\n(\w)/g, "$1$2") // "exam-\nple" -> "example"
    .replace(/[ \t\f\v ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitParagraphs(text: string): string[] {
  // Blank line = new paragraph. Single newlines inside a paragraph become spaces,
  // unless the text has no blank lines at all (then each line is a paragraph).
  const hasBlankLines = /\n\s*\n/.test(text);
  const parts = hasBlankLines ? text.split(/\n\s*\n/) : text.split("\n");
  return parts.map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
}

function splitSentences(paragraph: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter("en", { granularity: "sentence" });
    return Array.from(seg.segment(paragraph), (s) => s.segment.trim()).filter(Boolean);
  }
  return (paragraph.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) ?? [paragraph]).map((s) => s.trim()).filter(Boolean);
}

function splitLong(sentence: string): string[] {
  if (sentence.length <= MAX_CHARS) return [sentence];
  const out: string[] = [];
  // Prefer breaking at clause punctuation, then at spaces.
  const clauses = sentence.split(/(?<=[,;:—–])\s+/);
  let current = "";
  for (const clause of clauses) {
    if (clause.length > MAX_CHARS) {
      if (current) { out.push(current); current = ""; }
      const words = clause.split(/\s+/);
      for (const w of words) {
        if ((current + " " + w).trim().length > MAX_CHARS && current) { out.push(current); current = w; }
        else current = (current + " " + w).trim();
      }
      continue;
    }
    if ((current + " " + clause).trim().length > MAX_CHARS && current) { out.push(current); current = clause; }
    else current = (current + " " + clause).trim();
  }
  if (current) out.push(current);
  return out;
}

export function prepareText(raw: string): Prepared {
  const paragraphsText = splitParagraphs(cleanText(raw));
  const chunks: Chunk[] = [];
  const paragraphs: number[][] = [];

  paragraphsText.forEach((para, pIndex) => {
    const ids: number[] = [];
    let pending = "";
    const pieces = splitSentences(para).flatMap(splitLong);
    pieces.forEach((piece, i) => {
      const merged = pending ? `${pending} ${piece}` : piece;
      const isLast = i === pieces.length - 1;
      if (merged.length < MIN_CHARS && !isLast && merged.length + (pieces[i + 1]?.length ?? 0) < MAX_CHARS) {
        pending = merged;
        return;
      }
      pending = "";
      ids.push(chunks.length);
      chunks.push({ text: merged, para: pIndex });
    });
    if (ids.length) paragraphs.push(ids);
  });

  const first = chunks[0];
  if (first && first.text.length > FIRST_CHUNK_MAX) {
    const comma = first.text.lastIndexOf(",", FIRST_CHUNK_MAX);
    const space = first.text.lastIndexOf(" ", FIRST_CHUNK_MAX);
    const splitAt = comma > 0 ? comma + 1 : space > 0 ? space : FIRST_CHUNK_MAX;
    const firstText = first.text.slice(0, splitAt).trim();
    const remainder = first.text.slice(splitAt).trim();

    if (firstText && remainder) {
      chunks.splice(0, 1, { text: firstText, para: first.para }, { text: remainder, para: first.para });
      for (const ids of paragraphs) {
        for (let i = 0; i < ids.length; i++) ids[i] += 1;
      }
      paragraphs[0]?.unshift(0);
    }
  }

  return { paragraphs, chunks };
}

/** Text Kokoro should speak (it reads some symbols badly). */
export function speakable(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, "link")
    .replace(/[*_#>`~|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hashText(text: string): string {
  // Small, fast, stable hash (FNV-1a) used as the book id for resume.
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36) + "-" + text.length.toString(36);
}

export function guessTitle(text: string): string {
  const first = cleanText(text).split("\n").find((l) => l.trim().length > 0) ?? "Untitled";
  const t = first.trim();
  return t.length > 60 ? t.slice(0, 57).trimEnd() + "…" : t;
}
