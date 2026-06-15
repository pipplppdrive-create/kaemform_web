-- KaemForm initial schema (docs/DATABASE.md)

create extension if not exists "pgcrypto";

-- ============================================================
-- users — bridge between Supabase Auth B and Kaemnur identity
-- ============================================================
create table users (
  id                uuid primary key references auth.users(id) on delete cascade,
  kaemnur_uid       uuid unique not null,
  email             text not null,
  name              text,
  avatar_url        text,
  license_cache     jsonb default '{}',
  license_synced_at timestamptz,
  settings          jsonb default '{}',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index idx_users_kaemnur on users(kaemnur_uid);
create index idx_users_email on users(email);

-- ============================================================
-- workspaces
-- ============================================================
create table workspaces (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references users(id),
  name        text not null,
  slug        text unique not null,
  settings    jsonb default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  deleted_at  timestamptz
);
create index idx_workspaces_owner on workspaces(owner_id);

-- ============================================================
-- workspace_members (future, created now)
-- ============================================================
create table workspace_members (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  user_id       uuid not null references users(id),
  role          text not null default 'viewer' check (role in ('owner','editor','viewer')),
  invited_at    timestamptz default now(),
  accepted_at   timestamptz,
  unique(workspace_id, user_id)
);

-- ============================================================
-- forms
-- ============================================================
create table forms (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references workspaces(id) on delete cascade,
  title           text not null,
  description     text,
  slug            text unique not null,
  schema          jsonb not null default '[]',
  settings        jsonb default '{}',
  status          text not null default 'draft' check (status in ('draft','published','closed','archived')),
  response_count  integer default 0,
  created_by      uuid references users(id),
  published_at    timestamptz,
  closed_at       timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  deleted_at      timestamptz
);
create index idx_forms_workspace on forms(workspace_id);
create index idx_forms_slug on forms(slug) where deleted_at is null;
create index idx_forms_status on forms(status);

-- ============================================================
-- responses
-- ============================================================
create table responses (
  id            uuid primary key default gen_random_uuid(),
  form_id       uuid not null references forms(id) on delete cascade,
  respondent_id uuid references users(id),
  data          jsonb not null,
  metadata      jsonb default '{}',
  submitted_at  timestamptz default now(),
  expires_at    timestamptz,
  deleted_at    timestamptz
);
create index idx_responses_form on responses(form_id);
create index idx_responses_submitted on responses(submitted_at);
create index idx_responses_expires on responses(expires_at) where deleted_at is null and expires_at is not null;

-- ============================================================
-- form_templates
-- ============================================================
create table form_templates (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  category      text not null,
  schema        jsonb not null,
  settings      jsonb default '{}',
  is_system     boolean default false,
  created_by    uuid references users(id),
  usage_count   integer default 0,
  created_at    timestamptz default now()
);

-- ============================================================
-- retention_logs
-- ============================================================
create table retention_logs (
  id              uuid primary key default gen_random_uuid(),
  form_id         uuid not null references forms(id),
  workspace_id    uuid not null references workspaces(id),
  action          text not null check (action in ('reminder_sent','deleted','extended')),
  responses_count integer,
  executed_at     timestamptz default now()
);
