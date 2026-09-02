# Unrwly — Project Checklist

Print-on-demand storefront + in-house **Design Studio**, built on **Printify + Stripe + Supabase**.

**Legend:** `[x]` done · `[ ]` open · 🔴 blocker (fix before real customers) · ⏭️ next up · 🟡 optional

---

## Overview — two portals, one app

| Portal | Who | Where | Purpose |
|---|---|---|---|
| **Admin (Management Studio)** | You (admin) | `/admin/*` | Design products, manage orders, customers, finance, analytics |
| **Customer** | Shoppers | Storefront + `/account` | Browse, buy, track their orders |

Login routing (same `/auth` page): admin email → `/admin/products`, any other email → `/account`.

---

## 1. Built & working

### Design Studio (admin)
- [x] In-app product designer — 659 product types (live from Printify catalog)
- [x] Canvas editor — image upload, text (fonts / bold / color), shapes, layers, drag / resize / rotate
- [x] Multi-side design — Front / Back / Sleeve / Neck tabs, each designed separately
- [x] Free AI image generation — text prompt → image on canvas (no cost, no API key)
- [x] Color & size selection per product
- [x] Garment templates on canvas — t-shirt / tank / hoodie outlines shown while designing
- [x] Create → real Printify mockups (one per color) shown in-app
- [x] Product page color gallery — pick the main storefront image

### Store & data
- [x] Real Printify account connected — UNRWLY Adult + Kids
- [x] Multi-store product sync — ~239 products across both stores, all pages
- [x] Synced vs Studio separation — filter tabs (All / My Designs / Synced) + badges
- [x] Bug fixes — DB pooling, image hosts, Safari upload
- [x] Storage — Design Studio artwork goes to Printify as base64 (no host needed);
      admin image uploads go to Supabase Storage (`merch` bucket). Vercel Blob removed.

### Already in place (pre-existing)
- [x] Storefront — home, products, collections, about, faq, contact, policies, wishlist
- [x] Stripe checkout → order created → handed to Printify
- [x] Printify webhook → order marked Shipped / Delivered + tracking
- [x] Customer account page — read-only order history
- [x] Admin order view + force-push to Printify

---

## 2. Configure for production
- [ ] 🔴 **Confirm billing on the Printify store** — orders can't print without a payment method
- [ ] Decide store scope — Adult / Kids / both
- [ ] 🔴 **Stripe live keys** — currently test keys (`sk_test_…`)
- [ ] Production Supabase — `DATABASE_URL`, `DIRECT_URL`, keys
- [ ] Admin email + real domain — `MASTER_ADMIN_EMAIL`, `NEXT_PUBLIC_APP_URL` (currently localhost)

---

## 3. Deploy
- [ ] Deploy — Vercel, or self-host on a DigitalOcean droplet with `docker compose` (README → SELF-HOSTING)
- [ ] Add all env values; set `NEXT_PUBLIC_APP_URL` before building
- [ ] Point domain — A records for root and www → droplet IP (Whois.com), `SITE_DOMAIN` in `.env`
- [ ] Run `prisma migrate deploy` once against `DIRECT_URL`
- [ ] Add the domain to Supabase Auth → URL Configuration (redirect URLs)
- [ ] Create live Stripe webhook — event `checkout.session.completed`, copy signing secret
- [ ] Register Printify shipment webhook
- [ ] Create admin account — sign up at `/auth` with `MASTER_ADMIN_EMAIL`

---

## 4. Verify the full loop
- [ ] Log in as admin
- [x] Create a product → see real mockup _(verified locally)_
- [ ] Test order → Stripe charge → reaches Printify
- [ ] Status updates Shipped / Delivered via webhook

---

## 5. Still open (most important first)
- [ ] ⏭️ **Multi-store order routing** — store each product's shop so Kids orders go to the Kids store (today all orders route to Adult)
- [ ] 🔴 **Checkout security** — server-side price re-validation + turn on Printify webhook signature check
- [ ] **Transactional emails** — order confirmation, shipped, delivered (none sent today)
- [ ] **Refunds, cancel order, returns / RMA** — no flow exists yet
- [ ] 🟡 Tag older Studio products — items designed before the Studio/Synced tag show as Synced

> ⚠️ **Before taking real money:** the two **Checkout security** items are the highest priority — checkout currently trusts client-sent prices and accepts unsigned Printify webhooks.

---

## Reference

### From Printify
1. **Personal Access Token** — My Profile → Connections → Personal Access Tokens → Generate (all scopes) — _done, Adult connected_
2. **Shop IDs** — Adult `12699407`, Kids `27560160`
3. **Billing / payment method** on the store — _confirm_

### Key environment variables
| Variable | Notes |
|---|---|
| `PRINTIFY_API_TOKEN` | Printify token — set |
| `PRINTIFY_SHOP_ID` | `12699407` (Adult, primary — used for create + orders) |
| `PRINTIFY_SHOP_IDS` | `12699407,27560160` (both — storefront sync) |
| `STRIPE_SECRET_KEY` / publishable | swap test → **live** |
| `STRIPE_WEBHOOK_SECRET` | from live Stripe webhook |
| `DATABASE_URL` / `DIRECT_URL` | production Supabase |
| `MASTER_ADMIN_EMAIL` | admin login email |
| `NEXT_PUBLIC_APP_URL` | real domain (currently localhost) |
| `AUTH_SECRET` | session signing — set |
