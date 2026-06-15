-- Row Level Security policies (docs/DATABASE.md)

-- users: self only
alter table users enable row level security;
create policy user_self on users for all using (id = auth.uid());

-- workspaces: owner + members
alter table workspaces enable row level security;
create policy workspace_access on workspaces for all using (
  owner_id = auth.uid() or id in (select workspace_id from workspace_members where user_id = auth.uid())
);

-- workspace_members: visible to members of the same workspace
alter table workspace_members enable row level security;
create policy workspace_members_access on workspace_members for all using (
  workspace_id in (
    select id from workspaces where owner_id = auth.uid()
    union
    select workspace_id from workspace_members where user_id = auth.uid()
  )
);

-- forms: workspace access
alter table forms enable row level security;
create policy form_manage on forms for all using (
  workspace_id in (
    select id from workspaces where owner_id = auth.uid()
    union select workspace_id from workspace_members where user_id = auth.uid()
  )
);
create policy form_public_read on forms for select using (status = 'published' and deleted_at is null);

-- responses: anyone can INSERT to a published form, only workspace members can SELECT
alter table responses enable row level security;
create policy response_insert on responses for insert with check (
  form_id in (select id from forms where status = 'published' and deleted_at is null)
);
create policy response_read on responses for select using (
  form_id in (
    select f.id from forms f join workspaces w on f.workspace_id = w.id where w.owner_id = auth.uid()
    union
    select f.id from forms f join workspace_members wm on f.workspace_id = wm.workspace_id where wm.user_id = auth.uid()
  )
);
create policy response_update on responses for update using (
  form_id in (
    select f.id from forms f join workspaces w on f.workspace_id = w.id where w.owner_id = auth.uid()
    union
    select f.id from forms f join workspace_members wm on f.workspace_id = wm.workspace_id where wm.user_id = auth.uid()
  )
);

-- form_templates: system templates readable by everyone, personal templates by owner
alter table form_templates enable row level security;
create policy template_read on form_templates for select using (
  is_system = true or created_by = auth.uid()
);
create policy template_manage on form_templates for all using (
  created_by = auth.uid()
) with check (
  created_by = auth.uid()
);

-- retention_logs: workspace members can read
alter table retention_logs enable row level security;
create policy retention_logs_read on retention_logs for select using (
  workspace_id in (
    select id from workspaces where owner_id = auth.uid()
    union select workspace_id from workspace_members where user_id = auth.uid()
  )
);
