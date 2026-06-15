"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Input } from "@/components/ui";

export function CreateWorkspaceForm() {
  const t = useTranslations();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error === "tier_limit_workspaces" ? t("dashboard.limitReached") : t("common.error"));
        return;
      }

      router.push(`/app/w/${json.workspace.slug as string}`);
      router.refresh();
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={t("onboarding.workspaceNameLabel")}
        placeholder={t("onboarding.workspaceNamePlaceholder")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={error ?? undefined}
        required
        maxLength={100}
      />
      <Button type="submit" loading={loading} disabled={!name.trim()}>
        {t("onboarding.createButton")}
      </Button>
    </form>
  );
}
