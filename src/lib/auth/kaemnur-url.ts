const DEFAULT_KAEMNUR_URL = "https://kaemnur.com";
const DEFAULT_KAEMNUR_PRODUCT_URL = "https://www.kaemnur.com/products/KaemForm";
const DEFAULT_WEB_LOGIN_PATH = "/api/products/kaemform/web-login";
const DEFAULT_REGISTER_PATH = "/register";

export type KaemnurAuthMode = "login" | "register";

function getKaemnurBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_KAEMNUR_URL ?? DEFAULT_KAEMNUR_URL).replace(/\/+$/, "");
}

function buildUrl(value: string | undefined, fallbackPath: string): URL {
  const baseUrl = getKaemnurBaseUrl();
  return new URL(value || fallbackPath, `${baseUrl}/`);
}

export function getKaemnurProductUrl(): string {
  return process.env.KAEMNUR_PRODUCT_URL || DEFAULT_KAEMNUR_PRODUCT_URL;
}

export function getKaemnurAuthUrl({
  mode,
  redirectUrl,
}: {
  mode: KaemnurAuthMode;
  redirectUrl: string;
}): string {
  const configuredUrl =
    mode === "register" ? process.env.KAEMNUR_REGISTER_URL : process.env.KAEMNUR_WEB_LOGIN_URL;
  const fallbackPath = mode === "register" ? DEFAULT_REGISTER_PATH : DEFAULT_WEB_LOGIN_PATH;
  const url = buildUrl(configuredUrl, fallbackPath);

  url.searchParams.set("product", "kaemform");
  url.searchParams.set("redirect_to", redirectUrl);

  if (mode === "register" && !configuredUrl) {
    url.searchParams.set("next", DEFAULT_WEB_LOGIN_PATH);
  }

  return url.toString();
}
