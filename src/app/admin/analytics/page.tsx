import { getFinancialSummary } from "@/app/actions/admin/analytics"
import AnalyticsClient from "@/components/admin/AnalyticsClient"
import { ADMIN_SHELL } from "@/components/admin/ui/primitives"

export default async function AnalyticsPage() {
  const data = await getFinancialSummary()

  return (
    <div className={`${ADMIN_SHELL} space-y-8`}>
      <AnalyticsClient data={data} />
    </div>
  )
}
