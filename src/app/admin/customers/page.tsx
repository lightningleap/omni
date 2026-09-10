import { prisma } from "@/lib/prisma"
import { isBootstrapAdmin } from "@/lib/admin"
import { getSessionUser } from "@/lib/auth"
import CustomersClient from "@/components/admin/CustomersClient"
import { ADMIN_SHELL } from "@/components/admin/ui/primitives"

export default async function CustomersPage() {
  const { user: currentUser } = await getSessionUser()

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      totalSpent: true,
      role: true,
      _count: {
        select: { orders: true }
      }
    }
  })

  // Format data for client boundary.
  //
  // `pinned` marks the break-glass accounts from ADMIN_EMAILS: they are admins
  // regardless of the stored role and cannot be demoted here, so the table
  // shows their control as locked rather than offering an action that would be
  // refused. `isSelf` does the same for the signed-in admin's own row.
  const safeCustomers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    totalSpent: u.totalSpent,
    ordersCount: u._count.orders,
    role: isBootstrapAdmin(u.email) ? ("ADMIN" as const) : u.role,
    pinned: isBootstrapAdmin(u.email),
    isSelf: u.email.toLowerCase() === currentUser?.email?.toLowerCase()
  }))

  return (
    <div className={`${ADMIN_SHELL} space-y-8`}>
      <CustomersClient initialCustomers={safeCustomers} />
    </div>
  )
}
