"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Lock, Mail, UserRound } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

function resolveAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "invalid_credentials";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "email_in_use";
  }
  if (lower.includes("password") && (lower.includes("weak") || lower.includes("short"))) {
    return "weak_password";
  }

  return "unknown";
}

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (password.length < 8) {
      setError(t("errors.weak_password"));
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: trimmedName ? { name: trimmedName } : undefined,
            emailRedirectTo: `${window.location.origin}/auth/supabase/callback`,
          },
        });

        if (signUpError) {
          setError(t(`errors.${resolveAuthError(signUpError.message)}`));
          return;
        }

        if (data.user?.identities && data.user.identities.length === 0) {
          setError(t("errors.email_in_use"));
          return;
        }

        if (!data.session) {
          setMode("login");
          setNotice(t("signupSuccess"));
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (signInError) {
          setError(t(`errors.${resolveAuthError(signInError.message)}`));
          return;
        }
      }

      router.push("/app");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t("loginTitle")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {t("loginSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-2 rounded-input bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
            setNotice(null);
          }}
          className={`h-9 rounded-input text-sm font-semibold transition ${
            !isRegister ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {t("loginMode")}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
            setNotice(null);
          }}
          className={`h-9 rounded-input text-sm font-semibold transition ${
            isRegister ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {t("registerMode")}
        </button>
      </div>

      {(error || notice) && (
        <div
          className={`rounded-input border p-3 text-sm font-medium ${
            error
              ? "border-error/30 bg-red-50 text-error"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error ?? notice}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {isRegister && (
          <Input
            label={t("nameLabel")}
            placeholder={t("namePlaceholder")}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            icon={<UserRound className="h-4 w-4" />}
          />
        )}
        <Input
          type="email"
          label={t("emailLabel")}
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          icon={<Mail className="h-4 w-4" />}
        />
        <Input
          type="password"
          label={t("passwordLabel")}
          placeholder={t("passwordPlaceholder")}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={8}
          required
          icon={<Lock className="h-4 w-4" />}
        />
        <Button type="submit" size="lg" loading={loading} className="w-full">
          {isRegister ? t("registerButton") : t("loginButton")}
        </Button>
      </form>

      <p className="text-center text-xs leading-5 text-slate-500">{t("manualInfo")}</p>
    </div>
  );
}
