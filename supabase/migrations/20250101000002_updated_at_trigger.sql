-- Auto-update `updated_at` on row modification

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_users
  before update on users
  for each row execute function set_updated_at();

create trigger set_updated_at_workspaces
  before update on workspaces
  for each row execute function set_updated_at();

create trigger set_updated_at_forms
  before update on forms
  for each row execute function set_updated_at();
