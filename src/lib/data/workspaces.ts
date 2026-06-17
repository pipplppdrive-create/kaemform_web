import type { WorkspaceWithStats } from "@kaemform/shared";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** Lists the current user's workspaces (RLS-scoped) with form/response counts. */
export async function getWorkspacesWithStats(
  supabase: SupabaseServerClient
): Promise<WorkspaceWithStats[]> {
  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error || !workspaces) {
    return [];
  }

  const workspaceIds = workspaces.map((ws) => ws.id as string);

  const { data: forms } = workspaceIds.length
    ? await supabase
        .from("forms")
        .select("workspace_id, response_count")
        .in("workspace_id", workspaceIds)
        .is("deleted_at", null)
    : { data: [] as { workspace_id: string; response_count: number | null }[] };

  const stats = new Map<string, { form_count: number; response_count: number }>();
  for (const form of forms ?? []) {
    const current = stats.get(form.workspace_id as string) ?? { form_count: 0, response_count: 0 };
    current.form_count += 1;
    current.response_count += (form.response_count as number | null) ?? 0;
    stats.set(form.workspace_id as string, current);
  }

  return workspaces.map((ws) => ({
    ...ws,
    form_count: stats.get(ws.id as string)?.form_count ?? 0,
    response_count: stats.get(ws.id as string)?.response_count ?? 0,
  })) as unknown as WorkspaceWithStats[];
}
