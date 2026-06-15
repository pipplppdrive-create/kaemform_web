-- Fix infinite recursion (42P17) in RLS policies for workspaces / workspace_members.
--
-- The original policies queried `workspace_members` from within the
-- `workspaces` policy and vice versa, creating a dependency cycle that
-- Postgres rejects at evaluation time. We break the cycle with
-- SECURITY DEFINER helper functions that read the tables directly
-- (bypassing RLS for that single lookup), so policy evaluation no
-- longer needs to recurse into the other table's policy.

create or replace function is_workspace_owner(ws_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from workspaces w where w.id = ws_id and w.owner_id = auth.uid()
  );
$$;

create or replace function is_workspace_member(ws_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from workspace_members wm where wm.workspace_id = ws_id and wm.user_id = auth.uid()
  );
$$;

-- workspaces: owner (direct column check, required so INSERT ... WITH CHECK works) + members
drop policy if exists workspace_access on workspaces;
create policy workspace_access on workspaces for all using (
  owner_id = auth.uid() or is_workspace_member(id)
);

-- workspace_members: visible to the workspace owner, fellow members, or the member themselves
drop policy if exists workspace_members_access on workspace_members;
create policy workspace_members_access on workspace_members for all using (
  is_workspace_owner(workspace_id) or is_workspace_member(workspace_id) or user_id = auth.uid()
);

-- forms / retention_logs / responses also referenced workspaces+workspace_members
-- via the now-removed inline subqueries — repoint them at the helper functions too.
drop policy if exists form_manage on forms;
create policy form_manage on forms for all using (
  is_workspace_owner(workspace_id) or is_workspace_member(workspace_id)
);

drop policy if exists retention_logs_read on retention_logs;
create policy retention_logs_read on retention_logs for select using (
  is_workspace_owner(workspace_id) or is_workspace_member(workspace_id)
);

drop policy if exists response_read on responses;
create policy response_read on responses for select using (
  form_id in (
    select f.id from forms f
    where is_workspace_owner(f.workspace_id) or is_workspace_member(f.workspace_id)
  )
);

drop policy if exists response_update on responses;
create policy response_update on responses for update using (
  form_id in (
    select f.id from forms f
    where is_workspace_owner(f.workspace_id) or is_workspace_member(f.workspace_id)
  )
);
