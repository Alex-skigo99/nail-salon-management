# Nail Salon Management — Portfolio Project

## Project Overview

A full-stack web application designed to automate operations for beauty businesses — nail salons, hairdressers, beauty studios, and similar establishments. The system is split into two distinct parts: a **client-facing website** for booking and account management, and an **admin panel** for the business owner to manage the entire operation end-to-end.

---

## Business Logic

### Client-Facing Portal

- **Public landing page** — salon information, photo gallery, price list, and contact form.
- **Appointment booking** — clients select a service provider, date, and available time slot. Booking is available to both **guests** (no account required) and **authenticated users**.
- **Client dashboard** — registered clients can track the status of current bookings, view full appointment history, and manage account details.
- **Multi-language support** — the website supports switching between **English**, **Russian**, and **Hebrew** (Hebrew is RTL).
- **Authentication** — email/password registration and **Google OAuth** sign-in via next-auth v5.

### Admin Panel

- **Staff management** — create, edit, and deactivate masters (service providers), manage their working schedules (per-weekday time windows), and control their booking availability.
- **Services & pricing** — create and edit services with categories (manicure, pedicure, other), prices, and durations.
- **Products** — create and manage products sold as additional offerings for clients.
- **Client management** — searchable client list with full profile view, appointment history per client, and the ability to create and edit client records.
- **Appointment calendar** — weekly and monthly calendar views for visual planning.
- **Appointments table** — filterable and sortable list of all appointments with full CRUD: create, edit, reschedule to a different time or master.
- **Email notifications** — masters can be notified via **AWS SES email** on new bookings, cancellations, updates, client comments, and rescheduling. Each notification type is individually configurable per master.
- **Appointment reminders** — automated reminder system for upcoming appointments.
- **Configurable settings** — booking period settings and other business-level configurations managed via a settings table.

---

## Tech Stack

### Backend (`apps/api`)

| Layer | Technology |
|---|---|
| Runtime | Node.js 24 |
| Framework | Express 5 + TypeScript |
| Database | PostgreSQL |
| Query builder | Knex.js + knex-paginate |
| Migrations | Knex migrations (append-only, chronological) |
| Validation | Zod |
| Auth | JWT (cookie + `Authorization: Bearer`) + Google OAuth |
| Email | AWS SES (`@aws-sdk/client-ses`) |
| File storage | AWS S3 (presigned PUT/GET URLs) |
| Deployment | AWS Lambda via `serverless-http` |
| IaC | AWS CDK (TypeScript) |
| API docs | OpenAPI 3 (swagger-jsdoc, generated spec) |

### Frontend (`apps/web`)

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui (Radix UI primitives) |
| Icons | lucide-react |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod (`zodResolver`) |
| Auth | next-auth v5 (credentials + Google provider) |
| i18n | next-intl v4 (en / ru / he, RTL support) |
| HTTP client | Axios (`withCredentials: true`) |

### Infrastructure

| Concern | Solution |
|---|---|
| Compute | AWS Lambda (Node.js 24.x, 512 MB) |
| API Gateway | AWS API Gateway HTTP API |
| Database | PostgreSQL (RDS-backed, `DATABASE_URL`) |
| Migrations | Dedicated Migration Lambda (1 GB, 5 min timeout) |
| File storage | AWS S3 (private bucket, presigned URLs, CORS) |
| Email | AWS SES |
| IaC | AWS CDK |
| CI/CD | GitHub Actions |

---

## Architecture

### Backend Architecture

```
Request → CORS / cookieParser → Route →
  authenticate (JWT) → requireRole("ADMIN"?) →
  Controller (Zod validation) →
  Service (business logic + Knex queries) →
  Response
```

The project follows a clean **layered architecture**:

- **Routes** — thin Express routers, HTTP verb + path mapping only.
- **Controllers** — parse and validate input (Zod), call the service, return responses.
- **Services** — all business logic, DB queries (Knex), and external API calls.
- **Middleware** — `authenticate` (JWT verification), `requireRole` (RBAC), centralized error handler.
- **Types** — shared TypeScript DTOs and domain types (`dbSchemaTypes.ts`, `appointmentTypes.ts`).

### Frontend Architecture

