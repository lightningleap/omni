import { prisma } from "@/lib/prisma"
import FlashSaleForm from "@/components/admin/FlashSaleForm"

export default async function MarketingPage() {
  const config = await prisma.storeConfig.findUnique({
    where: { id: "global" },
  })

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-16 px-8 mb-20">
      <header className="flex justify-between items-end mb-16 border-b border-slate-100 pb-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif italic font-black tracking-tighter lowercase text-slate-900 leading-none">Marketing Protocol</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Campaign Management // Global Triggers // FOMO Engine</p>
        </div>
        <div className="bg-white border border-slate-200 px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Creative Engine: <span className="text-green-600">Syncing</span></span>
        </div>
      </header>
      
      <div className="bg-slate-50/50 border border-slate-50 rounded-[3rem] p-4 p-2 shadow-inner">
        <FlashSaleForm initialData={config as any} />
      </div>

      <footer className="pt-12 border-t border-slate-100 flex justify-center">
        <p className="text-[10px] font-serif italic text-slate-300">"Flash: Stickered // Font: Stylish // Admin: Pruned."</p>
      </footer>
    </div>
  )
}
