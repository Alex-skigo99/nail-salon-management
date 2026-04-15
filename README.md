# Nail Salon Management

A full-stack web application for automating beauty business operations — appointment scheduling, client management, staff administration, and more.

The system has two parts: a **client-facing website** (multi-language booking portal) and an **admin panel** for the business owner.

## Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| Backend      | Node.js 24, Express 5, TypeScript             |
| Frontend     | Next.js 16 (App Router), React 19, TypeScript |
| Database     | PostgreSQL + Knex.js                          |
| Auth         | JWT + Google OAuth (next-auth v5)             |
| Styling      | Tailwind CSS v4, shadcn/ui                    |
| Server state | TanStack Query v5                             |
| Forms        | React Hook Form + Zod                         |
| i18n         | next-intl v4 (en / ru / he, RTL)              |
| Cloud        | AWS Lambda, API Gateway, S3, SES, CDK         |
| CI/CD        | GitHub Actions                                |

## Setup

```bash
# Clone and install
git clone https://github.com/Alex-skigo99/nail-salon-management.git
cd nail-salon-management
npm install

# Start both API and frontend in development
npm run dev
```

The frontend will be available at `http://localhost:3000` and the API at `http://localhost:4000`.

## Key Commands

| Task                      | Command                               |
| ------------------------- | ------------------------------------- |
| Start both services       | `npm run dev`                         |
| Start API only            | `npm run dev:api`                     |
| Start frontend only       | `npm run dev:web`                     |
| Run all tests             | `npm test`                            |
| API tests (Vitest)        | `npm run test:api`                    |
| Frontend unit tests       | `npm run test:web`                    |
| Frontend e2e (Playwright) | `cd apps/web && npm run test:e2e`     |
| Lint + test + build       | `npm run build:local`                 |
| DB migrate                | `cd apps/api && npm run db:migrate`   |
| Create admin user         | `cd apps/api && npm run create:admin` |

## Project Structure

```
apps/
  api/        — Express 5 REST API, deployed to AWS Lambda
  web/        — Next.js 16 App Router frontend
infra/        — AWS CDK infrastructure (Lambda + API Gateway + RDS)
```

See [PORTFOLIO_nail_salon_management.md](PORTFOLIO_nail_salon_management.md) for a full technical breakdown.