```
App Router (Next.js) →
  Server Components (layout, page shells) →
  Client Components →
  Custom Hooks (TanStack Query) →
  API Client (Axios) →
  Backend REST API
```

- **Server state** managed by TanStack Query with centralised query keys (`hooks/queryKeys.ts`).
- **Custom hooks** encapsulate all data fetching and mutations (`useAppointments`, `useProfile`, `useServices`, etc.).
- **Forms** use React Hook Form + Zod resolver for type-safe validation.
- **Admin** and **client** sections have separate layouts: `AppSidebar` (collapsible shadcn Sidebar) for admin, `ClientHeader` + `ClientNav` for clients.
- Admin routes are **English-only**; client-facing routes use **next-intl** with three locales.

### Dual Lambda Deployment

The API is deployed as two AWS Lambda functions managed by a single CDK stack:

- **`nail-saloon-backend`** — handles all HTTP requests via API Gateway + `serverless-http`.
- **`MigrationLambda`** — dedicated function for running Knex database migrations, isolated from the main handler.

---

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/deploy-backend.yml`) triggered on every push to `main`:

1. **Test job** — installs dependencies, runs ESLint on all source files, and runs the full Vitest test suite.
2. **Deploy job** (runs only if tests pass):
   - Builds TypeScript to `dist/`.
   - Installs production-only dependencies into the `dist/` bundle.
   - Runs `cdk bootstrap` (idempotent) to ensure the CDK toolkit stack exists.
   - Runs `cdk deploy --require-approval never` to update the Lambda and API Gateway.

All secrets (AWS credentials, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`) are stored in GitHub Actions secrets and injected at deploy time.

---

## Testing

| Layer | Framework | Scope |
|---|---|---|
| API integration | Vitest + Supertest | Route-level HTTP tests (`src/__tests__/routes/`) |
| API unit | Vitest | Service-level logic tests (`src/__tests__/services/`) |
| Frontend unit | Jest + Testing Library | Component and hook tests (`apps/web/__tests__/`) |
| Frontend e2e | Playwright (Chromium) | Full browser flows (`apps/web/__e2e__/`) |

---

## Key Engineering Decisions & Patterns

- **Monorepo with npm workspaces** — `apps/api`, `apps/web`, and `infra` share a single root `package.json` with per-workspace dependencies.
- **Append-only migrations** — Knex migration files are never modified; schema changes always add a new file. UUID primary keys on the `users` table (migrated from integer).
- **Presigned S3 URLs** — the backend generates short-lived presigned PUT URLs for direct browser-to-S3 uploads, avoiding routing binary payloads through Lambda.
- **Per-master configurable email notifications** — each notification event (new/delete/update/reschedule) is a boolean flag on the master record, making the notification system fully opt-in per master per event type.
- **Guest booking** — appointments support both authenticated users (`user_id`) and walk-in / external clients (`guest_name`, `guest_phone`) in the same table.
- **Slot availability engine** — the backend computes available time slots dynamically from working hours and existing bookings, and also exposes a suggestion endpoint for smart slot recommendations.
- **OpenAPI spec** — auto-generated from JSDoc annotations (`npm run gen:openapi`), providing a live API contract for frontend/backend alignment.
- **LocalStack** — a `docker-compose.localstack.yml` is provided for local development of AWS services (S3, SES) without needing real AWS credentials.
- **RTL support** — the Hebrew locale sets `dir="rtl"` on the HTML element at the root layout level; no hard-coded directional styles.

---

## Skills Demonstrated

- Full-stack TypeScript development (Node.js backend + Next.js frontend)
- REST API design and OpenAPI documentation
- PostgreSQL schema design and migration management
- JWT-based authentication with role-based access control (USER / ADMIN)
- OAuth 2.0 integration (Google Sign-In)
- AWS cloud services: Lambda, API Gateway, S3, SES, CDK (IaC)
- Serverless deployment patterns (`serverless-http`, dual Lambda architecture)
- CI/CD pipeline design (GitHub Actions: lint → test → deploy)
- React patterns: App Router, Server/Client components, TanStack Query, React Hook Form + Zod
- Internationalisation (3 locales including RTL)
- Testing strategy: unit, integration, and end-to-end (Vitest, Jest, Playwright)
- Monorepo management (npm workspaces)
