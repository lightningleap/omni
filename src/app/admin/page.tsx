import React from "react"
import { ShieldAlert, Terminal, Play, Package, Store } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  return (
    <div className="font-sans text-neutral-900 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-[1400px] mx-auto">
      
      {/* Hero Greeting */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-accent-700">
          <div className="p-2 bg-accent-50 rounded-lg">
            <Package size={20} />
          </div>
          <h1 className="text-sm font-bold tracking-tight uppercase">Dashboard Overview</h1>
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, Admin</h2>
            <p className="text-sm text-neutral-500 max-w-xl leading-relaxed">
              Your store performance is summarized below. All fulfillment channels are currently active and propagating correctly.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm shadow-emerald-50">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">System Healthy</span>
          </div>
        </div>
      </div>

      {/* Metric Tiles Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick Action: View Shop */}
        <Link href="/" target="_blank" className="group p-8 bg-white border border-neutral-200/60 rounded-3xl hover:border-accent-200 hover:shadow-xl hover:shadow-accent-500/5 transition-all relative block">
          <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center mb-6 text-neutral-400 group-hover:text-accent-700 group-hover:bg-accent-50 transition-all duration-300">
            <Store size={24} />
          </div>
          <h2 className="text-sm font-bold tracking-tight text-neutral-900 mb-2">View Storefront</h2>
          <p className="text-xs text-neutral-500 font-medium leading-relaxed">Preview the live client interface and user experience.</p>
          <div className="mt-6 flex items-center gap-2 text-accent-700 font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Visit Site <Play size={10} className="fill-current" />
          </div>
        </Link>
        
        {/* Quick Action: Sync Printify */}
        <Link href="/admin/products" className="group p-8 bg-white border border-neutral-200/60 rounded-3xl hover:border-accent-200 hover:shadow-xl hover:shadow-accent-500/5 transition-all relative block">
          <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center mb-6 text-neutral-400 group-hover:text-accent-700 group-hover:bg-accent-50 transition-all duration-300">
            <Play size={24} />
          </div>
          <h2 className="text-sm font-bold tracking-tight text-neutral-900 mb-2">Product Sync</h2>
          <p className="text-xs text-neutral-500 font-medium leading-relaxed">Trigger manual synchronization with Printify catalog.</p>
          <div className="mt-6 flex items-center gap-2 text-accent-700 font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Manage Catalog <Play size={10} className="fill-current" />
          </div>
        </Link>

        {/* Quick Action: Check Orders */}
        <Link href="/admin/orders" className="group p-8 bg-white border border-neutral-200/60 rounded-3xl hover:border-accent-200 hover:shadow-xl hover:shadow-accent-500/5 transition-all relative block">
          <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center mb-6 text-neutral-400 group-hover:text-accent-700 group-hover:bg-accent-50 transition-all duration-300">
            <Package size={24} />
          </div>
          <h2 className="text-sm font-bold tracking-tight text-neutral-900 mb-2">Order Tracking</h2>
          <p className="text-xs text-neutral-500 font-medium leading-relaxed">Verify logistics, fulfillment, and shipping signals.</p>
          <div className="mt-6 flex items-center gap-2 text-accent-700 font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Check Orders <Play size={10} className="fill-current" />
          </div>
        </Link>

      </div>

    </div>
  )
}
