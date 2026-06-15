# Prompt Phase 1 — Project Setup, Auth, Workspace, Form CRUD

Referensi: baca semua file di folder docs/ sebelum mulai. Khususnya:
- docs/ARCHITECTURE.md → struktur project, tech stack, routing
- docs/DATABASE.md → semua SQL migrations, RLS, JSONB structures
- docs/API-CONTRACT.md → env variables, API routes
- docs/UI-SPEC.md → design system, shared components
- docs/BUSINESS.md → tier limits, templates seed data

---

## A. Project Setup

Buat monorepo Turborepo sesuai docs/ARCHITECTURE.md "Project Structure":

- apps/web/ → Next.js 14+ App Router, TypeScript strict, Tailwind CSS
- packages/shared/ → types, constants, validations (shared web + desktop nanti)
- Install: zustand, dnd-kit, next-intl, nanoid, jose, @radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-toast, @radix-ui/react-switch, @radix-ui/react-popover

Tailwind config: warna sesuai docs/UI-SPEC.md "Design System". Font Inter via Google Fonts.

### i18n (next-intl)

- Default locale: "id", locales: ["id","en"]
- Routing tanpa prefix (tidak perlu /id/ atau /en/)
- Buat src/messages/id.json dengan translation keys lengkap untuk semua teks UI yang dibutuhkan aplikasi: common actions (simpan, batal, hapus, dll), auth (masuk, keluar), workspace, form builder (semua field type labels, properties), responses, public form, signature, retention, license, onboarding. Pastikan lengkap — tidak ada hardcoded string Indonesia di komponen.
- Buat src/messages/en.json sebagai copy struktur dengan terjemahan English.
- Setup: getRequestConfig di lib/i18n/request.ts, NextIntlClientProvider di root layout, middleware i18n.

### Supabase Clients

Di src/lib/supabase/:
- client.ts — createBrowserClient (client-side)
- server.ts — createServerClient (server components, API routes)
- admin.ts — service_role client (create user, bypass RLS)
- kaemnur.ts — fetch wrapper ke Kaemnur API (KAEMNUR_API_URL + KAEMNUR_API_KEY header)

Buat .env.example sesuai docs/API-CONTRACT.md "Env Variables".

### Database

Buat supabase/ folder dengan Supabase CLI config. Buat semua migration files sesuai docs/DATABASE.md — semua CREATE TABLE, CREATE INDEX, dan semua RLS policies. Copy persis dari dokumen itu. Tambahkan trigger function untuk auto-update updated_at.

Buat supabase/seed.sql: 8 system templates sesuai docs/BUSINESS.md "8 System Templates" — setiap template punya schema JSONB realistis 5-10 field yang relevan. Set is_system=true.

### Shared Package

Di packages/shared/src/:
- types/ → FormField, FieldType, FormSchema, FormSettings, FormStatus, ResponseData, SignatureData, Workspace, WorkspaceSettings, User, LicenseType, LicenseCache, StorageAddon, LaunchTokenPayload
- constants/ → FIELD_TYPES (array dengan label id/en, icon name, default config), RESERVED_SLUGS, TIER_LIMITS (per tier: max_workspaces, max_forms, max_responses, retention_days, features[])
- validations/ → Zod schemas: createWorkspace, createForm, submitResponse, formSettings

### Routing Skeleton

