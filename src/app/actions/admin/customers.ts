"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"
import { requireAdmin } from "@/lib/auth";
import { isBootstrapAdmin, getBootstrapAdminEmails } from "@/lib/admin";

/**
 * Changes a user's role. This is what actually grants or removes admin access —
 * the stored role is the source of truth (see src/lib/auth.ts).
 *
 * Three guards, all of which exist to stop the store being locked out of its
 * own admin panel:
 *
 *  1. You cannot demote yourself — the classic way to lose access in one click.
 *  2. You cannot demote a break-glass admin; that account is pinned by the
 *     environment and would keep its access anyway, so the UI must not pretend
 *     otherwise.
 *  3. You cannot remove the last admin. If the break-glass list is empty (which
 *     is allowed), demoting the final admin would leave nobody who can promote
 *     anyone, and the only fix would be direct database access.
 */
export async function setUserRole(userId: string, role: Role) {
  const currentUser = await requireAdmin()

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  })

  if (!target) {
    return { success: false, message: "That user no longer exists." }
  }

  const demotingAnAdmin = target.role === "ADMIN" && role !== "ADMIN"

  if (demotingAnAdmin) {
    if (target.email.toLowerCase() === currentUser.email?.toLowerCase()) {
      return { success: false, message: "You cannot remove your own admin access." }
    }

    if (isBootstrapAdmin(target.email)) {
      return {
        success: false,
        message: "This account is pinned as an admin in ADMIN_EMAILS and cannot be demoted here.",
      }
    }

    const remainingAdmins = await prisma.user.count({
      where: { role: "ADMIN", NOT: { id: userId } },
    })

    if (remainingAdmins === 0 && getBootstrapAdminEmails().length === 0) {
      return {
        success: false,
        message: "This is the last admin. Promote someone else before removing this one.",
      }
    }
  }

  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath("/admin/customers")

  return { success: true }
}

export async function saveInternalNotes(userId: string, notes: string) {
  await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { internalNotes: notes } })
  revalidatePath("/admin/customers")
  return { success: true }
}

export async function getCustomerProfile(userId: string) {
  await requireAdmin()
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { orders: { orderBy: { createdAt: "desc" }, include: { items: { include: { product: true } } } } }
  })
}
