# KaemForm — Database Design

Semua tabel di Supabase Project B (KaemForm).

## Tables

### users

Bridge antara Supabase Auth B dan identitas Kaemnur.

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id),
  kaemnur_uid     UUID UNIQUE NOT NULL,
  email           TEXT NOT NULL,
  name            TEXT,
  avatar_url      TEXT,
  license_cache   JSONB DEFAULT '{}',
  license_synced_at TIMESTAMPTZ,
  settings        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_users_kaemnur ON users(kaemnur_uid);
CREATE INDEX idx_users_email ON users(email);
```

`license_cache` structure:
```json
{
  "type": "pro",
  "expires_at": "2027-01-01T00:00:00Z",
  "trial_started_at": null,
  "storage_addon": {
    "retention_days": 180,
    "expires_at": "2027-01-01T00:00:00Z"
  },
  "limits": {
    "max_workspaces": 5,
    "max_forms_per_workspace": -1,
    "max_responses_per_form": 10000,
    "retention_days": 180
  }
}
```

### workspaces

```sql
CREATE TABLE workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES users(id),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  settings    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
```

### workspace_members (future, buat sekarang)

```sql
CREATE TABLE workspace_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id),
  role          TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner','editor','viewer')),
  invited_at    TIMESTAMPTZ DEFAULT now(),
  accepted_at   TIMESTAMPTZ,
  UNIQUE(workspace_id, user_id)
);
```

### forms

```sql
CREATE TABLE forms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  slug            TEXT UNIQUE NOT NULL,
  schema          JSONB NOT NULL DEFAULT '[]',
  settings        JSONB DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','closed','archived')),
  response_count  INTEGER DEFAULT 0,
  created_by      UUID REFERENCES users(id),
  published_at    TIMESTAMPTZ,
  closed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
CREATE INDEX idx_forms_workspace ON forms(workspace_id);
CREATE INDEX idx_forms_slug ON forms(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_forms_status ON forms(status);
```

### responses

```sql
CREATE TABLE responses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id       UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES users(id),
  data          JSONB NOT NULL,
  metadata      JSONB DEFAULT '{}',
  submitted_at  TIMESTAMPTZ DEFAULT now(),
  expires_at    TIMESTAMPTZ,
  deleted_at    TIMESTAMPTZ
);
CREATE INDEX idx_responses_form ON responses(form_id);
CREATE INDEX idx_responses_submitted ON responses(submitted_at);
CREATE INDEX idx_responses_expires ON responses(expires_at) WHERE deleted_at IS NULL AND expires_at IS NOT NULL;
```

### form_templates

```sql
CREATE TABLE form_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL,
  schema        JSONB NOT NULL,
  settings      JSONB DEFAULT '{}',
  is_system     BOOLEAN DEFAULT false,
  created_by    UUID REFERENCES users(id),
  usage_count   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### retention_logs

```sql
CREATE TABLE retention_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id         UUID NOT NULL REFERENCES forms(id),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id),
  action          TEXT NOT NULL CHECK (action IN ('reminder_sent','deleted','extended')),
  responses_count INTEGER,
  executed_at     TIMESTAMPTZ DEFAULT now()
);
```

## RLS Policies

```sql
-- users: self only
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_self ON users FOR ALL USING (id = auth.uid());

-- workspaces: owner + members
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_access ON workspaces FOR ALL USING (
  owner_id = auth.uid() OR id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);

-- forms: workspace access
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY form_manage ON forms FOR ALL USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
    UNION SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  )
);
CREATE POLICY form_public_read ON forms FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

-- responses: anyone can INSERT to published form, only workspace members can SELECT
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY response_insert ON responses FOR INSERT WITH CHECK (
  form_id IN (SELECT id FROM forms WHERE status = 'published' AND deleted_at IS NULL)
);
CREATE POLICY response_read ON responses FOR SELECT USING (
  form_id IN (
    SELECT f.id FROM forms f JOIN workspaces w ON f.workspace_id = w.id WHERE w.owner_id = auth.uid()
    UNION
    SELECT f.id FROM forms f JOIN workspace_members wm ON f.workspace_id = wm.workspace_id WHERE wm.user_id = auth.uid()
  )
);
```

## JSONB Structures

### Form Schema (`forms.schema`)

Array of field definitions:
```json
[
  {
    "id": "field_abc123",
    "type": "short_text",
    "label": "Nama Lengkap",
    "placeholder": "Masukkan nama",
    "required": true,
    "order": 1,
    "group": null,
    "validation": {"min_length": 2, "max_length": 100},
    "conditions": [
      {"field_id": "field_xyz", "operator": "equals", "value": "Ya", "action": "show"}
    ]
  }
]
```

Field types: `short_text`, `long_text`, `number`, `email`, `phone`, `date`, `time`, `datetime`, `single_choice`, `multiple_choice`, `dropdown`, `scale`, `signature`, `section`, `paragraph`.

Condition operators: `equals`, `not_equals`, `contains`, `is_empty`, `is_not_empty`.
Condition actions: `show`, `hide`.

### Response Data (`responses.data`)

```json
{
  "field_abc123": "John Doe",
  "field_def456": ["opsi1", "opsi3"],
  "field_ghi789": {
    "strokes": [{"points": [{"x":10,"y":20,"t":0,"p":0.5}], "color":"#000000", "width":2}],
    "canvas": {"width": 400, "height": 200}
  }
}
```

### Form Settings (`forms.settings`)

```json
{
  "retention_days": 30,
  "allow_edit_after_submit": false,
  "show_progress_bar": true,
  "success_message": "Terima kasih, respons Anda telah tersimpan.",
  "redirect_url": null,
  "limit_responses": null,
  "one_response_per_ip": false,
  "require_login": false,
  "notification_emails": [],
  "custom_close_message": null,
  "theme": {"primary_color": "#2563EB", "font": "default"}
}
```

## Slug

- Auto: nanoid 8 char lowercase alfanumerik
- Custom (Pro): 3-50 char, `[a-z0-9-]`
- Reserved: app, api, auth, admin, health, status, assets, static, login, register, pricing, about, help, docs, blog
- Immutable setelah form published pertama kali
