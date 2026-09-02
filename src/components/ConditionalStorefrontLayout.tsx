"use client"

import React from "react"
import { usePathname } from "next/navigation"
import GlobalCountdown from "@/components/GlobalCountdown"
import NewsletterModal from "@/components/NewsletterModal"
import BrandBackground from "@/components/BrandBackground"

type LayoutProps = {
  children: React.ReactNode
  config: any
  navbar?: React.ReactNode
  footer?: React.ReactNode
}

export default function ConditionalStorefrontLayout({ children, config, navbar, footer }: LayoutProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  // If we are deep inside the secure Admin network, aggressively detach the storefront visual tree.
  if (isAdminRoute) {
    return <main className="flex-grow bg-white min-h-screen">{children}</main>
  }

  return (
    <>
      {/* Global brand canvas — warm base + subtle doodles, fixed behind all pages */}
      <BrandBackground />

      {/* PILLAR 1: Marketing & FOMO Engine */}
      <GlobalCountdown
        isActive={config?.flashSaleActive ?? false}
        endsAt={config?.flashSaleEndsAt ?? null}
        message={config?.flashSaleMessage ?? "LIMITED DROP"}
      />

      {navbar}

      <main className="flex-grow">
        {children}
      </main>

      {footer}
      <NewsletterModal config={config} />
    </>
  )
}
