import { promises as fs } from "node:fs";
import path from "node:path";
import Docxtemplater from "docxtemplater";
import InspectModule from "docxtemplater/js/inspect-module.js";
import PizZip from "pizzip";
import { createPdf } from "./pdf-engine";
import { exists, sanitizeFilename, timestampFolder } from "./file-manager";
import type { GenerateProgress, GenerateResult } from "../../shared/types";

function collectTagKeys(value: unknown, result = new Set<string>()): Set<string> {
  if (!value || typeof value !== "object") return result;
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    result.add(key);
    collectTagKeys(nested, result);
  }
  return result;
}

export async function extractPlaceholders(filePath: string): Promise<string[]> {
  const content = await fs.readFile(filePath);
  try {
    const inspectModule = InspectModule();
    const zip = new PizZip(content);
    new Docxtemplater(zip, {
      modules: [inspectModule],
      paragraphLoop: true,
      linebreaks: true,
    });
    return [...collectTagKeys(inspectModule.getAllTags())]
      .map((tag) => tag.trim())
      .filter(Boolean)
      .sort();
  } catch {
    const zip = new PizZip(content);
    const text = Object.keys(zip.files)
      .filter((name) => name.startsWith("word/") && name.endsWith(".xml"))
      .map((name) => zip.files[name].asText())
      .join(" ");
    return [...new Set([...text.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)].map((match) => match[1]))];
  }
}

function renderTemplate(buffer: Buffer, values: Record<string, unknown>): Buffer {
  const zip = new PizZip(buffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => "",
  });
  doc.render(values);
  return doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" }) as Buffer;
}

async function uniqueFilePath(folder: string, base: string, extension: string): Promise<string> {
  let filePath = path.join(folder, `${base}.${extension}`);
  let suffix = 2;
  while (await exists(filePath)) {
    filePath = path.join(folder, `${base}_${suffix}.${extension}`);
    suffix += 1;
  }
  return filePath;
}

export function previewHtml(
  placeholders: string[],
  record: Record<string, unknown> = {},
  mapping: Record<string, string> = {}
): string {
  const fields = placeholders
    .map((placeholder) => {
      const source = mapping[placeholder] ?? placeholder;
      const value = record[source] ?? `{{${placeholder}}}`;
      return `<div class="row"><span>${placeholder}</span><strong>${String(value ?? "")}</strong></div>`;
    })
    .join("");
  return `<article class="document-preview">
    <header><div class="mark">K</div><div><small>KAEMFORM DOCUMENT</small><h1>Pratinjau Dokumen</h1></div></header>
    <div class="line"></div><section>${fields}</section>
    <footer>Dihasilkan oleh KaemForm Desktop</footer>
  </article>`;
}

export async function generateDocuments(params: {
  templatePath: string;
  templateName: string;
  records: Record<string, unknown>[];
  mapping: Record<string, string>;
  outputFormats: Array<"docx" | "pdf">;
  outputPath: string;
  isCancelled: () => boolean;
  onProgress: (progress: GenerateProgress) => void;
}): Promise<GenerateResult> {
  const targetFolder = path.join(
    params.outputPath,
    sanitizeFilename(params.templateName),
    timestampFolder()
  );
  await fs.mkdir(targetFolder, { recursive: true });
  const templateBuffer = await fs.readFile(params.templatePath);
  const firstSource = Object.values(params.mapping)[0];
  let success = 0;
  let failed = 0;
  const warnings = new Set<string>();

  for (let index = 0; index < params.records.length; index += 1) {
    if (params.isCancelled()) {
      params.onProgress({
        current: index,
        total: params.records.length,
        filename: "",
        status: "cancelled",
      });
      break;
    }

    const record = params.records[index];
    const values = Object.fromEntries(
      Object.entries(params.mapping).map(([placeholder, source]) => [
        placeholder,
        record[source] ?? "",
      ])
    );
    const base = sanitizeFilename(String((firstSource && record[firstSource]) || `Dokumen_${index + 1}`));
    const docxPath = await uniqueFilePath(targetFolder, base, "docx");
    params.onProgress({
      current: index + 1,
      total: params.records.length,
      filename: path.basename(docxPath),
      status: "generating",
    });

    try {
      const rendered = renderTemplate(templateBuffer, values);
      await fs.writeFile(docxPath, rendered);
      if (params.outputFormats.includes("pdf")) {
        const pdf = await createPdf(docxPath, values);
        if (pdf.usedFallback) {
          warnings.add(
            "PDF dibuat dengan fallback. Instal LibreOffice agar layout PDF mengikuti dokumen Word dengan lebih akurat."
          );
        }
      }
      if (!params.outputFormats.includes("docx")) {
        await fs.unlink(docxPath);
      }
      success += 1;
    } catch {
      failed += 1;
    }
  }

  params.onProgress({
    current: success + failed,
    total: params.records.length,
    filename: "",
    status: params.isCancelled() ? "cancelled" : "completed",
  });
  return { success, failed, outputPath: targetFolder, warnings: [...warnings] };
}
