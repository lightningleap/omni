/**
 * Session helpers for server components, server actions and route handlers.
 *
 * Admin access is decided by the database: a user is an admin when their
 * `User.role` row says ADMIN. The env list in `@/lib/admin` is a break-glass
 * override on top of that, so access can never be lost entirely.
 *
 * Every gate goes through `requireAdmin()`; every page that just needs to know
 * who is looking goes through `getSessionUser()`. Keeping the rule in one place
 * means it cannot drift between the twenty-odd call sites.
 *
 * Middleware cannot use this module — it reads cookies through next/headers and
 * queries Prisma, neither of which run on the Edge. Middleware only checks that
 * a session exists; the authoritative check happens in the admin layout and in
 * every admin action.
 */

import { cache } from "react";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { isBootstrapAdmin } from "@/lib/admin";

export type AppRole = "ADMIN" | "VIP" | "CUSTOMER";

/** The trimmed-down user shape that gets passed to client components. */
export type SafeUser = {
  id: string;
  email: string | undefined;
  role: AppRole;
};

/**
 * Resolves a signed-in user's role.
 *
 * The break-glass list is checked first so that a locked-out owner never
 * depends on the database being readable or correct. Otherwise the stored role
 * decides. An account with no row yet — signed up through Supabase but never
 * synced — is treated as a customer.
 */
async function resolveRole(user: User | null): Promise<AppRole> {
  const email = user?.email?.toLowerCase().trim();
  if (!email) return "CUSTOMER";
  if (isBootstrapAdmin(email)) return "ADMIN";

  const row = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  return row?.role === "ADMIN" ? "ADMIN" : row?.role === "VIP" ? "VIP" : "CUSTOMER";
}

/**
 * The current session, with the role already resolved.
 * `safeUser` is null when nobody is signed in.
 *
 * Wrapped in React's `cache` so that the layout, the page and any nested
 * component share one lookup per request instead of each paying for its own
 * Supabase call and role query.
 */
export const getSessionUser = cache(async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // Anonymous visitors — the overwhelming majority of storefront traffic —
  // never reach the database for this.
  if (!user) {
    return { user: null, isAdmin: false, role: "CUSTOMER" as AppRole, safeUser: null };
  }

  const role = await resolveRole(user);

  return {
    user,
    isAdmin: role === "ADMIN",
    role,
    safeUser: { id: user.id, email: user.email, role } satisfies SafeUser,
  };
});

/**
 * Gate for anything that mutates or exposes admin data.
 * Throws when the caller is not an admin — server actions surface this to the
 * client as a failed action, which is what we want.
 */
export async function requireAdmin() {
  const { user, isAdmin } = await getSessionUser();

  if (!user || !isAdmin) {
    throw new Error("Unauthorized. Admin clearance required.");
  }

  return user;
}

/**
 * Same check without throwing — for route handlers that answer with a status
 * code rather than an exception.
 */
export async function isAdminRequest(): Promise<boolean> {
  const { isAdmin } = await getSessionUser();
  return isAdmin;
}
