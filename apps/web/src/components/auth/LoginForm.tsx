"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Mode = "login" | "register";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (signInError) {
        setError(t("errors.invalid_credentials"));
        return;
      }
      router.push("/app");
      router.refresh();
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      setLoading(false);
      if (signUpError) {
        if (signUpError.message.toLowerCase().includes("password")) {
          setError(t("errors.weak_password"));
        } else if (signUpError.message.toLowerCase().includes("registered")) {
          setError(t("errors.email_in_use"));
        } else {
          setError(t("errors.unknown"));
        }
        return;
      }
      if (data.session) {
        router.push("/app");
        router.refresh();
      } else {
        setInfo(t("registerSubtitle"));
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {mode === "login" ? t("loginTitle") : t("registerTitle")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {mode === "login" ? t("loginSubtitle") : t("registerSubtitle")}
        </p>
      </div>

      <a
        href="/auth/google"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-input border border-border bg-white text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-px hover:border-primary-200 hover:bg-primary-50"
      >
        {t("continueWithGoogle")}
      </a>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-border" />
        {t("or")}
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          label={t("emailLabel")}
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          label={t("passwordLabel")}
          placeholder={t("passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        {error && <p className="text-sm text-error">{error}</p>}
        {info && <p className="text-sm text-success">{info}</p>}
        <Button type="submit" loading={loading} className="w-full">
          {mode === "login" ? t("loginButton") : t("registerButton")}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        {mode === "login" ? t("noAccount") : t("haveAccount")}{" "}
        <button
          type="button"
          className="font-medium text-primary-600 hover:underline"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "login" ? t("createAccount") : t("loginButton")}
        </button>
      </p>

      <div className="rounded-card border border-primary-100 bg-primary-50 p-3 text-center text-xs leading-5 text-primary-800">
        {t("kaemnurInfo")}
      </div>
    </div>
  );
}
