import { prisma } from "@/lib/prisma"
import FlashSaleForm from "@/components/admin/FlashSaleForm"
import { ADMIN_SHELL, AdminPageHeader } from "@/components/admin/ui/primitives"

export default async function MarketingPage() {
  const config = await prisma.storeConfig.findUnique({
    where: { id: "global" },
  })

  return (
    /* This page used to set its own everything: a 5xl container where the
       rest of the studio is 1440px, 64px of vertical padding where the rest
       has none, a 16px-deep bespoke header rule, an 8px status chip, and a
       footer whose only content was a developer in-joke. It is the same shell
       and the same header as every other section now. */
    <div className={`${ADMIN_SHELL} space-y-8`}>
      <AdminPageHeader
        title="Marketing"
        meta="Campaign management, global triggers and the countdown engine."
        action={
          <div className="flex items-center gap-2 rounded-card border border-[#E8E6E1] bg-white px-4 py-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-accent-600" />
            <span className="type-admin-label text-neutral-500">
              Creative engine: <span className="text-accent-700">syncing</span>
            </span>
          </div>
        }
      />

      <FlashSaleForm initialData={config as any} />
    </div>
  )
}
