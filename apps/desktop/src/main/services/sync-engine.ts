import type { BrowserWindow } from "electron";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import type {
  DesktopLicense,
  DesktopUser,
  FormRecord,
  ResponseRecord,
  SyncStatus,
  WorkspaceRecord,
} from "../../shared/types";
import {
  getSetting,
  listForms,
  listResponses,
  listWorkspaces,
  replaceForms,
  replaceResponses,
  replaceWorkspaces,
  setSetting,
} from "./db";

function getEnvironment(): { url: string; key: string; kaemnurUrl: string; kaemformWebUrl: string } {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
    kaemnurUrl:
      import.meta.env.VITE_KAEMNUR_URL ||
      process.env.VITE_KAEMNUR_URL ||
      "https://www.kaemnur.com",
    kaemformWebUrl:
      import.meta.env.VITE_KAEMFORM_WEB_URL ||
      process.env.VITE_KAEMFORM_WEB_URL ||
      "https://form.kaemnur.com",
  };
}

function normalizeLicense(value: unknown): DesktopLicense {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const type = raw.type === "pro" || raw.type === "trial" ? raw.type : "free";
  const expiresAt = typeof raw.expires_at === "string" ? raw.expires_at : null;
  const trialStartedAt =
    typeof raw.trial_started_at === "string" ? raw.trial_started_at : null;

  if (type !== "free" && expiresAt && new Date(expiresAt).getTime() < Date.now()) {
    return { type: "free", expires_at: null, trial_started_at: trialStartedAt };
  }

  return { type, expires_at: expiresAt, trial_started_at: trialStartedAt };
}

function toDesktopUser(
  session: Session,
  mode: "cloud" | "local" = "cloud",
  license?: DesktopLicense
): DesktopUser {
  const metadata = session.user.user_metadata;
  return {
    id: session.user.id,
    name:
      String(metadata.full_name || metadata.name || session.user.email?.split("@")[0] || "Pengguna"),
    email: session.user.email ?? "",
    avatarUrl: String(metadata.avatar_url || metadata.picture || "") || undefined,
    mode,
    license: license ?? normalizeLicense(null),
  };
}

