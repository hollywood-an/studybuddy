import { extractText as extractPdfText, getDocumentProxy } from "unpdf";
import { unzipSync, strFromU8 } from "fflate";

// Thrown for file types we can't pull text out of, so the route can return a
// helpful 400 instead of a generic 500.
export class UnsupportedFileError extends Error {}

// OOXML / OpenDocument formats are zipped XML. We don't need a full DOM — strip
// the tags but turn block-closing tags into newlines first, so paragraphs and
// slides don't run together. Good enough for chunking + flashcard generation.
function xmlToText(xml: string, blockCloseTags: string[]): string {
  let s = xml;
  for (const tag of blockCloseTags) s = s.split(tag).join("\n");
  s = s.replace(/<[^>]+>/g, "");
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function unzip(buffer: Uint8Array): Record<string, Uint8Array> {
  return unzipSync(buffer);
}

function extractDocx(buffer: Uint8Array): string {
  const xml = unzip(buffer)["word/document.xml"];
  return xml ? xmlToText(strFromU8(xml), ["</w:p>", "<w:br/>"]) : "";
}

function extractPptx(buffer: Uint8Array): string {
  const files = unzip(buffer);
  const slides = Object.keys(files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort(
      (a, b) =>
        Number(a.match(/(\d+)/)?.[1] ?? 0) - Number(b.match(/(\d+)/)?.[1] ?? 0)
    );
  return slides
    .map((p) => xmlToText(strFromU8(files[p]), ["</a:p>", "</a:br>"]))
    .join("\n\n");
}

function extractXlsx(buffer: Uint8Array): string {
  // Shared strings hold every text cell value across the workbook.
  const xml = unzip(buffer)["xl/sharedStrings.xml"];
  return xml ? xmlToText(strFromU8(xml), ["</si>"]) : "";
}

const PLAINTEXT_EXTS = ["txt", "md", "markdown", "csv", "tsv", "text", "log"];

export async function extractDocumentText(file: File): Promise<string> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1) : "";

  if (ext === "pdf" || file.type === "application/pdf") {
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractPdfText(pdf, { mergePages: true });
    return text;
  }
  if (ext === "docx") return extractDocx(buffer);
  if (ext === "pptx") return extractPptx(buffer);
  if (ext === "xlsx") return extractXlsx(buffer);
  if (PLAINTEXT_EXTS.includes(ext) || file.type.startsWith("text/")) {
    return strFromU8(buffer);
  }

  throw new UnsupportedFileError(
    `Unsupported file type: .${ext || "unknown"}. Try a PDF, Word (.docx), ` +
      `PowerPoint (.pptx), Excel (.xlsx), or a plain-text file.`
  );
}
