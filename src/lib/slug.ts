import { customAlphabet } from "nanoid";
import { RESERVED_SLUGS } from "@kaemform/shared";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
const workspaceSuffix = customAlphabet(ALPHABET, 4);
const formId = customAlphabet(ALPHABET, 8);

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function generateWorkspaceSlug(name: string): string {
  const base = slugify(name) || "workspace";
  return `${base}-${workspaceSuffix()}`;
}

export function generateFormSlug(): string {
  return formId();
}

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug);
}