export class SyncEngine {
  private client: SupabaseClient | null = null;
  private environment = getEnvironment();
  private status: SyncStatus = { isSyncing: false, lastSynced: null, error: null };
  private window: BrowserWindow | null = null;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    const env = this.environment;
    if (env.url && env.key) {
      this.client = createClient(env.url, env.key, {
        auth: {
          persistSession: false,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          flowType: "implicit",
        },
        realtime: {
          transport:
            WebSocket as unknown as import("@supabase/realtime-js").WebSocketLikeConstructor,
        },
      });
    }
    const lastSynced = getSetting("last_synced");
    this.status.lastSynced = lastSynced || null;
  }

  setWindow(window: BrowserWindow): void {
    this.window = window;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  private emit(): void {
    this.window?.webContents.send("sync:status", this.status);
  }

  private emitAuth(user: DesktopUser | null): void {
    this.window?.webContents.send("auth:changed", user);
  }

  private async getUserLicense(userId: string): Promise<DesktopLicense> {
    if (!this.client) return normalizeLicense(null);
    const { data } = await this.client
      .from("users")
      .select("license_cache")
      .eq("id", userId)
      .maybeSingle();

    return normalizeLicense((data as { license_cache?: unknown } | null)?.license_cache);
  }

  private async toHydratedUser(session: Session): Promise<DesktopUser> {
    return toDesktopUser(session, "cloud", await this.getUserLicense(session.user.id));
  }

  async restoreSession(): Promise<DesktopUser | null> {
    const local = getSetting("local_user");
    if (local) return JSON.parse(local) as DesktopUser;
    if (!this.client) return null;
    const raw = getSetting("auth_session");
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as Session;
      const { data, error } = await this.client.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      if (error || !data.session) return null;
      setSetting("auth_session", JSON.stringify(data.session));
      return this.toHydratedUser(data.session);
    } catch {
      return null;
    }
  }

  async loginUrl(mode: "login" | "register" = "login"): Promise<string | null> {
    if (!this.client) return null;
    const baseUrl = this.environment.kaemnurUrl.replace(/\/$/, "");
    const webCallback = new URL("/auth/callback", this.environment.kaemformWebUrl);
    webCallback.searchParams.set("redirect_to", "kaemform://auth/callback");
    const loginUrl = new URL(
      mode === "register" ? "/register" : "/api/products/kaemform/web-login",
      `${baseUrl}/`
    );

    loginUrl.searchParams.set("product", "kaemform");
    loginUrl.searchParams.set("redirect_to", webCallback.toString());
    if (mode === "register") {
      loginUrl.searchParams.set("next", "/api/products/kaemform/web-login");
    }

    return loginUrl.toString();
  }

  async loginWithPassword(email: string, password: string): Promise<DesktopUser> {
    if (!this.client) {
      throw new Error("Supabase belum dikonfigurasi.");
    }

    const { data, error } = await this.client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !data.session) {
      throw new Error("Email atau kata sandi salah.");
    }

    setSetting("auth_session", JSON.stringify(data.session));
    setSetting("refresh_token", data.session.refresh_token);
    setSetting("local_user", "");
    const user = await this.toHydratedUser(data.session);
    this.emitAuth(user);
    void this.syncAll(false);
    return user;
  }

  async handleCallback(callbackUrl: string): Promise<DesktopUser | null> {
    if (!this.client) return null;
    const parsed = new URL(callbackUrl);
    const hash = new URLSearchParams(parsed.hash.replace(/^#/, ""));
    const accessToken = parsed.searchParams.get("access_token") ?? hash.get("access_token");
    const refreshToken = parsed.searchParams.get("refresh_token") ?? hash.get("refresh_token");
    const code = parsed.searchParams.get("code");
    let session: Session | null = null;

    if (accessToken && refreshToken) {
      const result = await this.client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      session = result.data.session;
      if (result.error) throw result.error;
    } else if (code) {
      const result = await this.client.auth.exchangeCodeForSession(code);
      session = result.data.session;
      if (result.error) throw result.error;
    }

    if (!session) return null;
    setSetting("auth_session", JSON.stringify(session));
    setSetting("refresh_token", session.refresh_token);
    setSetting("local_user", "");
    const user = await this.toHydratedUser(session);
    this.emitAuth(user);
    void this.syncAll(false);
    return user;
  }

  loginLocal(): DesktopUser {
    const user: DesktopUser = {
      id: "local",
      name: "Pengguna Lokal",
      email: "lokal@kaemform.app",
      mode: "local",
      license: normalizeLicense(null),
    };
    setSetting("local_user", JSON.stringify(user));
    setSetting("auth_session", "");
    this.emitAuth(user);
    return user;
  }

  async logout(): Promise<void> {
    if (this.client) await this.client.auth.signOut();
    setSetting("auth_session", "");
    setSetting("refresh_token", "");
    setSetting("local_user", "");
    this.emitAuth(null);
  }

  getStatus(): SyncStatus {
    return this.status;
  }

  async syncAll(incremental = false): Promise<SyncStatus> {
    if (!this.client) {
      this.status = {
        ...this.status,
        isSyncing: false,
        error: "Supabase belum dikonfigurasi. Data lokal tetap tersedia.",
      };
      this.emit();
      return this.status;
    }

    const { data: sessionData } = await this.client.auth.getSession();
    if (!sessionData.session) {
      this.status = { ...this.status, isSyncing: false, error: "Sesi cloud belum tersedia." };
      this.emit();
      return this.status;
    }

    this.status = { ...this.status, isSyncing: true, error: null };
    this.emit();
    try {
      let workspaceQuery = this.client
        .from("workspaces")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: true });
      if (incremental && this.status.lastSynced) {
        workspaceQuery = workspaceQuery.gt("updated_at", this.status.lastSynced);
      }
      const { data: workspaceData, error: workspaceError } = await workspaceQuery;
      if (workspaceError) throw workspaceError;

      const incomingWorkspaces = (workspaceData ?? []) as WorkspaceRecord[];
      if (incomingWorkspaces.length) replaceWorkspaces(incomingWorkspaces);
      const workspaces = listWorkspaces();
      const workspaceIds = workspaces.map((workspace) => workspace.id);

      let formData: FormRecord[] = [];
      if (workspaceIds.length) {
        let formQuery = this.client
          .from("forms")
          .select("*")
          .in("workspace_id", workspaceIds)
          .is("deleted_at", null);
        if (incremental && this.status.lastSynced) {
          formQuery = formQuery.gt("updated_at", this.status.lastSynced);
        }
        const formsResult = await formQuery;
        if (formsResult.error) throw formsResult.error;
        formData = (formsResult.data ?? []) as FormRecord[];
        if (formData.length) replaceForms(formData);
      }

      const allForms = listForms();
      for (const form of allForms) {
        let responseQuery = this.client
          .from("responses")
          .select("*")
          .eq("form_id", form.id)
          .is("deleted_at", null)
          .order("submitted_at", { ascending: false })
          .limit(500);
        if (incremental && this.status.lastSynced) {
          responseQuery = responseQuery.gt("submitted_at", this.status.lastSynced);
        }
        const responseResult = await responseQuery;
        if (responseResult.error) throw responseResult.error;
        const records = (responseResult.data ?? []) as ResponseRecord[];
        if (records.length) replaceResponses(records);
      }

      const formsWithCounts = listForms().map((form) => ({
        ...form,
        response_count: Math.max(form.response_count ?? 0, listResponses(form.id).length),
      }));
      if (formsWithCounts.length) replaceForms(formsWithCounts);
      const enrichedWorkspaces = listWorkspaces().map((workspace) => {
        const workspaceForms = formsWithCounts.filter((form) => form.workspace_id === workspace.id);
        return {
          ...workspace,
          form_count: workspaceForms.length,
          response_count: workspaceForms.reduce((sum, form) => sum + form.response_count, 0),
        };
      });
      if (enrichedWorkspaces.length) replaceWorkspaces(enrichedWorkspaces);

      const now = new Date().toISOString();
      setSetting("last_synced", now);
      this.status = { isSyncing: false, lastSynced: now, error: null };
    } catch (error) {
      this.status = {
        ...this.status,
        isSyncing: false,
        error: error instanceof Error ? error.message : "Sinkronisasi gagal.",
      };
    }
    this.emit();
    return this.status;
  }

  startSchedule(): void {
    if (this.timer) clearInterval(this.timer);
    const minutes = Math.max(Number(getSetting("sync_interval")) || 5, 1);
    this.timer = setInterval(() => void this.syncAll(true), minutes * 60_000);
  }
}
