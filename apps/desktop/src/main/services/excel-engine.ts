import { promises as fs } from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import type { RekapParams } from "../../shared/types";
import { sanitizeFilename } from "./file-manager";
import { signatureToPng } from "./signature-image";

export async function readSpreadsheet(
  filePath: string
): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
  const workbook = new ExcelJS.Workbook();
  if (path.extname(filePath).toLowerCase() === ".csv") {
    await workbook.csv.readFile(filePath);
  } else {
    await workbook.xlsx.readFile(filePath);
  }
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return { headers: [], rows: [] };

  const headerRow = worksheet.getRow(1);
  const headerValues = Array.isArray(headerRow.values) ? headerRow.values : [];
  const headers = headerValues
    .slice(1)
    .map((value, index) => String(value ?? `Kolom ${index + 1}`).trim());
  const rows: Record<string, unknown>[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = Array.isArray(row.values) ? row.values.slice(1) : [];
    const record = Object.fromEntries(
      headers.map((header, index) => [header, normalizeCell(values[index])])
    );
    if (Object.values(record).some((value) => value !== "" && value != null)) rows.push(record);
  });
  return { headers, rows };
}

function normalizeCell(value: ExcelJS.CellValue): unknown {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object") {
    if ("text" in value) return value.text;
    if ("result" in value) return value.result;
    if ("richText" in value) return value.richText.map((part) => part.text).join("");
  }
  return value ?? "";
}

export async function generateRecap(
  params: RekapParams,
  destinationFolder: string
): Promise<string> {
  await fs.mkdir(destinationFolder, { recursive: true });
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "KaemForm Desktop";
  const dataSheet = workbook.addWorksheet("Data", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  dataSheet.columns = [
    { header: "No.", key: "__number", width: 8 },
    ...params.columns.map((column) => ({ header: column, key: column, width: 18 })),
  ];
  const signatureColumns = new Set<string>();
  const signatureImages: Array<{
    row: number;
    column: number;
    buffer: Buffer;
    width: number;
    height: number;
  }> = [];

  params.rows.forEach((sourceRow, index) => {
    const values: Record<string, unknown> = { __number: index + 1 };
    params.columns.forEach((column, columnIndex) => {
      const signature = signatureToPng(sourceRow[column]);
      if (signature) {
        values[column] = "";
        signatureColumns.add(column);
        signatureImages.push({
          row: index + 2,
          column: columnIndex + 2,
          ...signature,
        });
        return;
      }
      const value = sourceRow[column];
      values[column] =
        Array.isArray(value) ? value.join(", ") : value && typeof value === "object"
          ? JSON.stringify(value)
          : value ?? "";
    });
    dataSheet.addRow(values);
  });
  dataSheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A6FCC" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  dataSheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
      cell.alignment = { vertical: "top", wrapText: true };
    });
  });
  dataSheet.columns.forEach((column) => {
    if (typeof column.key === "string" && signatureColumns.has(column.key)) {
      column.width = 34;
      return;
    }
    let maxLength = String(column.header ?? "").length;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      maxLength = Math.max(maxLength, String(cell.value ?? "").length);
    });
    column.width = Math.min(Math.max(maxLength + 3, 10), 42);
  });

  signatureImages.forEach((image) => {
    const scale = Math.min(220 / image.width, 72 / image.height);
    const displayWidth = Math.round(image.width * scale);
    const displayHeight = Math.round(image.height * scale);
    const imageId = workbook.addImage({
      base64: `data:image/png;base64,${image.buffer.toString("base64")}`,
      extension: "png",
    });
    dataSheet.getRow(image.row).height = Math.max(
      dataSheet.getRow(image.row).height ?? 15,
      displayHeight * 0.75 + 8
    );
    dataSheet.getCell(image.row, image.column).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    dataSheet.addImage(imageId, {
      tl: { col: image.column - 1 + 0.12, row: image.row - 1 + 0.1 },
      ext: { width: displayWidth, height: displayHeight },
      editAs: "oneCell",
    });
  });

  const summary = workbook.addWorksheet("Ringkasan");
  summary.addRows([
    ["Judul", params.title],
    ["Sumber", params.sourceName],
    ["Jumlah data", params.rows.length],
    ["Tanggal generate", new Date().toLocaleString("id-ID")],
  ]);
  summary.getColumn(1).width = 22;
  summary.getColumn(2).width = 48;
  summary.getColumn(1).font = { bold: true, color: { argb: "FF1456A8" } };

  const fileName = `${sanitizeFilename(params.title || "Rekap")}_${Date.now()}.xlsx`;
  const filePath = path.join(destinationFolder, fileName);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}
