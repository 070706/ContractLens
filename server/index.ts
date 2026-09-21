import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
    app.use(express.json({ limit: "35mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  
    app.post("/api/ocr", async (req, res) => {
      const apiKey = process.env.OCR_SPACE_API_KEY ?? process.env.VITE_OCR_SPACE_API_KEY;
      const fileBase64 = req.body?.fileBase64;
      const mimeType = typeof req.body?.mimeType === "string" ? req.body.mimeType : "application/pdf";
      const fileName = typeof req.body?.fileName === "string" ? req.body.fileName : "contract.pdf";
      if (!apiKey) {
        res.status(503).json({ error: "OCR is not configured on the server." });
        return;
      }
      if (typeof fileBase64 !== "string" || fileBase64.length === 0) {
        res.status(400).json({ error: "A PDF payload is required." });
        return;
      }

      try {
        const form = new FormData();
        form.append("apikey", apiKey);
        form.append("language", "eng");
        form.append("isOverlayRequired", "false");
        form.append("OCREngine", "2");
        form.append("file", new Blob([Buffer.from(fileBase64, "base64")], { type: mimeType }), fileName);
        const response = await fetch("https://api.ocr.space/parse/image", { method: "POST", body: form });
        const result = await response.json() as { IsErroredOnProcessing?: boolean; ErrorMessage?: string | string[]; ParsedResults?: Array<{ ParsedText?: string }> };
        if (!response.ok || result.IsErroredOnProcessing) {
          const message = Array.isArray(result.ErrorMessage) ? result.ErrorMessage.join(" ") : result.ErrorMessage;
          res.status(502).json({ error: message ?? "OCR processing failed." });
          return;
        }
        res.json({ pages: (result.ParsedResults ?? []).map((page, index) => ({ pageNumber: index + 1, text: page.ParsedText ?? "" })) });
      } catch (error) {
        res.status(502).json({ error: error instanceof Error ? error.message : "OCR processing failed." });
      }
    });

  return app;
}
