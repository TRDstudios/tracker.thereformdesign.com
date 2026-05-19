<!-- BEGIN:nextjs-agent-rules -->
# Next.js: read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.
<!-- END:nextjs-agent-rules -->

# tracker.thereformdesign.com — Project & Task Tracker

## Commands (pnpm)

- `pnpm dev` — dev server (Turbopack default, do NOT add `--turbopack`)
- `pnpm build` — production build (Turbopack; does NOT lint; output in `.next/`)
- `pnpm start` — start production server
- `pnpm lint` — ESLint (NOT `next lint`; that command is removed in Next.js 16)
- `pnpm db:generate` — generate Drizzle migrations after schema changes
- `pnpm db:migrate` — apply pending Drizzle migrations
- `pnpm db:push` — push schema directly (dev only, no migration file)

No test framework is configured.

## Next.js 16 quirks (vs 15)

- **Turbopack is default.** No `--turbopack` flag or `experimental.turbopack` needed. Use `--webpack` to opt out.
- **`middleware` → `proxy`.** Route protection file is `proxy.ts`, not `middleware.ts`. Export `function proxy(request)`.
- **Async Request APIs.** `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` must be `await`ed. Synchronous access removed.
- **`revalidateTag(tag, profile)`** requires a second `cacheLife` profile argument.
- **`cacheLife`/`cacheTag`** are stable (no `unstable_` prefix).
- **`next build` no longer runs lint.**
- **`.next/dev/` for dev output** (separate from `.next/` for build).
- **Parallel routes** require explicit `default.js` or build fails.
- **`connection()`** from `next/server` reads env vars at runtime.
- **`next/legacy/image`** deprecated. Use `next/image`.

## Auth

- **NextAuth.js v5** with Credentials provider (email/password).
- Role-based: `super_admin`, `admin`, `user`.
- Auth config: `lib/auth.ts`. Route protection: `proxy.ts`.
- Users table stores `passwordHash` (bcryptjs). Session via JWT.

## Database

- **Neon PostgreSQL** via Drizzle ORM.
- Connection: `lib/db.ts`. Schema: `lib/db/schema.ts`.
- Migrations in `drizzle/` directory.
- Always run `pnpm db:generate` after schema changes, then `pnpm db:migrate`.

## Directory structure

```
app/
  (app)/          — Authenticated routes (sidebar layout)
  login/          — Login page
  register/       — Registration page
  admin/          — Super admin panel
lib/
  db/
    schema.ts     — Drizzle table definitions
    index.ts      — DB connection
  auth.ts         — NextAuth v5 config
  actions/        — Server actions (auth, projects, tasks, users)
proxy.ts          — Route protection
```

## Path alias

`@/*` maps to `./*` (root).

## Tailwind CSS v4

- Uses `@tailwindcss/postcss` (Tailwind v4). No `tailwind.config.js`.
- Theme tokens in `app/globals.css` via `@theme inline {}`.
- `@import "tailwindcss"` — not `@tailwind base/components/utilities`.

## UI Components (shadcn/ui)

- Custom components in `components/ui/`.
- Run `pnpm dlx shadcn@latest add <component>` to add new ones.
