const DEFAULT_PUBLIC_APP_URL = "https://form.kaemnur.com";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizePublicOrigin(value: string | undefined): string {
  const raw = value?.trim();
  if (!raw) return DEFAULT_PUBLIC_APP_URL;

  try {
    const url = new URL(raw);
    if (LOCAL_HOSTS.has(url.hostname)) return DEFAULT_PUBLIC_APP_URL;
    return url.origin.replace(/\/+$/, "");
  } catch {
    return DEFAULT_PUBLIC_APP_URL;
  }
}

export function getPublicAppUrl(): string {
  return normalizePublicOrigin(process.env.NEXT_PUBLIC_APP_URL);
}

export function buildPublicUrl(path = ""): string {
  const normalizedPath = path.replace(/^\/+/, "");
  const origin = getPublicAppUrl();
  return normalizedPath ? `${origin}/${normalizedPath}` : origin;
}

export function buildPublicFormUrl(slug: string): string {
  return buildPublicUrl(slug);
}
