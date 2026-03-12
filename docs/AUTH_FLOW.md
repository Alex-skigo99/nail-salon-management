# Authentication System — Implementation Guide

## Architecture Overview

```
┌─────────────────────────┐        ┌──────────────────────────┐
│   Next.js Frontend      │        │   Express API Backend    │
│                         │        │                          │
│  Auth.js v5 (next-auth) │───────▶│  JWT-based auth          │
│  ├─ Credentials provider│        │  ├─ POST /auth/register  │
│  ├─ Google OAuth        │        │  ├─ POST /auth/login     │
│  └─ Session management  │        │  ├─ POST /auth/google    │
│                         │        │  ├─ GET  /auth/me        │
│  Middleware (route       │        │  ├─ POST /auth/logout    │
│   protection)           │        │  └─ Auth middleware       │
└─────────────────────────┘        └──────────────────────────┘
```

## Authentication Flows

### 1. Email + Password Registration

```
User → [Signup Page] → POST /auth/register (Express API)
                      → Express hashes password, creates user (role: USER)
                      → Returns { user, token }
                      → Frontend calls Auth.js signIn("credentials")
                      → Auth.js verifies via POST /auth/login
                      → Session JWT created, stored in HTTP-only cookie
                      → User redirected to home
```

### 2. Email + Password Login

```
User → [Login Page] → Auth.js signIn("credentials")
                     → Auth.js calls POST /auth/login (Express API)
                     → Express verifies bcrypt hash
                     → Returns { user, token }
                     → Auth.js stores user + API token in session JWT
                     → Session cookie set (HTTP-only, 7 days)
                     → User redirected to home
```

### 3. Google OAuth Login/Registration

```
User → [Click "Sign in with Google"] → Auth.js redirects to Google
     → Google authenticates user → Redirects back with profile
     → Auth.js signIn callback calls POST /auth/google (Express API)
     → Express finds user by google_id or email, or creates new
     → Returns { user, token }
     → Auth.js stores user + API token in session JWT
     → User redirected to home
```

### 4. Authenticated API Requests

```
Frontend → useSession() → gets accessToken from session
         → AuthTokenSync component sets Authorization header
         → apiClient sends: Authorization: Bearer <token>
         → Express middleware reads token from header or cookie
         → JWT verified → req.user populated
         → Protected route handler executes
```

### 5. Route Protection

```
Request → Next.js Middleware (middleware.ts)
        → /admin/* routes: require authenticated + ADMIN role
        → /login, /signup: redirect to / if already logged in
        → Other routes: pass through
```

## File Structure

### Backend (apps/api/)

| File                                                    | Purpose                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| `migrations/20260311120000_add_auth_fields_to_users.js` | Adds `google_id`, `image` columns; makes `password` nullable |
| `src/services/authService.ts`                           | Core auth logic: JWT, bcrypt, user CRUD, Google OAuth        |
| `src/controllers/authController.ts`                     | HTTP handlers for auth endpoints                             |
| `src/routes/auth.ts`                                    | Route definitions (`/auth/*`)                                |
| `src/middleware/auth.ts`                                | `authenticate`, `requireRole`, `optionalAuth` middleware     |
| `scripts/create-admin.ts`                               | CLI script to create admin users                             |

### Frontend (apps/web/)

| File                                     | Purpose                                                                |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `auth.ts`                                | Auth.js v5 configuration (providers, callbacks)                        |
| `types/next-auth.d.ts`                   | TypeScript augmentation for Auth.js types                              |
| `app/api/auth/[...nextauth]/route.ts`    | Auth.js API route handler                                              |
| `middleware.ts`                          | Next.js middleware for route protection                                |
| `app/login/page.tsx`                     | Login page with email/password + Google                                |
| `app/signup/page.tsx`                    | Sign-up page with email/password + Google                              |
| `hooks/useAuth.ts`                       | React hooks: `useLogin`, `useRegister`, `useGoogleSignIn`, `useLogout` |
| `components/providers/AuthTokenSync.tsx` | Syncs Auth.js session token to API client                              |
| `components/providers/Providers.tsx`     | Wraps app with SessionProvider                                         |
| `components/UserMenu.tsx`                | User avatar dropdown with sign-out                                     |
| `components/icons/GoogleIcon.tsx`        | Google logo SVG component                                              |

## Environment Variables

### Backend (`apps/api/.env`)

```env
JWT_SECRET=your-secret-key-here       # MUST be strong in production
JWT_EXPIRES_IN=7d                     # Optional, defaults to 7d
```

### Frontend (`apps/web/.env.development`)

```env
AUTH_SECRET=your-auth-secret          # Required by Auth.js. Generate: npx auth secret
AUTH_TRUST_HOST=true                  # Required for development

# Google OAuth (from https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Setup Instructions

### 1. Generate Auth Secret

```bash
cd apps/web
npx auth secret
```

### 2. Run Database Migration

```bash
cd apps/api
npm run db:migrate
```

### 3. Create an Admin User

```bash
cd apps/api
npm run create:admin -- --email admin@example.com --password mysecretpw --name "Admin User"
```

### 4. Configure Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `apps/web/.env.development`

### 5. Start Development

```bash
# Terminal 1 - API
cd apps/api && npm run dev

# Terminal 2 - Frontend
cd apps/web && npm run dev
```

## Security Features

- **Bcrypt** password hashing (12 salt rounds)
- **HTTP-only cookies** for token storage (not accessible via JavaScript)
- **Secure + SameSite** cookie flags in production
- **JWT expiration** (7 days default)
- **Role-based access control** (ADMIN / USER)
- **Input validation** with Zod on all endpoints
- **Automatic session refresh** via Auth.js

## API Endpoints

| Method | Path             | Auth     | Description                     |
| ------ | ---------------- | -------- | ------------------------------- |
| POST   | `/auth/register` | Public   | Register new user (USER role)   |
| POST   | `/auth/login`    | Public   | Login with email/password       |
| POST   | `/auth/google`   | Public   | Authenticate via Google profile |
| GET    | `/auth/me`       | Required | Get current user                |
| POST   | `/auth/logout`   | Public   | Clear auth cookie               |

## Protecting Backend Routes

```typescript
import { authenticate, requireRole } from "../middleware/auth";

// Require any authenticated user
router.get("/profile", authenticate, profileController.get);

// Require ADMIN role
router.delete("/users/:id", authenticate, requireRole("ADMIN"), usersController.delete);

// Optional auth (sets req.user if token present, doesn't reject)
router.get("/public", optionalAuth, publicController.get);
```
