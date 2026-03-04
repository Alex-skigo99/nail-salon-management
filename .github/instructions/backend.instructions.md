---
description: Describe when these instructions should be loaded
applyTo: "apps/api/**/*.ts, apps/api/**/*.js, apps/api/**/*.tsx" # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

Below is a concise explanation of each folder/file in the tree you provided, what responsibilities they typically hold in an Express + TypeScript API, and a few practical notes / best practices.
src/
The application source root. Contains all server-side code. Keep only code that runs in production here (no build artifacts, no tests).
src/index.ts
Entry point that creates and configures the Express app and starts the server.
Typical responsibilities:
Import and configure Express.
Apply global middleware (JSON body parser, CORS, helmet, request logging, rate limiters).
Mount route modules (e.g., app.use('/api/auth', authRouter)).
Mount global error-handling middleware and a 404 handler.
Connect to external services (database, cache) and start listening (server.listen).
Best practice: keep index.ts focused on wiring; avoid business logic here. Export the app (for tests) and have the server start in a separate run block if needed.
src/routes/
Contains route modules that map HTTP endpoints to controller methods. Each file typically exports an Express Router.
Responsibilities:
Define endpoint paths, HTTP verbs, and attach middleware (validation, auth) per route.
Keep route files thin: they should not implement business logic—call controller functions instead.
Common pattern: each file named by resource (auth.ts, appointments.ts, clients.ts, etc.) exports a router configured for that resource.
auth.ts
Routes for authentication and authorization.
Attach auth-related middleware (rate limiting on login, validation of body).
appointments.ts
Routes for working with appointments/scheduling.
Additional endpoints: availability queries, recurring appointment handling, reminders.
Integrations: calendar services, notification sending (email/SMS) are usually handled by services invoked from controllers.
clients.ts
Routes for managing clients/customers.
Typical endpoints:
Sub-resources: client appointments, client notes, history.
Controllers should handle privacy considerations (PII), and business rules (duplicate detection).
inventory.ts
Routes for inventory management (if this system tracks consumables, products, parts).
Typical endpoints:
Services usually handle transactional updates and interactions with the database/warehouse APIs.
staff.ts
Routes for staff / employee management and scheduling.
Typical endpoints:
Role and permission assignment endpoints.
Secure these routes with authorization checks (only admins or managers allowed).
reports.ts
Routes for generating, viewing, and exporting reports.
Reports often involve longer-running jobs; consider queuing (background workers) and providing a job status endpoint.
src/middleware/
Shared request/response middleware functions.
Examples:
Authentication middleware (verify JWT/session).
Authorization/role-check middleware.
Error handler (centralized error-to-response mapping).
Request logging, correlation IDs, body parsers (some of which are global and applied in index.ts).
Best practice: middleware should be composable and stateless. Keep generic utilities here.
src/controllers/
Controller functions that receive Express Request/Response and coordinate the request lifecycle.
Responsibilities:
Parse/validate input (e.g., using Zod).
Call service layer to perform business operations.
Handle success and error responses (formatting, status codes).
Keep controllers thin; do not put business rules or DB queries in controllers—delegate to services.
src/services/
Business logic layer. The core application behavior and domain logic lives here.
Responsibilities:
Implement use-cases (scheduling appointment, checking availability, processing payments).
Interact with persistence layer (repositories/ORM), external APIs (email, calendar), caches, queues.
Perform transactions and complex workflows.
Benefits: easy to unit test services in isolation (no HTTP objects).
src/types/
TypeScript types, interfaces, and shared DTO shapes used across the app.
Examples:
Request/response DTOs, domain models (Appointment, Client, Staff).
Enums for status values, role types.
Types for dependency injection interfaces, repository contracts.
Best practice: keep types stable and import them where needed. Use separate folders for generated types (e.g., from OpenAPI) if applicable.
General flow and interactions
Request -> middleware (auth, logging) -> route -> controller (validation) -> service -> repository/DB/external API -> service -> controller -> response
Error handling: throw domain-specific errors (e.g., NotFoundError, ValidationError) in services or controllers; a centralized error middleware in src/middleware should convert these to HTTP responses.
Suggestions / best practices
Keep responsibilities separated: routes (HTTP), controllers (request/response), services (business), repositories (data), middleware (cross-cutting concerns).
Keep controllers minimal and delegate logic to services.
Use typed request/response DTOs from src/types to ensure compile-time correctness.
Add request validation (Zod) and sanitize inputs.
Protect sensitive routes with auth + role-based authorization.
Use async/await and consistent error handling; avoid swallowing errors.
For long operations (reports, large imports) use a queue system and expose job endpoints.

db tables name locate in src/types/dbSchemaTypes.ts
