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
