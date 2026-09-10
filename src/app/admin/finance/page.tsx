import { getUnitEconomics, getFinancialSummary } from "@/app/actions/admin/analytics"
import FinanceClient from "@/components/admin/FinanceClient"
import { ADMIN_SHELL } from "@/components/admin/ui/primitives"

export default async function FinancePage() {
  // Fetch both datasets concurrently to optimize TTFB
  const [unitData, summaryData] = await Promise.all([
    getUnitEconomics(),
    getFinancialSummary()
  ])

  return (
    <div className={`${ADMIN_SHELL} space-y-8`}>
      <FinanceClient
        items={unitData.unitEconomics}
        summary={summaryData}
      />
    </div>
  )
}
