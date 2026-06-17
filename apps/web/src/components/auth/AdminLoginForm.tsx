"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Lock, UserRound } from "lucide-react";
import { Button, Input } from "@/components/ui";

export function AdminLoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = (await response.json()) as { redirectTo?: string; error?: string };

      if (!response.ok) {
        setError(
          json.error === "invalid_credentials"
            ? t("errors.invalid_credentials")
            : t("errors.unknown")
        );
        return;
      }

      router.push(json.redirectTo ?? "/app");
      router.refresh();
    } catch {
      setError(t("errors.unknown"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-input border border-error/30 bg-red-50 p-3 text-sm font-medium text-error">
          {error}
        </div>
      )}
      <Input
        label={t("usernameLabel")}
        placeholder={t("usernamePlaceholder")}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
        required
        icon={<UserRound className="h-4 w-4" />}
      />
      <Input
        type="password"
        label={t("passwordLabel")}
        placeholder={t("passwordPlaceholder")}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
        icon={<Lock className="h-4 w-4" />}
      />
      <Button type="submit" size="lg" loading={loading} className="w-full">
        {t("adminLoginButton")}
      </Button>
    </form>
  );
}
