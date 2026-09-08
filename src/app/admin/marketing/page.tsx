import { prisma } from "@/lib/prisma"
import FlashSaleForm from "@/components/admin/FlashSaleForm"

export default async function MarketingPage() {
  const config = await prisma.storeConfig.findUnique({
    where: { id: "global" },
  })

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-16 px-8 mb-20">
      <header className="flex justify-between items-end mb-16 border-b border-[#EFEDE8] pb-10">
        <div className="space-y-2">
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink leading-tight">Marketing Protocol</h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400 ml-1">Campaign Management // Global Triggers // FOMO Engine</p>
        </div>
        <div className="bg-white border border-[#E8E6E1] px-5 py-2.5 rounded-full flex items-center gap-2.5">
          <div className="w-2 h-2 bg-accent-600 rounded-full animate-pulse" />
          <span className="text-[8px] font-semibold uppercase tracking-widest text-neutral-500">Creative Engine: <span className="text-accent-700">Syncing</span></span>
        </div>
      </header>
      
      <div className="bg-[#FBFAF8] border border-[#EFEDE8] rounded-panel p-4">
        <FlashSaleForm initialData={config as any} />
      </div>

      <footer className="pt-12 border-t border-[#EFEDE8] flex justify-center">
        <p className="text-[10px] font-sans text-neutral-300">"Flash: Stickered // Font: Stylish // Admin: Pruned."</p>
      </footer>
    </div>
  )
}
