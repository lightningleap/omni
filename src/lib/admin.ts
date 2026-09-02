/**
 * Break-glass admins — the emails that are admin no matter what the database
 * says.
 *
 * Day-to-day admin management happens in the database (`User.role`), from the
 * Customers page in the admin panel. This env list exists only so that access
 * cannot be lost: a fresh database has no admin rows yet, and a bad edit could
 * in principle demote everyone. Whoever is listed here can always get back in
 * and fix it.
 *
 *   ADMIN_EMAILS=owner@brand.com          # comma-separated; may be left empty
 *   MASTER_ADMIN_EMAIL=owner@brand.com    # legacy name, still honoured
 *
 * Keep this list short — one or two people. Everyone else should be promoted
 * through the admin panel instead.
 *
 * This module deliberately imports nothing, so middleware (Edge runtime) can
 * use it too.
 */

const normalise = (value: string | null | undefined) =>
  value?.toLowerCase().trim() ?? "";

/** The break-glass admin emails, lowercased and de-duplicated. */
export function getBootstrapAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || process.env.MASTER_ADMIN_EMAIL || "";

  return [...new Set(raw.split(",").map(normalise).filter(Boolean))];
}

/**
 * True when this email is pinned as an admin in the environment.
 * These accounts cannot be demoted from the admin panel — by design.
 */
export function isBootstrapAdmin(email: string | null | undefined): boolean {
  const candidate = normalise(email);
  if (!candidate) return false;

  return getBootstrapAdminEmails().includes(candidate);
}
