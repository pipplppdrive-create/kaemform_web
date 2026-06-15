# KaemForm — Architecture Document

## System Overview

```
KAEMNUR (kaemnur.com)              KAEMFORM (form.kaemnur.com)
Supabase Project A                 Supabase Project B
┌────────────────────┐             ┌────────────────────┐
│ Auth (Google)      │ launch_token │ Auth (Google+Token)│
│ Profil             ├────────────►│ Workspaces         │
│ Lisensi & Store    │ license API  │ Forms              │
│                    │◄────────────┤ Responses          │
└────────────────────┘             └─────────┬──────────┘
                                             │
                                   ┌─────────▼──────────┐
                                   │ KAEMFORM DESKTOP    │
                                   │ Tauri v2            │
                                   │ Sync + Export +     │
                                   │ Backup (SQLite)     │
                                   └────────────────────┘
```

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14+ App Router, TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Drag & Drop | dnd-kit |
| i18n | next-intl (default: id) |
| Backend | Supabase Project B (PostgreSQL + Edge Functions) |
| Auth | Supabase Auth B (Google OAuth + Launch Token) |
| Realtime | Supabase Realtime |
| Email | Resend |
| Hosting | Vercel |
| Desktop | Tauri v2 (Fase 4) |

## Auth Bridge

Dua Supabase project = dua auth system. User ID berbeda antar project.
Solusi: Launch Token Pattern + Direct Login.

### Path 1: Kaemnur → KaemForm (Launch Token)

```
User login Kaemnur → klik "Buka KaemForm"
→ Kaemnur Edge Function generate-launch-token
→ JWT signed HMAC-SHA256 (secret: LAUNCH_TOKEN_SECRET, expiry: 60s)
→ Payload: {kaemnur_uid, email, name, avatar_url, license{type, expires_at, storage_addon}}
→ Redirect: form.kaemnur.com/auth/callback?token=xxx
→ KaemForm validates token → create/update user → set session → /app
```

### Path 2: Direct Google OAuth

```
User buka form.kaemnur.com → klik "Masuk dengan Google"
→ Supabase Auth B → Google OAuth
→ Callback → check user di KaemForm DB
→ Jika belum ada: call Kaemnur API check-license → create user
→ Jika sudah ada: refresh license jika stale (>24 jam)
→ /app
```

### License Sync

License di-cache di KaemForm DB (`users.license_cache`). Refresh:
- Setiap login (launch token atau direct)
- Setiap 24 jam (background)
- Manual (tombol "Refresh Lisensi" di settings)

## Data Flow

```
[Browser] → [Vercel/Next.js]
  ├── SSR: form publik (/{slug})
  ├── API Routes → [Supabase B] (CRUD, auth)
  ├── /auth/callback → validate launch token → create session
  └── License check → [Supabase A] (Kaemnur API)

[Supabase B Edge Functions]
  ├── retention-cleanup (cron harian)
  └── license-sync (cron harian)
```

## Project Structure

```
kaemform/
├── apps/web/                     # Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/[slug]/  # Form publik
│   │   │   ├── app/              # Authenticated routes
│   │   │   │   ├── w/[workspaceSlug]/
│   │   │   │   │   └── f/[formId]/
│   │   │   ├── auth/             # callback, google
│   │   │   └── api/              # API routes
│   │   ├── components/
│   │   │   ├── ui/               # Primitives
│   │   │   ├── form-builder/     # Builder components
│   │   │   ├── form-renderer/    # Public form components
│   │   │   └── shared/           # SignatureCanvas, etc
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── supabase/         # client, server, admin, kaemnur
│   │   │   ├── auth/             # launch-token, license-sync
│   │   │   ├── email/            # resend, templates
│   │   │   └── validations/
│   │   ├── stores/               # Zustand
│   │   ├── types/
│   │   └── messages/             # id.json, en.json
│   └── middleware.ts
├── packages/shared/              # Types, constants, validations
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed.sql
└── docs/                         # Dokumen referensi ini
```

## Routing

| Path | Fungsi | Auth |
|---|---|---|
| `/{slug}` | Form publik | Tidak |
| `/{slug}/success` | Sukses submit | Tidak |
| `/app` | Dashboard | Ya |
| `/app/w/{slug}` | Workspace | Ya |
| `/app/w/{slug}/f/{id}` | Builder | Ya |
| `/app/w/{slug}/f/{id}/responses` | Responses | Ya |
| `/app/w/{slug}/f/{id}/settings` | Settings | Ya |
| `/app/settings` | Akun | Ya |
| `/auth/callback` | Launch token | Tidak |
| `/login` | Login page | Tidak |

Middleware: /app/* → cek session, redirect /login jika tidak ada. /login → redirect /app jika sudah login. /{slug} → pass through ke [slug] page.
