/// <reference types="vite/client" />

import type { DesktopAPI } from "./src/shared/types";

declare global {
  interface Window {
    kaemform?: DesktopAPI;
  }
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_KAEMNUR_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