Buat semua route files sesuai docs/ARCHITECTURE.md "Routing" — setiap page sebagai placeholder dulu (heading + breadcrumb). middleware.ts: /app/* cek session redirect /login, /login redirect /app jika authenticated, sisanya pass through.

### Shared UI Components

Buat komponen dasar di src/components/ui/ sesuai docs/UI-SPEC.md "Shared UI Components": Button (variant: primary/secondary/ghost/danger, size: sm/md/lg, loading state), Input (label, error, description), Card, Badge (variant per form status), Modal (Radix Dialog), DropdownMenu (Radix), Toast (Radix), EmptyState (icon/illustration + message + CTA), Skeleton, Spinner. Semua teks via useTranslations().

---

## B. Auth System

Implementasikan sesuai docs/ARCHITECTURE.md "Auth Bridge".

### Launch Token Callback — /auth/callback (GET route)

1. Ambil token dari query param
2. Validate JWT: jose library, verify HMAC-SHA256 dengan LAUNCH_TOKEN_SECRET, cek exp
3. Invalid/expired → redirect /login?error=invalid_token
4. Extract payload (LaunchTokenPayload)
5. Lookup tabel users by kaemnur_uid:
   - Baru: admin.auth.admin.createUser({email, email_confirm:true, user_metadata:{name,avatar_url,kaemnur_uid}}) → insert ke tabel users (id, kaemnur_uid, email, name, avatar_url, license_cache dari payload, license_synced_at) → generate magic link → redirect
   - Existing: update license_cache, license_synced_at, name, avatar_url → set session → redirect /app

### Google OAuth — /auth/google + /auth/google/callback

- /auth/google: supabase.auth.signInWithOAuth({provider:'google', options:{redirectTo}})
- Callback: setelah session set, cek user di tabel users by email:
  - Tidak ada: call kaemnur.ts check-license API by email → jika found: create user, cache license → /app. Jika not found: /login?error=not_registered
  - Ada: cek license_synced_at > 24 jam → refresh via API → /app

### Auth Guard — /app/layout.tsx

Server component: getUser() → jika null redirect /login. Fetch user + license_cache dari tabel users. Cek expiry: jika license expired, update cache type→"free". Pass user data via React Context.

### Hooks

- useAuth() → user, license, isLoading, logout()
- useLicense() → isPro(), isTrial(), isFree(), canUseFeature(key), tierLimits. Feature keys sesuai docs/BUSINESS.md "Feature Flags".

### License Sync Utility

src/lib/auth/license-sync.ts: async function syncLicense(kaemnurUid) → call Kaemnur API → update users.license_cache + license_synced_at → return updated cache.

### Login Page — /login

"Masuk ke KaemForm" + tombol Google OAuth + link "Masuk dari Kaemnur" (informational, link ke kaemnur.com). Error messages dari query params. Semua teks i18n.

### Logout — /auth/logout

signOut() + redirect /login.

---

## C. Workspace CRUD & Dashboard

### API Routes

Sesuai docs/API-CONTRACT.md "Workspaces":
- GET/POST /api/workspaces — list (termasuk COUNT form dan response per workspace) + create (validate name, generate slug via slugify+nanoid 4 char, enforce tier limit max_workspaces)
- GET/PATCH/DELETE /api/workspaces/[id] — detail, update, soft delete

Semua: validasi auth + ownership.

### Onboarding — /app (Dashboard)

Cek workspace count:
- 0: halaman onboarding sesuai docs/UI-SPEC.md → input nama → create workspace → redirect /app/w/{slug}
- ≥1: grid workspace cards (nama, form count, response count, created_at) + tombol "Buat Workspace Baru" (enforce limit)

### Workspace Dashboard — /app/w/[workspaceSlug]

- Header: nama workspace + settings gear
- Tombol "Buat Formulir" → dropdown: "Kosong" | "Dari Template"
- Grid/list form cards: judul, status badge, response count, tanggal, dropdown menu (Edit, Respons, Settings, Duplikat, Hapus)
- Filter by status, sort by terbaru/judul/respons
- Empty state jika belum ada form

### Form CRUD API Routes

Sesuai docs/API-CONTRACT.md "Forms":
- POST /api/forms — create (workspace_id, title, template_id opsional, generate slug nanoid 8 char, enforce limit)
- GET/PATCH/DELETE /api/forms/[id]
- POST /api/forms/[id]/publish — set published+published_at (validasi min 1 field, slug immutable setelah ini)
- POST /api/forms/[id]/close — set closed+closed_at
- POST /api/forms/[id]/duplicate — copy form, new slug, status=draft, count=0

### Template Selection Modal

Fetch form_templates, tampilkan grid cards (nama, deskripsi, field count). Klik → create form dari template → redirect ke builder. Tampilkan semua template untuk Trial/Pro, hanya template 1,4,7,8 untuk Free (sesuai docs/BUSINESS.md).

---

## Verifikasi Phase 1

1. `npm run dev` berjalan tanpa error
2. /login tampil, Google OAuth berfungsi
3. Launch token callback: buat test token via script (lihat Setup Guide), buka URL → user dibuat → redirect /app
4. Onboarding: user baru → buat workspace → redirect
5. Dashboard: workspace cards tampil
6. Workspace: buat form kosong dan dari template → form cards tampil
7. CRUD form: create, update title, duplicate, soft delete semua berfungsi
8. Tier limit: Free user tidak bisa buat workspace ke-2
9. Semua teks UI dalam Bahasa Indonesia via i18n
