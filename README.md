# UNRWLY STOREFRONT ENGINE

## DATABASE INFRASTRUCTURE
The `DATABASE_URL` is the single source of truth for all products, collections, and configurations. 

### PERSISTENT DATA CLAIM
When migrating to a new database (or if the client provides their own DB URL):
1.  **Identity Claim**: Set `ADMIN_EMAILS` to your own email so the empty database still has a way in.
2.  **Registration**: Sign up with that email at `/auth`. You will be automatically granted the `ADMIN` role.
3.  **Data Synchronization**: Your new database will be empty. To backfill all products from the Printify master catalog, navigate to the **Products** section in the Admin Dashboard and click the **"Sync Printify"** button. This will pull all live products into your new institutional database.

### ADMIN vs CUSTOMER

Roles live in the database, in `User.role` (`ADMIN` / `VIP` / `CUSTOMER`).

**To add an admin:** the person signs up normally at `/auth`, then an existing
admin opens **Admin -> Customers** and changes their role to Admin. No env edit,
no redeploy. Removing an admin is the same control in reverse.

`ADMIN_EMAILS` is **not** the way to manage admins — it is a break-glass
override. Emails listed there are admins regardless of the database, which is
what makes it safe to hand role management to the client: if the roles table
is ever wrecked, the listed owner can still sign in and repair it. Keep it to
one or two people, or leave it empty once the database has admins you trust.

Three guards prevent the store locking itself out. You cannot demote yourself,
you cannot demote a break-glass admin, and you cannot remove the last admin
while `ADMIN_EMAILS` is empty.

Supabase user metadata also carries a `role`, refreshed at sign-in. It is a
mirror for display — **no gate reads it**.

Every gate goes through `requireAdmin()` / `getSessionUser()` in
[`src/lib/auth.ts`](src/lib/auth.ts); the break-glass list lives in
[`src/lib/admin.ts`](src/lib/admin.ts). Do not re-implement either check
anywhere else. Note that middleware only verifies that a session exists —
it runs on the Edge and cannot reach the database — so the authoritative check
happens in [`src/app/admin/layout.tsx`](src/app/admin/layout.tsx) and in every
admin action.

### DATABASE MIGRATIONS

Schema changes go through `prisma migrate dev`, never `prisma db push`.

Between April and September 2026 they went through `db push`, which writes no
history: the migrations folder still described the March schema while
production had eleven columns, two enums and a table it had never heard of. A
deploy to a fresh server would have built the wrong database.
`20260902120000_baseline_current_schema` closes that gap, and production is
marked as having applied it.

Two things keep it closed:

- `.gitattributes` pins `prisma/migrations/**` to LF. Prisma checksums a
  migration by its bytes, so a line-ending rewrite alone is enough to make
  `prisma migrate deploy` refuse to run against a database that already applied
  it — which is exactly what happened once.
- `SHADOW_DATABASE_URL` (see `prisma.config.ts`) points at a throwaway local
  Postgres that `migrate dev` and `migrate diff` replay history into. Never
  point it at production; Prisma resets whatever database it names.

Deploying to a new server is then `prisma migrate deploy`.

### SELF-HOSTING (DigitalOcean droplet)

Vercel builds this repo natively. Anywhere else, the `Dockerfile` and
`docker-compose.yml` run the same app behind Caddy, which terminates TLS and
proxies to it. Once per server:

1. Ubuntu 24.04 droplet, 2 GB RAM or more — `next build` runs out of memory
   on 1 GB. Open 22, 80, 443 in ufw. Install Docker Engine + the compose plugin.
2. Clone the repo, `cp .env.example .env`, fill in production values. Set
   `NEXT_PUBLIC_APP_URL` and `SITE_DOMAIN` before building — the first is
   baked into the client bundle, the second is what Caddy requests a
   certificate for.
3. Point A records for the root and `www` at the droplet. Caddy cannot get a
   certificate until DNS resolves.
4. `npx prisma migrate deploy` once, against `DIRECT_URL`.
5. `docker compose build && docker compose up -d`.
6. Repoint the Stripe and Printify webhooks at `https://<domain>/api/webhooks/…`
   and add the domain to Supabase Auth → URL Configuration.

Redeploy is `git pull && docker compose build && docker compose up -d`.
`GET /api/health` returns 200 when the app can reach the database and 503
otherwise; Caddy and the container healthcheck both poll it.

### ENVIRONMENT VARIABLES

See [`.env.example`](.env.example) for the full list. The ones that matter most:

- `DATABASE_URL`: Pooled PostgreSQL connection string, used by the app.
- `DIRECT_URL`: Unpooled connection, used by Prisma migrations and CLI scripts.
- `ADMIN_EMAILS`: Break-glass admin emails, comma-separated. Not the normal way
  to manage admins — see above. May be left empty.
- `MASTER_ADMIN_EMAIL`: Legacy single-admin variable, still honoured as a
  fallback when `ADMIN_EMAILS` is unset.
- `NEXT_PUBLIC_APP_URL`: Your production URL (e.g., `https://unrwly.com`).
  Baked into the client bundle at **build** time, so set it before building.
- `STRIPE_SECRET_KEY`: For production payment processing.
- `AUTH_SECRET`: Your Auth.js v5 secret for secure sessions.
- `CONTACT_INBOX`: Where contact-form submissions go. Falls back to the first
  `ADMIN_EMAILS` entry.

---
**DATA: PERSISTENT // IDENTITY: TRANSFERABLE // UI: POLARIS_SYNC**
