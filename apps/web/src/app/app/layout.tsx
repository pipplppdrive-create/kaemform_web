import { randomUUID } from "crypto";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import type { User } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefaultLicenseCache, resolveEffectiveLicense } from "@/lib/auth/license";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppHeader } from "@/components/layout/AppHeader";
import { Toaster } from "@/components/ui";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) {
    redirect("/login");
  }

  const admin = createAdminClient();
  const { data: existingRow } = await admin
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  let userRow = existingRow;

  if (!userRow) {
    const { data: created, error } = await admin
      .from("users")
      .insert({
        id: authUser.id,
        kaemnur_uid: randomUUID(),
        email: authUser.email,
        name:
          (authUser.user_metadata?.full_name as string | undefined) ??
          (authUser.user_metadata?.name as string | undefined) ??
          null,
        avatar_url: (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
        license_cache: getDefaultLicenseCache(),
        license_synced_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error || !created) {
      redirect("/login?error=unknown");
    }

    userRow = created;
  }

  const user: User = {
    id: userRow.id as string,
    kaemnur_uid: userRow.kaemnur_uid as string,
    email: userRow.email as string,
    name: (userRow.name as string | null) ?? null,
    avatar_url: (userRow.avatar_url as string | null) ?? null,
    license_cache: userRow.license_cache,
    license_synced_at: (userRow.license_synced_at as string | null) ?? null,
    settings: userRow.settings ?? {},
    created_at: userRow.created_at as string,
    updated_at: userRow.updated_at as string,
  };

  const license = resolveEffectiveLicense(user.license_cache);

  return (
    <AuthProvider user={user} license={license}>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </div>
      <Toaster />
    </AuthProvider>
  );
}
