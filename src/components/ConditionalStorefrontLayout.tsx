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
  /**
   * Checkout runs without the storefront chrome.
   *
   * Everything the navbar offers at this point is a way to leave: the mode
   * toggle, the search, the category menus, the cart drawer over the top of the
   * page that IS the cart. The flash-sale countdown is worse — a timer urging a
   * purchase, on the screen where the purchase is already happening. The page
   * brings its own header instead (see `CheckoutHeader`), which keeps the mark,
   * a way back to shopping, and nothing else.
   *
   * Scoped to `/checkout` exactly. `/checkout/success` keeps the full chrome,
   * because by then the shopper is finished and should be able to carry on
   * browsing normally.
   */
  const isCheckoutRoute = pathname === "/checkout"

  // If we are deep inside the secure Admin network, aggressively detach the storefront visual tree.
  if (isAdminRoute) {
    return <main className="flex-grow bg-white min-h-screen">{children}</main>
  }

  if (isCheckoutRoute) {
    return (
      <>
        <BrandBackground />
        <main className="flex-grow">{children}</main>
      </>
    )
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
