# Copilot Instructions — Nail Salon Management

## Project Overview

Full-stack nail salon management app: appointment scheduling, client portal, admin panel, staff management.

**Monorepo** — npm workspaces:

- `apps/api` — Express 5 + TypeScript REST API, deployed to AWS Lambda via `serverless-http`
- `apps/web` — Next.js 16 App Router frontend
- `infra` — AWS CDK infrastructure (Lambda + API Gateway HTTP API + RDS-backed PostgreSQL)

---

## Key Commands

| Task                       | Command                                              |
| -------------------------- | ---------------------------------------------------- |
| Start both services        | `npm run dev` (root)                                 |
| Start API only             | `npm run dev:api`                                    |
| Start frontend only        | `npm run dev:web`                                    |
| Run all tests              | `npm test` (root)                                    |
| API tests (Vitest)         | `npm run test:api` or `cd apps/api && npm test`      |
| Frontend unit tests (Jest) | `npm run test:web` or `cd apps/web && npm test:unit` |
| Frontend e2e (Playwright)  | `cd apps/web && npm run test:e2e`                    |
| Lint + test + build        | `npm run build:local` (pre-commit check)             |
| Generate OpenAPI spec      | `npm run gen:openapi`                                |
| DB migrate (latest)        | `cd apps/api && npm run db:migrate`                  |
| DB rollback                | `cd apps/api && npm run db:rollback`                 |
| Create new migration       | `cd apps/api && npm run db:make -- <name>`           |
| Create admin user          | `cd apps/api && npm run create:admin`                |

---

## Architecture

### Backend (`apps/api/`)

Express 5 app, TypeScript, Knex.js + PostgreSQL.

```
src/
  app.ts          — Express app setup, middleware, routes
  index.ts        — Local server entry
  handler.ts      — Lambda handler (serverless-http)
  migrate.ts      — Migration Lambda handler
  routes/         — Thin Express Routers per resource
  controllers/    — Parse/validate (Zod) → call service → send response
  services/       — Business logic, DB queries via Knex
  middleware/     — authenticate (JWT), requireRole("ADMIN"), error handler
  types/          — Shared DTOs and domain types
migrations/       — Knex migration files (chronological)
```

**Request lifecycle**: `middleware (auth) → route → controller (Zod validation) → service (Knex) → response`

**Auth**: JWT in cookies + `Authorization: Bearer` header. Two roles: `USER` (default) and `ADMIN`.

**Routes** (all under base path):

| Prefix                                                                        | Public | Auth required | Admin only |
| ----------------------------------------------------------------------------- | ------ | ------------- | ---------- |
| `GET /service`                                                                | ✓      |               |            |
| `GET /appointment/slots/available`, `/suggestions`, `/master/:id/empty_slots` | ✓      |               |            |
| `POST /auth/register`, `POST /auth/login`, `POST /auth/google`                | ✓      |               |            |
| `GET /auth/me`, `PATCH /auth/me`, `DELETE /auth/me`                           |        | ✓             |            |
| `GET /appointment/user/:userId`, `PATCH /appointment/:id`                     |        | ✓             |            |
| `POST /master`, `PUT /master/:id`, `DELETE /master/:id`                       |        |               | ✓          |
| `GET /working_hours`, `POST /working_hours`, `DELETE /working_hours`          |        |               | ✓          |
| `POST /service`, `PUT /service/:id`, `DELETE /service/:id`                    |        |               | ✓          |
| `GET /user`, `POST /user`, `PUT /user/:id`, `DELETE /user/:id`                |        |               | ✓          |
| `GET /appointment/master/:id/slots`, `PUT /appointment/:id`                   |        |               | ✓          |

**OpenAPI spec**: `apps/api/openapi.json` — regenerate with `npm run gen:openapi`.

For detailed backend conventions → [backend.instructions.md](.github/instructions/backend.instructions.md)

---

### Frontend (`apps/web/`)

Next.js 16 App Router, React 19, TypeScript.

