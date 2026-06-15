import { notFound } from "next/navigation";
import { hasFeature, type Form, type Workspace } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { WorkspaceView } from "@/components/workspace/WorkspaceView";

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const session = await getSessionUser();
  const supabase = await createClient();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("slug", workspaceSlug)
    .is("deleted_at", null)
    .maybeSingle();

  if (!workspace) {
    notFound();
  }

  const { data: forms } = await supabase
    .from("forms")
    .select("*")
    .eq("workspace_id", workspace.id as string)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (
    <WorkspaceView
      workspace={workspace as Workspace}
      forms={(forms ?? []) as Form[]}
      maxForms={session?.license.limits.max_forms_per_workspace ?? 3}
      canCustomSlug={hasFeature(session?.license.limits, "custom_slug")}
    />
  );
}
