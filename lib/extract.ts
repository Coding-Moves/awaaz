// Extract plain text from uploaded files, fully in the browser.

export type Extracted = { title: string; text: string };

export async function extractFile(file: File, onProgress?: (msg: string) => void): Promise<Extracted> {
  const name = file.name.toLowerCase();
  const baseTitle = file.name.replace(/\.[^.]+$/, "");

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return { title: baseTitle, text: await extractPdf(file, onProgress) };
  }
  if (name.endsWith(".epub") || file.type === "application/epub+zip") {
    const { title, text } = await extractEpub(file, onProgress);
    return { title: title || baseTitle, text };
  }
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return { title: baseTitle, text: await file.text() };
  }
  throw new Error("Unsupported file. Please upload a PDF, EPUB or TXT file.");
}

async function extractPdf(file: File, onProgress?: (msg: string) => void): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";

  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    onProgress?.(`Reading page ${p} of ${doc.numPages}…`);
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    let pageText = "";
    let lastY: number | null = null;
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = item.transform[5];
      if (lastY !== null && item.height > 0 && Math.abs(y - lastY) > item.height * 1.8) {
        // big vertical gap = new paragraph
        pageText = pageText.replace(/\n*$/, "") + "\n\n";
      } else if (lastY !== null && Math.abs(y - lastY) > 1 && !pageText.endsWith("\n")) {
        pageText += "\n";
      }
      pageText += item.str;
      if (item.hasEOL && !pageText.endsWith("\n")) pageText += "\n";
      lastY = y;
    }
    pages.push(pageText.replace(/^\s*\d+\s*$/gm, "")); // drop lone page numbers
    page.cleanup();
  }
  await doc.destroy();

  const text = pages.join("\n\n");
  if (text.replace(/\s/g, "").length < 20) {
    throw new Error("This PDF has no readable text (it may be scanned images). Try a text-based PDF.");
  }
  return text;
}

async function extractEpub(file: File, onProgress?: (msg: string) => void): Promise<Extracted> {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const parser = new DOMParser();

  const containerXml = await zip.file("META-INF/container.xml")?.async("text");
  if (!containerXml) throw new Error("This EPUB looks broken (no container.xml).");
  const opfPath = parser.parseFromString(containerXml, "application/xml").querySelector("rootfile")?.getAttribute("full-path");
  if (!opfPath) throw new Error("This EPUB looks broken (no package file).");

  const opfText = await zip.file(opfPath)?.async("text");
  if (!opfText) throw new Error("This EPUB looks broken (package file missing).");
  const opf = parser.parseFromString(opfText, "application/xml");
  const baseDir = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1) : "";

  const title = opf.getElementsByTagName("dc:title")[0]?.textContent?.trim() ?? "";

  const manifest = new Map<string, string>();
  opf.querySelectorAll("manifest > item").forEach((item) => {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    if (id && href) manifest.set(id, href);
  });

  const spine = Array.from(opf.querySelectorAll("spine > itemref"))
    .map((ref) => manifest.get(ref.getAttribute("idref") ?? ""))
    .filter((h): h is string => Boolean(h));

  const parts: string[] = [];
  for (let i = 0; i < spine.length; i++) {
    onProgress?.(`Reading chapter ${i + 1} of ${spine.length}…`);
    const path = resolvePath(baseDir, decodeURIComponent(spine[i].split("#")[0]));
    const html = await zip.file(path)?.async("text");
    if (!html) continue;
    parts.push(htmlToText(parser.parseFromString(html, "application/xhtml+xml"), html, parser));
  }

  const text = parts.filter((p) => p.trim()).join("\n\n");
  if (!text.trim()) throw new Error("Couldn't find any text in this EPUB.");
  return { title, text };
}

function resolvePath(base: string, href: string): string {
  const segments = (base + href).split("/");
  const out: string[] = [];
  for (const s of segments) {
    if (s === "..") out.pop();
    else if (s !== "." && s !== "") out.push(s);
  }
  return out.join("/");
}

const BLOCK = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE", "SECTION", "ARTICLE", "TR", "BR", "PRE", "FIGCAPTION", "DT", "DD"]);

function htmlToText(doc: Document, raw: string, parser: DOMParser): string {
  // Some EPUBs aren't valid XHTML; fall back to the forgiving HTML parser.
  let root: Element | null = doc.querySelector("parsererror") ? null : doc.body ?? doc.documentElement;
  if (!root) root = parser.parseFromString(raw, "text/html").body;
  if (!root) return "";
  root.querySelectorAll("script, style, nav, sup, rt").forEach((el) => el.remove());

  let out = "";
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) { out += node.textContent; return; }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = (node as Element).tagName.toUpperCase().replace(/^.*:/, "");
    const block = BLOCK.has(tag);
    if (block) out += "\n\n";
    node.childNodes.forEach(walk);
    if (block) out += "\n\n";
  };
  walk(root);
  return out.replace(/[ \t]*\n[ \t]*/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
