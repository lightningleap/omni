import React from "react"
import StorefrontAnimation from '@/components/admin/dashboard/StorefrontAnimation';
import ProductSyncAnimation from '@/components/admin/dashboard/ProductSyncAnimation';
import OrderTrackingAnimation from '@/components/admin/dashboard/OrderTrackingAnimation';
import { Play } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  return (
    <div className="font-sans text-neutral-900 mx-auto w-full max-w-[1440px] space-y-8">
      
      {/* Hero Greeting */}
      <div className="space-y-4">
        {/* The "Dashboard Overview" eyebrow is gone. It labelled the page as the
            thing the sidebar had already said the reader clicked, and pushed the
            actual greeting down a row for no gain. "Welcome back" is now the
            page's h1 — one heading, which is also the correct outline. */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink">Welcome back, Admin</h1>
            <p className="max-w-xl text-[13px] leading-relaxed text-neutral-500">
              Your store performance is summarized below. All fulfillment channels are currently active and propagating correctly.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-800 rounded-card border border-accent-200">
            <div className="w-2 h-2 bg-accent-600 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">System Healthy</span>
          </div>
        </div>
      </div>

      {/* Metric Tiles Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick Action: View Shop */}
        <Link href="/" target="_blank" className="group block relative rounded-panel border border-[#E8E6E1] bg-white p-6 transition-colors duration-200 hover:border-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30">
          <div className="mb-5 flex h-20 w-full items-center justify-center rounded-card bg-[#FBFAF8] text-neutral-400 transition-colors duration-200 group-hover:text-accent-700">
            <StorefrontAnimation />
          </div>
          <h2 className="mb-1.5 text-[14px] font-semibold tracking-[-0.01em] text-ink">View Storefront</h2>
          <p className="text-[12px] leading-relaxed text-neutral-500">Preview the live client interface and user experience.</p>
          <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-accent-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Visit Site <Play size={10} className="fill-current" />
          </div>
        </Link>
        
        {/* Quick Action: Sync Printify */}
        <Link href="/admin/products" className="group block relative rounded-panel border border-[#E8E6E1] bg-white p-6 transition-colors duration-200 hover:border-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30">
          <div className="mb-5 flex h-20 w-full items-center justify-center rounded-card bg-[#FBFAF8] text-neutral-400 transition-colors duration-200 group-hover:text-accent-700">
            <ProductSyncAnimation />
          </div>
          <h2 className="mb-1.5 text-[14px] font-semibold tracking-[-0.01em] text-ink">Product Sync</h2>
          <p className="text-[12px] leading-relaxed text-neutral-500">Trigger manual synchronization with Printify catalog.</p>
          <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-accent-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Manage Catalog <Play size={10} className="fill-current" />
          </div>
        </Link>

        {/* Quick Action: Check Orders */}
        <Link href="/admin/orders" className="group block relative rounded-panel border border-[#E8E6E1] bg-white p-6 transition-colors duration-200 hover:border-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30">
          <div className="mb-5 flex h-20 w-full items-center justify-center rounded-card bg-[#FBFAF8] text-neutral-400 transition-colors duration-200 group-hover:text-accent-700">
            <OrderTrackingAnimation />
          </div>
          <h2 className="mb-1.5 text-[14px] font-semibold tracking-[-0.01em] text-ink">Order Tracking</h2>
          <p className="text-[12px] leading-relaxed text-neutral-500">Verify logistics, fulfillment, and shipping signals.</p>
          <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-accent-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Check Orders <Play size={10} className="fill-current" />
          </div>
        </Link>

      </div>

    </div>
  )
}
