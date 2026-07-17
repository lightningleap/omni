# Unrwly — Project Document

Print-on-demand storefront with an in-house **Design Studio**, built on **Printify + Stripe + Supabase**.

> **What makes it special:** most POD storefronts make you go to Printify to design products. Ours doesn't — you design, generate AI artwork, pick colours, and publish without ever leaving Unrwly.

**Legend** — Status: ✅ built · 🔨 buildable · ❌ not possible · Effort: `S` small · `M` medium · `L` large · `XL` very large

---

## Contents
1. [Overview](#1-overview)
2. [Current status](#2-current-status--whats-built)
3. [Full feature scope](#3-full-feature-scope--whats-possible)
4. [Plan to launch](#4-plan-to-launch)
5. [Checklist](#5-checklist)
6. [Reference](#6-reference)

---

# 1. Overview

## Two portals, one app

| Portal | Who | Where | Purpose |
|---|---|---|---|
| **Admin (Management Studio)** | You | `/admin/*` | Design products, manage orders, customers, finance, analytics |
| **Customer** | Shoppers | Storefront + `/account` | Browse, buy, track orders |

Login routing (same `/auth` page): admin email → `/admin/products`; any other email → `/account`.

## How it works end-to-end

```
Design in Studio  →  Create on Printify  →  Real mockups back
                                              ↓
Customer buys  →  Stripe charges  →  Order auto-pushed to Printify
                                              ↓
                     Printify prints & ships  →  Webhook → Shipped / Delivered
```

## The honest gap

The happy path works. But everything **around** it is missing — you can't refund, cancel, or email a customer, and checkout has two real security holes. That's the difference between a demo and a store.

---

# 2. Current status — what's built

## Design Studio
- ✅ Product picker — 659 product types, live from Printify catalog
- ✅ Canvas editor — layers, drag / resize / rotate, delete
- ✅ Image upload (PNG / JPG / WEBP)
- ✅ Text — font family, size, bold, colour
- ✅ Shapes — rectangle, circle, colour
- ✅ Multi-side design — Front / Back / Sleeve / Neck, each separate
- ✅ **AI image generation** — text prompt → image (free, no key)
- ✅ Colour & size selection — choose exactly which variants to offer
- ✅ Garment templates — t-shirt / tank / hoodie outlines on canvas
- ✅ Live preview — rough design-on-product preview
- ✅ **Real mockups** — Printify generates per-colour mockups on create

## Products & store
- ✅ Multi-store sync — Adult + Kids, all pages (~239 products)
- ✅ Synced vs Studio separation — filter tabs + badges
- ✅ Profit calculator — retail − (cost + Stripe fees), with margin %
- ✅ Collections + draft/live gatekeeper
- ✅ Colour mockup gallery — pick the main storefront image
- ✅ Bulk publish / bulk delete

## Security
- ✅ **Server-side price validation** — checkout re-prices every line from the DB; client prices ignored
- ✅ **Draft/unknown product guard** — only LIVE products can be bought
- ✅ **Quantity cap** — 1–25 per line
- ✅ **Printify webhook signature** — HMAC-SHA256 verified; unsigned/tampered events rejected (fails closed in production)

## Storefront & orders (pre-existing)
- ✅ Home, products, collections, cart, checkout, wishlist, account
- ✅ About / FAQ / Contact / Policies, newsletter, flash-sale banner
- ✅ Stripe checkout → order → auto-push to Printify
- ✅ Printify webhook → Shipped / Delivered + tracking
- ✅ Admin order list, force-push, repair order
- ✅ GA4 ecommerce tracking (browser + server-side)

## Bugs fixed this cycle
DB connection pooling · Printify image hosts · Safari image upload · storage (base64 straight to Printify, no Vercel Blob)

---

# 3. Full feature scope — what's possible

## 3.1 Design Studio

**Buildable**
| Feature | Effort | Notes |
|---|---|---|
| 🔨 Graphics / clipart library | `M` | Our own hosted asset set |
| 🔨 Stock photos | `S` | Unsplash / Pexels free API |
| 🔨 More fonts | `S` | Google Fonts picker |
| 🔨 Undo / redo | `M` | Canvas history |
| 🔨 Duplicate layer | `S` | |
| 🔨 Alignment guides / snapping | `M` | |
| 🔨 Layer opacity / lock | `S` | |
| 🔨 Curved / arced text | `M` | |
| 🔨 Image filters | `M` | B&W, contrast, saturation |
| 🔨 **Background removal** | `M` | ⭐ Big for POD |
| 🔨 Save design as template | `M` | |
| 🔨 Design library | `M` | Saved, reusable artwork |
| 🔨 **One design → many products** | `L` | ⭐ Design once → tee + hoodie + mug together |
| 🔨 Bulk product creation | `L` | |
| 🔨 Better AI (paid model) | `S` | OpenAI/Gemini — cents per image |
| 🔨 AI prompt presets | `S` | "Vintage", "Y2K", "Minimal" |

**Not possible**
| Feature | Why |
|---|---|
| ❌ Printify's graphics library | Their private assets — not in the API |
| ❌ Printify's AI | Not exposed (we built our own instead) |
| ❌ Shutterstock / Fiverr | Printify-internal |
| ❌ Printify's garment line-art | Their private assets (we drew our own) |
| ❌ Editor preview in real garment colours | Catalog gives one photo per product. Real colours appear in the Printify mockup on create |

## 3.2 Product management
| Feature | Effort | Notes |
|---|---|---|
| 🔨 Per-variant pricing | `M` | XL costs more |
| 🔨 Bulk pricing rules | `M` | "2.2× markup on all hoodies" |
| 🔨 Inventory / stock sync | `M` | Block sold-out variants |
| 🔨 Print provider selection | `M` | Price/quality/location trade-off |
| 🔨 Edit an existing product's design | `L` | Re-open in Studio |
| 🔨 Product duplication | `S` | |
| 🔨 Bulk edit | `M` | |
| 🔨 SEO fields per product | `S` | |
| 🔨 Tags / categories | `M` | |
| 🔨 CSV import / export | `M` | |
| 🔨 Scheduled publishing | `M` | |
| 🔨 Shipping cost display | `S` | Printify shipping API |

## 3.3 Storefront
| Feature | Effort | Notes |
|---|---|---|
| 🔨 Product search | `M` | + autocomplete |
| 🔨 Filters & sorting | `M` | Price, colour, size |
| 🔨 **Reviews & ratings** | `L` | ⭐ Biggest conversion lever |
| 🔨 Size guide | `S` | |
| 🔨 Related / recommended | `M` | |
| 🔨 Recently viewed | `S` | |
| 🔨 Image zoom / colour gallery | `S` | |
| 🔨 Customer order detail page | `M` | Tracking number, carrier, link |
| 🔨 Multi-currency | `L` | |
| 🔨 Shipping calculator | `M` | Real Printify rates |
| 🔨 Blog / content | `M` | SEO |
| 🔨 Social share | `S` | |
| 🔨 Live chat widget | `S` | |

## 3.4 Payments & pricing
| Feature | Effort | Notes |
|---|---|---|
| 🔨 **Server-side price validation** | `S` | 🔴 Security — checkout trusts browser prices |
| 🔨 Coupons / discount codes | `M` | |
| 🔨 Apple Pay / Google Pay | `S` | Stripe built-in |
| 🔨 Gift cards | `L` | |
| 🔨 Store credit / wallet | `L` | POD-friendly refund alternative |
| 🔨 Tax handling | `M` | Stripe Tax |
| 🔨 Bundles / upsells | `M` | |
| 🔨 Subscriptions | `XL` | Merch drops |
| 🔨 Fraud / risk score | `S` | Stripe Radar |

## 3.5 Orders & fulfilment
| Feature | Effort | Notes |
|---|---|---|
| 🔨 **Printify webhook signature check** | `S` | 🔴 Security — accepts unsigned events |
| 🔨 Admin order detail panel | `S` | Component exists, not wired |
| 🔨 Cancel order | `M` | Stripe refund + Printify cancel |
| 🔨 Refunds (full / partial) | `M` | None exists today |
| 🔨 Real tracking sync | `S` | Current button is a stub |
| 🔨 More Stripe webhook events | `M` | Refunds, disputes, failures |
| 🔨 Append-only audit log | `S` | Notes overwritten today |
| 🔨 Bulk order actions | `M` | Checkboxes exist, unwired |
| 🔨 Structured shipping address | `M` | Currently a text string |
| 🔨 Packing slip / invoice PDF | `M` | |
| 🔨 Split shipments | `L` | Per-line-item status |
| 🔨 Multi-store order routing | `M` | Kids orders → Kids store |
| 🔨 Fulfilment SLA dashboard | `M` | Stuck-order alerts |

## 3.6 Returns & support — *nothing built yet*
| Feature | Effort | Notes |
|---|---|---|
| 🔨 Return / refund statuses | `S` | Schema can't represent a return today |
| 🔨 Return / RMA model | `M` | |
| 🔨 Customer return request | `M` | |
| 🔨 **Defect → reprint-or-refund** | `M` | ⭐ The POD-correct approach |
| 🔨 Store credit instead of refund | `L` | |

> **POD reality:** there's no warehouse and no shelf. Classic "ship it back and restock" doesn't apply. Build returns as **replace or refund** — photo of the defect → auto-approve small cases → Printify reprint or Stripe refund. Nothing ships back. Far simpler.

## 3.7 Customer communication — *nothing built yet (zero emails sent)*
| Feature | Effort | Notes |
|---|---|---|
| 🔨 Resend setup | `S` | Free: 3k emails/month |
| 🔨 Order confirmation | `S` | |
| 🔨 Shipped / Delivered | `S` | With tracking link |
| 🔨 Refund / cancellation | `S` | |
| 🔨 **Abandoned cart** | `M` | ⭐ Real revenue lift |
| 🔨 Review request | `S` | Post-delivery |
| 🔨 Welcome / newsletter | `M` | |
| 🔨 SMS notifications | `M` | Twilio |
| 🔨 Email template system | `M` | Branded |

## 3.8 Customers & accounts
✅ Signup/login, guest checkout, admin customer list, internal notes, ADMIN/CUSTOMER roles

| Feature | Effort |
|---|---|
| 🔨 Password reset | `S` |
| 🔨 Social login (Google) | `S` |
| 🔨 Saved addresses | `M` |
| 🔨 Customer LTV / segments | `M` |
| 🔨 Multiple admins + permissions | `M` |
| 🔨 Email verification | `S` |

## 3.9 Marketing & growth
✅ Flash-sale banner, newsletter capture, GA4 (browser + server-side, LTV)

| Feature | Effort |
|---|---|
| 🔨 Coupons / discount codes | `M` |
| 🔨 Referral program | `L` |
| 🔨 Affiliate / influencer codes | `L` |
| 🔨 Abandoned cart recovery | `M` |
| 🔨 Email campaigns | `M` |
| 🔨 Upsells / cross-sells | `M` |
| 🔨 Meta / TikTok pixel | `S` |
| 🔨 Google Shopping feed | `M` |

## 3.10 Analytics
✅ Finance page, analytics page, unit economics, GA4 funnel

| Feature | Effort |
|---|---|
| 🔨 Best sellers / worst performers | `M` |
| 🔨 Profit dashboard over time | `M` |
| 🔨 In-app conversion funnel | `M` |
| 🔨 Cohort / retention | `L` |
| 🔨 CSV report export | `S` |

## 3.11 Multi-store & channels
✅ Sync from multiple Printify stores (Adult + Kids)

| Feature | Effort | Notes |
|---|---|---|
| 🔨 Per-store order routing | `M` | Required to sell both stores safely |
| 🔨 Store filter in admin | `S` | |
| 🔨 Etsy sync control | `M` | Both stores are Etsy-connected |
| 🔨 Multi-channel publishing | `L` | Website + Etsy from one place |

## 3.12 Platform & ops
| Feature | Effort |
|---|---|
| 🔨 Error monitoring (Sentry) | `S` |
| 🔨 Staging environment | `S` |
| 🔨 Rate limiting | `S` |
| 🔨 Automated backups | `S` |
| 🔨 CI (typecheck + build on PR) | `S` |
| 🔨 Cron: daily product auto-sync | `S` |

---

# 4. Plan to launch

> **Guiding principle:** fix what breaks **trust or money** first. Everything else is polish.

## Stage 0 · Decisions (not code — needed from the business)
- Printify **store scope** — Adult only, or Adult + Kids? *(Adult-only skips Stage 4 and ships sooner)*
- Printify **billing** — payment method on the store, or nothing prints
- **Stripe live account** — approved, live keys available
- **Domain** — real URL
- **Sender email** — e.g. `orders@unrwly.com`

## Stage 1 · Security 🔴 `S–M` — *before a single real payment*
- Server-side price re-validation at checkout `S`
- Turn on Printify webhook signature check `S`
- Handle more Stripe webhook events (refunds, disputes, failures) `M`

## Stage 2 · Order operations `M–L` — *so you can run the store*
- Wire up the admin order detail panel `S`
- Cancel order (Stripe refund + Printify cancel) `M`
- Refunds, full + partial `M`
- Real tracking sync `S`
- Append-only order notes / audit log `S`

## Stage 3 · Customer communication `M`
- Resend setup `S`
- Order confirmation email `S`
- Shipped + Delivered emails `S`
- Customer order detail page `M`

## Stage 4 · Multi-store correctness `M` — *only if Adult + Kids both*
- Store each product's shop id `S`
- Route orders to the right store `M`

## Stage 5 · Returns (POD-shaped) `L`
- New order statuses `S`
- Return / RMA model `M`
- Customer return request flow `M`

## Stage 6 · Launch `S–M`
- Production Supabase + migrations
- Deploy to Vercel + all env values
- Domain + `NEXT_PUBLIC_APP_URL`
- Live Stripe webhook + signing secret
- Printify shipment webhook on live domain
- Admin account
- **Dress rehearsal** — real card, small amount: charged → Printify receives → emails arrive → Shipped → refund it back

## Stage 7 · After launch
Coupons · inventory sync · bulk order actions · structured address · packing slips · SMS · Studio extras · SLA dashboard

## Recommended order
```
Stage 0 (you) → 1 (security) → 2 (order ops) → 3 (emails) → 6 (launch)
   Stage 4 only if Adult + Kids   ·   Stage 5 close behind   ·   Stage 7 = growth
```

**Fastest sensible path:** launch **Adult-only** — skips Stage 4 entirely.
**Never:** launch without Stage 1.

---

# 5. Checklist

## Configure for production
- [ ] 🔴 Confirm billing on the Printify store
- [ ] Decide store scope — Adult / Kids / both
- [ ] 🔴 Stripe live keys (currently `sk_test_…`)
- [ ] Production Supabase — `DATABASE_URL`, `DIRECT_URL`, keys
- [ ] Admin email + real domain

## Deploy
- [ ] Deploy to Vercel + add all env values
- [ ] Point domain, set app URL
- [ ] Create live Stripe webhook (`checkout.session.completed`)
- [ ] Register Printify shipment webhook
- [ ] Create admin account at `/auth`

## Verify the full loop
- [ ] Log in as admin
- [x] Create a product → see real mockup *(verified locally)*
- [ ] Test order → Stripe charge → reaches Printify
- [ ] Status updates Shipped / Delivered via webhook

## Still open (priority order)
- [x] 🔒 **Checkout security** — server-side price validation + Printify webhook signature *(done & verified)*
- [ ] ⏭️ Multi-store order routing
- [ ] Transactional emails
- [ ] Refunds, cancel order, returns / RMA
- [ ] 🟡 Tag older Studio products

> ✅ **Security fixed.** Checkout now re-prices every line from the database (client prices are ignored), rejects draft/unknown products, caps quantity at 25 — and the Printify webhook rejects unsigned or tampered events. Verified with live attack tests.
>
> ⚠️ **One action needed:** set `PRINTIFY_WEBHOOK_SECRET` in production, or the webhook will reject all events (fails closed by design).

---

# 6. Reference

## From Printify
1. **Personal Access Token** — My Profile → Connections → Personal Access Tokens → Generate (all scopes) — *done, Adult connected*
2. **Shop IDs** — Adult `12699407`, Kids `27560160`
3. **Billing / payment method** on the store — *confirm*

## Key environment variables
| Variable | Notes |
|---|---|
| `PRINTIFY_API_TOKEN` | Printify token — set |
| `PRINTIFY_SHOP_ID` | `12699407` (Adult, primary — create + orders) |
| `PRINTIFY_SHOP_IDS` | `12699407,27560160` (both — storefront sync) |
| `STRIPE_SECRET_KEY` / publishable | swap test → **live** |
| `STRIPE_WEBHOOK_SECRET` | from live Stripe webhook |
| `DATABASE_URL` / `DIRECT_URL` | production Supabase |
| `PRINTIFY_WEBHOOK_SECRET` | **required in production** — signs Printify webhooks. Returned when the webhook is registered (also logged by `registerPrintifyWebhook`). Without it, production rejects all webhook events. |
| `MASTER_ADMIN_EMAIL` | admin login email |
| `NEXT_PUBLIC_APP_URL` | real domain (currently localhost) |
| `AUTH_SECRET` | session signing — set |
| `RESEND_API_KEY` | *(when emails are added)* |

## Tech stack
Next.js 16 (Turbopack) · React 19 · Prisma + Supabase Postgres · Stripe · Printify API · Konva (design canvas) · Tailwind · Vercel

---

## The honest summary

**Special:** in-house Design Studio with free AI — no need to open Printify.
**Missing to be a real store:** security (2 items), refunds/cancel, emails, returns. Everything else is growth.
**Never possible:** Printify's private editor assets. We build our own equivalents — and for AI, we already did.
