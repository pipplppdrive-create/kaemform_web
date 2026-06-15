import { promises as fs } from "node:fs";
import path from "node:path";

export interface KaemFormPaths {
  root: string;
  templates: string;
  output: string;
  rekap: string;
  data: string;
}

let paths: KaemFormPaths | null = null;

export async function initFolders(homePath: string): Promise<KaemFormPaths> {
  const root = path.join(homePath, "KaemForm");
  paths = {
    root,
    templates: path.join(root, "templates"),
    output: path.join(root, "output"),
    rekap: path.join(root, "rekap"),
    data: path.join(root, "data"),
  };
  await Promise.all(Object.values(paths).map((folder) => fs.mkdir(folder, { recursive: true })));
  return paths;
}

export function getFolders(): KaemFormPaths {
  if (!paths) throw new Error("Folder KaemForm belum diinisialisasi.");
  return paths;
}

export function sanitizeFilename(value: string): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
  return normalized.slice(0, 80) || "Dokumen";
}

export async function copyIntoFolder(
  sourcePath: string,
  destinationFolder: string,
  preferredName?: string
): Promise<string> {
  const extension = path.extname(sourcePath);
  const base = sanitizeFilename(preferredName ?? path.basename(sourcePath, extension));
  let destination = path.join(destinationFolder, `${base}${extension.toLowerCase()}`);
  let suffix = 2;

  while (await exists(destination)) {
    destination = path.join(destinationFolder, `${base}_${suffix}${extension.toLowerCase()}`);
    suffix += 1;
  }
  await fs.copyFile(sourcePath, destination);
  return destination;
}

export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function timestampFolder(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}
