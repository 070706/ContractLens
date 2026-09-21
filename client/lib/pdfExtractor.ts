import * as pdfjs from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

const pdfWorker = new PdfWorker();
pdfjs.GlobalWorkerOptions.workerPort = pdfWorker;

export interface ExtractedPdfPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedPdf {
  pageCount: number;
  pages: ExtractedPdfPage[];
  fullText: string;
}

export class PdfExtractionError extends Error {}

const pageBatchSize = 2;
const pageExtractionTimeoutMs = 30_000;
const localExtractionTimeoutMs = 8_000;

async function extractPageText(
  document: pdfjs.PDFDocumentProxy,
  pageNumber: number,
): Promise<ExtractedPdfPage> {
  const page = await document.getPage(pageNumber);
  const textContentPromise = page.getTextContent();
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new PdfExtractionError(`Page ${pageNumber} took too long to extract.`));
    }, pageExtractionTimeoutMs);
  });
  const content = await Promise.race([textContentPromise, timeout]);
  if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  const text = content.items
    .map((item) => ("str" in item ? item.str : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  page.cleanup();
  return { pageNumber, text };
}

async function extractLocalPdfText(file: File): Promise<ExtractedPdf> {
  try {
    // PDF.js accepts a TypedArray here; passing ArrayBuffer makes valid PDFs fail
    // with its "Invalid PDF binary data" error in current browser builds.
    const data = new Uint8Array(await file.arrayBuffer());
    const document = await pdfjs.getDocument({ data }).promise;
    const pages: ExtractedPdfPage[] = [];
    for (let start = 1; start <= document.numPages; start += pageBatchSize) {
      const batch = Array.from(
        { length: Math.min(pageBatchSize, document.numPages - start + 1) },
        (_, index) => extractPageText(document, start + index),
      );
      pages.push(...(await Promise.all(batch)));
    }
    const fullText = pages
      .map((page) => `Page ${page.pageNumber}:\n${page.text}`)
      .join("\n\n");
    if (
      !document.numPages ||
      fullText.replace(/[^\p{L}\p{N}]/gu, "").length < 40
    ) {
      throw new PdfExtractionError(
        "This PDF does not contain machine-readable text. OCR support is required for scanned/image-only PDFs.",
      );
    }
    return { pageCount: document.numPages, pages, fullText };
  } catch (error) {
    if (error instanceof PdfExtractionError) throw error;
    const detail = error instanceof Error ? error.message : "Unknown PDF.js error";
    throw new PdfExtractionError(`We couldn't read this PDF: ${detail}`);
  }
}

async function extractPdfWithOcr(file: File): Promise<ExtractedPdf> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdfDocument = await pdfjs.getDocument({ data: bytes }).promise;
  const pages: ExtractedPdfPage[] = [];
  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = globalThis.document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) throw new PdfExtractionError("OCR could not prepare a page image.");
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const response = await fetch("/api/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileBase64: dataUrl.slice(dataUrl.indexOf(",") + 1),
        mimeType: "image/jpeg",
        fileName: `contract-page-${pageNumber}.jpg`,
      }),
    });
    const result = (await response.json()) as { error?: string; pages?: ExtractedPdfPage[] };
    if (!response.ok || !result.pages?.length) {
      throw new PdfExtractionError(result.error ?? `OCR could not read page ${pageNumber}.`);
    }
    pages.push({ pageNumber, text: result.pages[0].text.trim() });
    page.cleanup();
    canvas.width = 1;
    canvas.height = 1;
  }
  const fullText = pages.map((page) => `Page ${page.pageNumber}:\n${page.text}`).join("\n\n");
  if (fullText.replace(/[^\p{L}\p{N}]/gu, "").length < 40) {
    throw new PdfExtractionError("OCR could not find enough readable text in this PDF.");
  }
  return { pageCount: pages.length, pages, fullText };
}

export async function extractPdfText(file: File): Promise<ExtractedPdf> {
  try {
    return await Promise.race([
      extractLocalPdfText(file),
      new Promise<ExtractedPdf>((_, reject) => {
        window.setTimeout(() => reject(new PdfExtractionError("Local extraction timed out.")), localExtractionTimeoutMs);
      }),
    ]);
  } catch {
    return extractPdfWithOcr(file);
  }
}
