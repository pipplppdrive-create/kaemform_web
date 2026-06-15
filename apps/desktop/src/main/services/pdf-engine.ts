import { BrowserWindow } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

async function tryLibreOffice(docxPath: string, outputFolder: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(
      "soffice",
      ["--headless", "--convert-to", "pdf", "--outdir", outputFolder, docxPath],
      { windowsHide: true }
    );
    child.once("error", () => resolve(false));
    child.once("exit", (code) => resolve(code === 0));
  });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function createPdf(
  docxPath: string,
  data: Record<string, unknown>
): Promise<{ path: string; usedFallback: boolean }> {
  const outputFolder = path.dirname(docxPath);
  const pdfPath = docxPath.replace(/\.docx$/i, ".pdf");
  if (await tryLibreOffice(docxPath, outputFolder)) {
    return { path: pdfPath, usedFallback: false };
  }

  const rows = Object.entries(data)
    .map(
      ([key, value]) =>
        `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(
          Array.isArray(value) ? value.join(", ") : value
        )}</td></tr>`
    )
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:24mm}body{font-family:Arial,sans-serif;color:#0f172a;font-size:12px}
    h1{font-size:20px;color:#1456a8;margin:0 0 24px}table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #e2e8f0;padding:9px;text-align:left;vertical-align:top}
    th{width:34%;background:#ebf5ff;color:#334155}
  </style></head><body><h1>Dokumen KaemForm</h1><table>${rows}</table></body></html>`;

  const window = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
  try {
    await window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    const buffer = await window.webContents.printToPDF({
      printBackground: true,
      pageSize: "A4",
    });
    await fs.writeFile(pdfPath, buffer);
    return { path: pdfPath, usedFallback: true };
  } finally {
    window.destroy();
  }
}
