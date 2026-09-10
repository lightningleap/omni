import React from "react"
import StorefrontAnimation from '@/components/admin/dashboard/StorefrontAnimation';
import ProductSyncAnimation from '@/components/admin/dashboard/ProductSyncAnimation';
import OrderTrackingAnimation from '@/components/admin/dashboard/OrderTrackingAnimation';
import { Play } from "lucide-react"
import Link from "next/link"
import { ADMIN_SHELL, AdminPageHeader } from "@/components/admin/ui/primitives"

export default function AdminDashboardPage() {
  return (
    <div className={`${ADMIN_SHELL} space-y-8`}>

      {/* The "Dashboard Overview" eyebrow is gone. It labelled the page as the
          thing the sidebar had already said the reader clicked, and pushed the
          actual greeting down a row for no gain. "Welcome back" is now the
          page's h1 — one heading, which is also the correct outline.

          The header itself is AdminPageHeader rather than a hand-rolled one:
          this page had its own h1 at a fixed 24px, so it stayed 24px on a
          laptop where every other page's title dropped to 20px. */}
      <AdminPageHeader
        title="Welcome back, Admin"
        meta={
          <span className="max-w-xl leading-relaxed">
            Your store performance is summarized below. All fulfillment channels
            are currently active and propagating correctly.
          </span>
        }
        action={
          <div className="flex items-center gap-2 rounded-card border border-accent-200 bg-accent-50 px-4 py-2 text-accent-800">
            <div className="h-2 w-2 animate-pulse rounded-full bg-accent-600" />
            <span className="type-admin-label">System Healthy</span>
          </div>
        }
      />

      {/* Metric Tiles Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick Action: View Shop */}
        <Link href="/" target="_blank" className="group block relative rounded-panel border border-[#E8E6E1] bg-white p-6 transition-colors duration-200 hover:border-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30">
          <div className="mb-5 flex h-20 w-full items-center justify-center rounded-card bg-[#FBFAF8] text-neutral-400 transition-colors duration-200 group-hover:text-accent-700">
            <StorefrontAnimation />
          </div>
          <h2 className="type-admin-section mb-1.5 text-ink">View Storefront</h2>
          <p className="type-admin-meta text-neutral-500">Preview the live client interface and user experience.</p>
          <div className="type-admin-label mt-5 flex items-center gap-2 text-accent-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Visit Site <Play size={10} className="fill-current" />
          </div>
        </Link>
        
        {/* Quick Action: Sync Printify */}
        <Link href="/admin/products" className="group block relative rounded-panel border border-[#E8E6E1] bg-white p-6 transition-colors duration-200 hover:border-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30">
          <div className="mb-5 flex h-20 w-full items-center justify-center rounded-card bg-[#FBFAF8] text-neutral-400 transition-colors duration-200 group-hover:text-accent-700">
            <ProductSyncAnimation />
          </div>
          <h2 className="type-admin-section mb-1.5 text-ink">Product Sync</h2>
          <p className="type-admin-meta text-neutral-500">Trigger manual synchronization with Printify catalog.</p>
          <div className="type-admin-label mt-5 flex items-center gap-2 text-accent-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Manage Catalog <Play size={10} className="fill-current" />
          </div>
        </Link>

        {/* Quick Action: Check Orders */}
        <Link href="/admin/orders" className="group block relative rounded-panel border border-[#E8E6E1] bg-white p-6 transition-colors duration-200 hover:border-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30">
          <div className="mb-5 flex h-20 w-full items-center justify-center rounded-card bg-[#FBFAF8] text-neutral-400 transition-colors duration-200 group-hover:text-accent-700">
            <OrderTrackingAnimation />
          </div>
          <h2 className="type-admin-section mb-1.5 text-ink">Order Tracking</h2>
          <p className="type-admin-meta text-neutral-500">Verify logistics, fulfillment, and shipping signals.</p>
          <div className="type-admin-label mt-5 flex items-center gap-2 text-accent-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Check Orders <Play size={10} className="fill-current" />
          </div>
        </Link>

      </div>

    </div>
  )
}
