import type { Metadata, Viewport } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import ConditionalStorefrontLayout from "@/components/ConditionalStorefrontLayout";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { getSessionUser } from "@/lib/auth";

// Prevent static prerendering — Prisma requires a live DB connection
export const dynamic = "force-dynamic";

// ── FONT LOADING ──────────────────────────────────────────────────────────
// Two families ship to the browser: Manrope for the entire UI, and an editorial
// display serif for headings. The display face is Mellos, self-hosted from
// public/fonts via an @font-face in globals.css (licensed — not committed);
// Playfair Display is loaded as its fallback so the editorial register survives
// until the licence file is dropped in.
//
// Inter was removed: it was downloaded on every page but never applied — the
// `font-inter` class it was meant to expose was never defined in the Tailwind
// theme, so nothing on the site ever rendered in it.

// Primary UI typeface — modern, minimal, premium.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

// Display fallback for Mellos. No `weight` array: Playfair is a variable font,
// so one file per style covers 400–900 instead of the six static cuts that were
// being downloaded before.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Unrwly",
    template: "%s | Unrwly",
  },
  description: "Crafted with quality, designed for you.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Initialize config as null to provide a fallback if the DB is unreachable
  let config = null;

  try {
    // 2. Fetch Global Marketing Config with a safety net
    config = await prisma.storeConfig.findUnique({
      where: { id: "global" },
    });
  } catch (error) {
    // 3. Log the error to Vercel console without crashing the site
    console.error("PRODUCTION_DATABASE_ERROR: Check if Supabase is paused or credentials are correct.", error);
  }

  // 4. Fetch Supabase Session for the Navbar
  const { user, isAdmin } = await getSessionUser();


  const safeUser = user ? {
    id: user.id,
    email: user.email,
    role: isAdmin ? 'ADMIN' : 'CUSTOMER'
  } : null;

  // Access the Environment Variable for Analytics
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        {/* The logo is painted as a CSS mask (see BrandMark), and an element
            whose mask has not arrived yet is drawn UNMASKED — which would put a
            solid accent-coloured rectangle in the header for as long as the
            fetch takes. Preloading starts that fetch at HTML parse, well before
            the navbar paints, so the mark's first frame is already the mark.
            It sits in the header on every page, so it is worth the hint. */}
        <link rel="preload" as="image" href="/brand/unrwly-logo-mask.png" />
      </head>
      <body className={`${playfair.variable} ${manrope.variable} antialiased selection:bg-accent-200 selection:text-accent-ink flex flex-col min-h-screen font-sans`}>
        <Providers>
          {/* 4. ConditionalStorefrontLayout will now receive null instead of crashing if DB fails */}
          <ConditionalStorefrontLayout
            config={config}
            navbar={
              <Suspense fallback={<div className="h-20 bg-white border-b border-neutral-100" />}>
                <Navbar user={safeUser} />
              </Suspense>
            }
            footer={<Footer />}
          >
            {children}
          </ConditionalStorefrontLayout>
        </Providers>

        <div id="adk-agent-root"></div>

        {/* Google Analytics Integration with Global User Parameters & User-ID */}
        {gaId && (
          <>
            {/* `next/script`, not a bare <script>.
                React never executes a raw <script> rendered by a component on
                the client, so on every client-side navigation these gtag
                parameters were silently skipped — the tag only ever ran on a
                full document load. React 19 warns about it now, which is what
                surfaced it.

                `beforeInteractive` preserves the intent stated above: these
                globals must be set BEFORE GoogleAnalytics initialises. */}
            <Script
              id="ga-user-params"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}

                  // Set global parameters BEFORE Google Analytics fully initializes
                  gtag('set', {
                    'user_role': '${safeUser ? safeUser.role : 'GUEST'}',
                    'login_status': '${safeUser ? 'logged_in' : 'logged_out'}',
                    'user_id': ${safeUser ? `'${safeUser.id}'` : 'null'}
                  });
                `,
              }}
            />
            <GoogleAnalytics gaId={gaId} />
          </>
        )}
      </body>
    </html>
  );
}
