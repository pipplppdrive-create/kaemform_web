import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { getWorkspacesWithStats } from "@/lib/data/workspaces";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
  const session = await getSessionUser();
  const supabase = await createClient();
  const workspaces = await getWorkspacesWithStats(supabase);

  return (
    <DashboardView
      workspaces={workspaces}
      maxWorkspaces={session?.license.limits.max_workspaces ?? 1}
    />
  );
}