**Key libraries**: next-auth v5, next-intl v4, TanStack Query v5, React Hook Form + Zod, Tailwind CSS v4, shadcn/ui (Radix), lucide-react.

**App structure**:

```
app/
  page.tsx                    — Root redirect
  home/                       — Public landing page
  contact/                    — Contact form
  (auth)/login/               — next-auth sign-in
  (auth)/signup/              — Registration
  admin/
    calendar/                 — Appointment calendar (admin)
    masters/                  — Master management
    services/                 — Service management
    clients/                  — Client list + search
  client/
    (dashboard)/              — Client home
    appointments/             — Book / view upcoming
    history/                  — Past appointments
    feedback/                 — Feedback submission
    profile/                  — Profile editing
```

**Layouts**: Admin uses `AppSidebar` (collapsible, shadcn Sidebar). Client uses `ClientHeader` + `ClientNav`.

**API calls**: Always use `apps/web/lib/api-client.ts` (Axios, `withCredentials: true`). Never call the API directly.

**Server state**: TanStack Query. Custom hooks live in `apps/web/hooks/` (e.g., `useAppointments`, `useProfile`, `useServices`). Query keys are centralised in `hooks/queryKeys.ts`.

**i18n**: next-intl with three locales: `en`, `ru`, `he` (Hebrew is RTL — root layout sets `dir`). Translation files: `apps/web/locales/{en,ru,he}.json`. **Admin routes do not use i18n.**

**Forms**: React Hook Form + Zod. Use `zodResolver`. See [user memory pattern](../../memories/patterns.md) for optional-schema pitfall.

**UI**: shadcn/ui components (`apps/web/components/ui/`). Icons: lucide-react. Toasts: shadcn `toast`. Loading: shadcn `Spinner`. Mobile: `useIsMobile` hook.

For detailed frontend conventions → [frontend.instructions.md](.github/instructions/frontend.instructions.md)

---

## Testing

| Layer           | Framework              | Pattern                                                |
| --------------- | ---------------------- | ------------------------------------------------------ |
| API integration | Vitest + Supertest     | `apps/api/src/__tests__/routes/`                       |
| API unit        | Vitest                 | `apps/api/src/__tests__/services/`                     |
| Web unit        | Jest + Testing Library | `apps/web/__tests__/`                                  |
| Web e2e         | Playwright (Chromium)  | `apps/web/__e2e__/` — base URL `http://localhost:3000` |

- API test coverage report: `npm run api:coverage-server` → `http://localhost:4001`
- Playwright: 0 retries locally, 2 on CI. Dev server must be running for e2e.

---

## Infrastructure & Deployment

- **Cloud**: AWS (Lambda + API Gateway HTTP API, Node.js 24.x runtime)
- **DB**: PostgreSQL via `DATABASE_URL` env var; migrations run via `MigrationLambda`
- **CI/CD**: GitHub Actions (`.github/workflows/deploy-backend.yml`) — triggers on push to `main`. Runs ESLint + Vitest, then deploys.
- **IaC**: AWS CDK in `infra/`; two Lambdas: `nail-saloon-backend` (512 MB, 15 s) and `MigrationLambda` (1 GB, 5 min).
- **Frontend**: Deployed via separate pipeline (see `_temp/deploy-frontend.yml` for reference).

---

## Conventions & Pitfalls

- **No admin i18n**: Admin routes are English-only. Do not wrap admin strings with `useTranslations`.
- **UUID primary keys**: The users table migrated to UUID in `20260317120000_migrate_users_id_to_uuid.js`. All user-referencing foreign keys are UUID.
- **Migrations are append-only**: Never modify existing migration files. Add a new migration for schema changes.
- **OpenAPI must be regenerated** after any route/schema change: `npm run gen:openapi`.
- **RTL support**: Hebrew locale (`he`) requires `dir="rtl"` on the HTML element — handled by root layout; don't hardcode directional styles.
- **topbar-layout skill**: Use the `topbar-layout` skill when building flex rows where the first item stays left and the rest push right. See [.github/skills/topbar-layout/SKILL.md](.github/skills/topbar-layout/SKILL.md).
