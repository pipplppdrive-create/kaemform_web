export interface WorkspaceSettings {
  [key: string]: unknown;
}

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  settings: WorkspaceSettings;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkspaceWithStats extends Workspace {
  form_count: number;
  response_count: number;
}

export type WorkspaceMemberRole = "owner" | "editor" | "viewer";

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceMemberRole;
  invited_at: string;
  accepted_at: string | null;
}
