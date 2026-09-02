import { getFinancialSummary } from "@/app/actions/admin/analytics"
import AnalyticsClient from "@/components/admin/AnalyticsClient"

export default async function AnalyticsPage() {
  const data = await getFinancialSummary()

  return (
    <div className="space-y-8 font-mono max-w-[1400px] mx-auto w-full">
      <AnalyticsClient data={data} />
    </div>
  )
}
