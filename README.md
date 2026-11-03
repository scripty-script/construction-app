# Construction App

A construction project management app built with **Next.js 16 (App Router)**, **Drizzle ORM** and **PostgreSQL**. Admins and project managers create projects, manage the company team, and assign team members to projects.

- [Getting started](#getting-started)
- [Backend overview](#backend-overview)
  - [Architecture](#architecture)
  - [Data model](#data-model)
  - [API endpoints](#api-endpoints)
  - [Authentication and authorization](#authentication-and-authorization)
  - [Where the data lives and how it is hosted](#where-the-data-lives-and-how-it-is-hosted)
  - [Looking at real records](#looking-at-real-records)

---

## Getting started

Requirements: Node.js 20+ and a PostgreSQL database.

1. Create a `.env` file in the project root:

   ```env
   DATABASE_URL=postgres://user:password@127.0.0.1:5432/construction_app
   SESSION_SECRET=<a long random string, e.g. `openssl rand -base64 32`>
   SEED_USER_EMAIL=admin@example.com
   SEED_USER_PASSWORD=<password for the seeded admin>
   ```

2. Install dependencies, run the migrations and seed the first admin user:

   ```bash
   npm install
   npm run db:migrate   # applies drizzle/migrations/* to DATABASE_URL
   npm run db:seed      # creates the admin from SEED_USER_EMAIL / SEED_USER_PASSWORD
   ```

3. Start the dev server and open [http://localhost:3000](http://localhost:3000):

   ```bash
   npm run dev
   ```

| Script                | What it does                                              |
| --------------------- | --------------------------------------------------------- |
| `npm run dev`         | Start the Next.js dev server                              |
| `npm run build`       | Production build                                          |
| `npm run start`       | Serve the production build                                |
| `npm run db:generate` | Generate a new SQL migration from changes in the schema   |
| `npm run db:migrate`  | Apply pending migrations                                  |
| `npm run db:push`     | Push the schema straight to the database (dev only)       |
| `npm run db:seed`     | Seed the initial admin user                               |

---

## Backend overview

### Architecture

The app has no separate backend service. The "backend" is the server side of the Next.js app:

```
Browser
  │
  ├─ proxy.ts                 Runs on every request. Redirects guests away from
  │                           protected pages and signed-in users away from /login.
  │
  ├─ Server Components        Pages under app/ read data on the server
  │   (app/**/page.tsx)       through lib/data/* (queries) and lib/dal.ts (current user).
  │
  ├─ Server Actions           All writes (create/update/delete) live in actions/*.
  │   (actions/*.ts)          Each one: authenticate → authorize (policies/*) →
  │                           validate (zod, lib/definitions/*) → write (Drizzle).
  │
  └─ Route Handler            app/session/invalidate/route.ts clears a stale session cookie.
        │
        ▼
  Drizzle ORM (drizzle/db.ts, postgres-js driver)
        │
        ▼
  PostgreSQL
```

| Folder              | Responsibility                                                                 |
| ------------------- | ------------------------------------------------------------------------------ |
| `drizzle/schema/`   | Table definitions (source of truth for the data model)                         |
| `drizzle/migrations/` | Generated SQL migrations, one folder per change                              |
| `drizzle/relations.ts` | Relations used by Drizzle's relational query API                            |
| `drizzle/seeders/`  | Seed scripts (initial admin user)                                              |
| `actions/`          | Server Actions — every mutation in the app                                     |
| `lib/data/`         | Read queries (lists with search + pagination, single-record lookups)           |
| `lib/dal.ts`        | `authenticated()` — resolves the session cookie to the current user            |
| `lib/session.ts`    | Signing/verifying the JWT session cookie                                       |
| `lib/definitions/`  | Zod schemas that validate every form submission                                |
| `policies/`         | Authorization rules per resource (Laravel-style policies)                      |

### Data model

Three tables. The schema lives in [`drizzle/schema/`](drizzle/schema) and the SQL that creates it in [`drizzle/migrations/`](drizzle/migrations).

```mermaid
erDiagram
    users ||--o{ project_users : "is a member of"
    projects ||--o{ project_users : "has team member"

    users {
        serial id PK
        text name
        text email UK
        text password "bcrypt hash"
        text role "ADMIN | PROJECT_MANAGER | SUBCONTRACTOR | HOMEOWNER"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "soft delete"
    }

    projects {
        serial id PK
        text title
        text project_number UK "unique among non-deleted projects"
        text description "nullable"
        numeric total_value "numeric(14,2), default 0"
        boolean is_active "default true"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "soft delete"
    }

    project_users {
        integer project_id PK, FK
        integer user_id PK, FK
        timestamp created_at
    }
```

#### `users`

| Column       | Type        | Notes                                                                  |
| ------------ | ----------- | ---------------------------------------------------------------------- |
| `id`         | `serial`    | Primary key                                                            |
| `name`       | `text`      | Required                                                               |
| `email`      | `text`      | Required, unique                                                       |
| `password`   | `text`      | bcrypt hash (cost 10); never selected into app-facing queries          |
| `role`       | `text`      | `ADMIN`, `PROJECT_MANAGER`, `SUBCONTRACTOR` or `HOMEOWNER` (default)   |
| `created_at` | `timestamp` | Defaults to `now()`                                                    |
| `updated_at` | `timestamp` | Set on every update                                                    |
| `deleted_at` | `timestamp` | Soft delete — `NULL` means the user is live                            |

#### `projects`

| Column           | Type            | Notes                                                                       |
| ---------------- | --------------- | --------------------------------------------------------------------------- |
| `id`             | `serial`        | Primary key                                                                 |
| `title`          | `text`          | Required, 2–200 characters                                                  |
| `project_number` | `text`          | Required, up to 50 characters. Partial unique index `WHERE deleted_at IS NULL`, so a deleted project's number can be reused |
| `description`    | `text`          | Optional, up to 5000 characters                                             |
| `total_value`    | `numeric(14,2)` | Contract value, defaults to `0`                                             |
| `is_active`      | `boolean`       | Defaults to `true`                                                          |
| `created_at`     | `timestamp`     | Defaults to `now()`                                                         |
| `updated_at`     | `timestamp`     | Set on every update                                                         |
| `deleted_at`     | `timestamp`     | Soft delete                                                                 |

#### `project_users` (pivot)

| Column       | Type        | Notes                                                  |
| ------------ | ----------- | ------------------------------------------------------ |
| `project_id` | `integer`   | FK → `projects.id`, `ON DELETE CASCADE`                |
| `user_id`    | `integer`   | FK → `users.id`, `ON DELETE CASCADE`, indexed          |
| `created_at` | `timestamp` | When the user was added to the project                 |

Composite primary key `(project_id, user_id)`, so a user can only be on a project's team once.

#### How the entities relate

| Relationship          | Cardinality   | Through          | Notes |
| --------------------- | ------------- | ---------------- | ----- |
| Project ↔ User (team) | many-to-many  | `project_users`  | A project has many team members; a user can work on many projects. Only live, non-homeowner users can be added. |

**Soft deletes.** Users and projects are never removed with `DELETE`; their `deleted_at` is set instead, and every query filters on `deleted_at IS NULL`. Because of that, the `ON DELETE CASCADE` on `project_users` only fires if a row is hard-deleted directly in the database.

#### Migration history

| Migration                              | Change                                               |
| -------------------------------------- | ---------------------------------------------------- |
| `20261102182157_tidy_hulk`             | Create `users`                                       |
| `20261103010015_melted_argent`         | Add `users.role`                                     |
| `20261103021336_lovely_hammerhead`     | Add `users.deleted_at` (soft deletes)                |
| `20261103030222_heavy_gabe_jones`      | Create `projects` and the partial unique index       |
| `20261103034702_project_users`         | Create the `project_users` pivot table               |

### API endpoints

There is no REST or GraphQL API. The app uses two Next.js mechanisms instead:

- **Server Actions** for every write. Each action is an exported `async` function in `actions/`. Next.js exposes it as a `POST` to the page that uses it, identified by an internal `Next-Action` header, and calls it for you when a `<form action={...}>` is submitted or the function is called from a client component. You call them like functions, not URLs.
- **Server Components** for every read. Pages query the database directly on the server through `lib/data/*`, so reads are plain `GET` requests to the page URLs below.

Every action and page (except the guest pages) first calls `authenticated()`, then the matching policy, so a call without a valid session redirects to `/login` and a call without permission returns **403**.

Validation failures don't throw. They return a state object such as `{ errors: { email: ["Email is already in use."] }, values }` that the form renders next to the field. Success returns `{ success: true }` (or redirects, for login/sign-up).

#### Authentication — [`actions/authentication.ts`](actions/authentication.ts)

| Action    | Input (form fields)                                  | Result |
| --------- | ---------------------------------------------------- | ------ |
| `signup`  | `name`, `email`, `password`, `confirm_password`      | Creates a `HOMEOWNER` user, sets the session cookie, redirects to `/dashboard` |
| `login`   | `email`, `password`                                  | Sets the session cookie, redirects to `/dashboard` |
| `logout`  | —                                                    | Deletes the session cookie, redirects to `/login` |

```tsx
// app/(guest)/login/page.tsx
const [state, formAction] = useActionState(login, undefined);

<form action={formAction}>
  <input name="email" value="admin@example.com" />
  <input name="password" type="password" value="Secret#123" />
</form>
```

#### Users (Teams page) — [`actions/users.ts`](actions/users.ts)

| Action       | Arguments                                         | Who can call it |
| ------------ | ------------------------------------------------- | --------------- |
| `createUser` | form: `name`, `email`, `role`, `password`         | Admin |
| `updateUser` | `id`, form: `name`, `email`, `role`, `password` (blank keeps current) | Admin, or the user themselves (role changes are ignored for non-admins) |
| `deleteUser` | `id`                                              | Admin, never their own account. Soft delete |

Passwords need at least 8 characters with a letter, a number and a special character. `role` must be `ADMIN`, `PROJECT_MANAGER` or `SUBCONTRACTOR`.

```tsx
// create
const [state, formAction] = useActionState(createUser, undefined);
// form fields: name=Jane Doe, email=jane@example.com, role=PROJECT_MANAGER, password=Secret#123

// update — the id is bound, the rest comes from the form
const [state, formAction] = useActionState(updateUser.bind(null, 7), undefined);

// delete
const result = await deleteUser(7); // { success: true } | { message: "..." }
```

#### Projects — [`actions/projects.ts`](actions/projects.ts)

| Action          | Arguments                                                               | Who can call it |
| --------------- | ----------------------------------------------------------------------- | --------------- |
| `createProject` | form: `title`, `projectNumber`, `description`, `totalValue`, `isActive` | Admin, Project Manager |
| `updateProject` | `id`, same form fields                                                  | Admin, Project Manager |
| `deleteProject` | `id`                                                                    | Admin only. Soft delete |

`isActive` is the string `"true"` or `"false"`. `totalValue` is a non-negative number with at most 2 decimals. `projectNumber` must be unique among live projects.

```tsx
const [state, formAction] = useActionState(createProject, undefined);
// form fields: title=Maple St. Renovation, projectNumber=P-2026-014,
//              description=Kitchen and bath remodel, totalValue=185000.00, isActive=true

const [state, formAction] = useActionState(updateProject.bind(null, 3), undefined);

const result = await deleteProject(3);
```

#### Project team — [`actions/project-users.ts`](actions/project-users.ts)

| Action              | Arguments                      | Who can call it |
| ------------------- | ------------------------------ | --------------- |
| `addProjectUser`    | `projectId`, form: `userId`    | Admin, Project Manager |
| `removeProjectUser` | `projectId`, `userId`          | Admin, Project Manager |

Only live users who are not homeowners can be added; adding someone already on the team returns `"This user is already on the team."`.

```tsx
const [state, formAction] = useActionState(addProjectUser.bind(null, 3), undefined);
// form field: userId=7

const result = await removeProjectUser(3, 7);
```

#### Pages (reads)

| Method + URL                       | What it returns                                         | Who can see it |
| ---------------------------------- | ------------------------------------------------------- | -------------- |
| `GET /`, `/login`, `/sign-up`      | Guest pages                                             | Signed-out users only |
| `GET /dashboard`                   | Dashboard                                               | Any signed-in user |
| `GET /projects?q=&page=`           | Projects, 10 per page, newest first. `q` searches title and project number | Admin, Project Manager |
| `GET /projects/:id`                | One project and its team                                | Admin, Project Manager |
| `GET /teams?q=&page=`              | Users, 10 per page, newest first. `q` searches name and email | Admin, Project Manager |
| `GET /session/invalidate`          | Route Handler: clears a session cookie whose user no longer exists, redirects to `/login` | Anyone |

Example:

```
GET http://localhost:3000/projects?q=maple&page=1
Cookie: session=<jwt>
```

### Authentication and authorization

- **Sessions.** On login/sign-up the server signs a JWT (`HS256`, `SESSION_SECRET`) containing the user id and stores it in an `httpOnly`, `secure`, `sameSite=lax` cookie named `session` that expires after 7 days ([`lib/session.ts`](lib/session.ts)).
- **Route guard.** [`proxy.ts`](proxy.ts) checks the cookie on every request and redirects before rendering.
- **Current user.** [`lib/dal.ts`](lib/dal.ts) `authenticated()` re-loads the user from the database on every request, so deleting a user signs them out immediately.
- **Policies.** [`policies/`](policies) hold one function per ability (`viewAny`, `view`, `create`, `update`, `destroy`). They return a boolean (used to hide buttons) or, by default, abort with **403**.

| Ability                        | Admin | Project Manager | Subcontractor | Homeowner |
| ------------------------------ | :---: | :-------------: | :-----------: | :-------: |
| View projects                  | ✅    | ✅              | —             | —         |
| Create / edit projects, manage team | ✅ | ✅           | —             | —         |
| Delete projects                | ✅    | —               | —             | —         |
| View users (Teams)             | ✅    | ✅              | —             | —         |
| Create / delete users          | ✅    | —               | —             | —         |
| Edit a user                    | ✅    | own account     | own account   | own account |

### Where the data lives and how it is hosted

- **Database:** PostgreSQL, accessed through Drizzle ORM with the [`postgres`](https://github.com/porsager/postgres) (postgres-js) driver ([`drizzle/db.ts`](drizzle/db.ts)). The connection string comes from `DATABASE_URL`. Prepared statements are turned off (`prepare: false`) so the app also works behind a transaction-mode connection pooler such as PgBouncer / Supabase / Neon.
- **Schema changes** are made in `drizzle/schema/*`, turned into SQL with `npm run db:generate`, committed under `drizzle/migrations/`, and applied with `npm run db:migrate`.
- **Secrets:** `DATABASE_URL`, `SESSION_SECRET` and the seed credentials live in `.env`, which is git-ignored.
- **Hosting:** right now the app and database run locally (Next.js dev server + a local PostgreSQL on `127.0.0.1`). No production deployment is configured in this repo yet. The intended setup is:
  - App on **Vercel** (or any Node host running `npm run build && npm run start`), with `DATABASE_URL` and `SESSION_SECRET` set as environment variables.
  - Database on a managed PostgreSQL provider (e.g. Neon, Supabase or Railway), using its pooled connection string for `DATABASE_URL`.
  - Run `npm run db:migrate` against the production database on deploy, then `npm run db:seed` once to create the first admin.

> **TODO once deployed:** replace this paragraph with the live app URL and the database provider/region.

### Looking at real records

There are three ways to browse the data, from least to most direct:

1. **The app itself (admin view).** Sign in with an admin account. `/teams` lists every user, `/projects` lists every project, and `/projects/:id` shows a project's team. Reviewers can be given a `PROJECT_MANAGER` account if they should see everything but not delete projects or manage users.

2. **Drizzle Studio.** A browser-based table viewer that ships with `drizzle-kit`. With `DATABASE_URL` in `.env`:

   ```bash
   npx drizzle-kit studio
   ```

   Then open the URL it prints (https://local.drizzle.studio).

3. **Read-only database user.** Connect with `psql`, TablePlus, DBeaver, etc. using a role that can only `SELECT`. Run once as the database owner:

   ```sql
   CREATE ROLE reviewer WITH LOGIN PASSWORD 'choose-a-strong-password';
   GRANT CONNECT ON DATABASE construction_app TO reviewer;
   GRANT USAGE ON SCHEMA public TO reviewer;
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO reviewer;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO reviewer;
   -- Hide password hashes from the reviewer:
   REVOKE SELECT ON users FROM reviewer;
   GRANT SELECT (id, name, email, role, created_at, updated_at, deleted_at) ON users TO reviewer;
   ```

   Connection string: `postgres://reviewer:<password>@<host>:5432/construction_app`

   Useful queries:

   ```sql
   -- Live projects with their team size
   SELECT p.project_number, p.title, p.total_value, p.is_active, count(pu.user_id) AS team_size
   FROM projects p
   LEFT JOIN project_users pu ON pu.project_id = p.id
   WHERE p.deleted_at IS NULL
   GROUP BY p.id
   ORDER BY p.created_at DESC;

   -- Who is on which project
   SELECT p.project_number, u.name, u.role, pu.created_at AS added_at
   FROM project_users pu
   JOIN projects p ON p.id = pu.project_id
   JOIN users u ON u.id = pu.user_id
   WHERE p.deleted_at IS NULL AND u.deleted_at IS NULL
   ORDER BY p.project_number, u.name;
   ```

> **TODO once deployed:** add the reviewer's host and credentials (shared privately, not in this file).
