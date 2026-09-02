# Unrwly — Plan to Launch

How we take Unrwly from "works on my machine" to a real store taking real money.

**Effort:** `S` small · `M` medium · `L` large

---

## Where we are

**Working today**
- Design Studio — design products in-house (canvas, AI, colors/sizes, garment templates) → creates on Printify → real mockups
- Real Printify account connected (UNRWLY Adult + Kids), ~239 products synced
- Storefront + Stripe checkout → order → auto-handed to Printify
- Printify webhook marks orders Shipped / Delivered with tracking

**The honest gap**
The *happy path* works: customer pays → Printify prints → status updates. But everything **around** it is missing — you can't refund, cancel, or message a customer, and the checkout has two real security holes. That's the difference between a demo and a store.

---

## Guiding principle

> Fix what breaks **trust or money** first. Everything else is polish.

Order of priority:
1. **Security** — don't let anyone steal from us
2. **Order operations** — be able to fix a customer's problem
3. **Communication** — tell customers what's happening
4. **Returns** — handle it when it goes wrong
5. **Launch** — go live
6. **Growth** — coupons, analytics, etc.

---

## Stage 0 · Decisions (needed from you / the business)

Nothing below can finish without these. **Do these first — they're not code.**

- [ ] **Printify store scope** — launch with Adult only, or Adult + Kids?
  _Impacts Stage 4. Adult-only = simpler, ship sooner._
- [ ] **Printify billing** — payment method on the store, or nothing prints
- [ ] **Stripe live account** — business details approved, live keys available
- [ ] **Domain** — the real URL for the storefront
- [ ] **Sender email** — e.g. `orders@unrwly.com` (needed for Stage 3)

---

## Stage 1 · Security 🔴 `S–M`

**Must land before a single real payment.**

- [ ] **Server-side price re-validation at checkout** `S`
  Today checkout builds Stripe line items from **prices the browser sends**. Anyone can edit them and buy a $50 hoodie for $1. Fix: re-price every line item from the `Product` table on the server before creating the Stripe session.
- [ ] **Turn on Printify webhook signature check** `S`
  The HMAC verification is currently commented out — anyone who finds the webhook URL can fake "shipped"/"delivered" events. Fix: verify the signature, reject anything unsigned.
- [ ] **Handle more Stripe webhook events** `M`
  Only `checkout.session.completed` is handled. Refunds, disputes and failed payments made in the Stripe dashboard never reach our DB, so "paid" can silently drift from reality.

---

## Stage 2 · Order operations `M–L`

**So you can actually run the store day to day.**

- [ ] **Wire up the admin order detail panel** `S`
  `OrderControlClient.tsx` already exists in the codebase but is imported nowhere. Merge it in so you can edit status, tracking and notes. Today the only working action is "force push to Printify".
- [ ] **Cancel order** `M`
  One action that does: Stripe refund + Printify cancel + status update. Right now an order placed by mistake **cannot be stopped at all**.
- [ ] **Refunds from admin (full + partial)** `M`
  No refund code exists anywhere — despite the public Refund Policy page promising refunds. This is a live trust liability.
- [ ] **Real tracking sync** `S`
  "Sync With Factory" currently returns a fake success without calling Printify. Replace the stub.
- [ ] **Append-only order notes / audit log** `S`
  Notes are overwritten on every update — no history of who did what.

---

## Stage 3 · Customer communication `M`

**Today the customer gets zero emails. Not one.**

- [ ] **Set up Resend** `S` — free tier covers us (3k emails/month); verify the sending domain
- [ ] **Order confirmation email** `S` — on Stripe webhook success
- [ ] **Shipped + Delivered emails** `S` — on Printify webhook, include the tracking link
- [ ] **Customer order detail page** `M` — the account page shows a status label only; no tracking number, carrier or drill-down

---

## Stage 4 · Multi-store correctness `M`

**Only needed if we launch Adult + Kids together** (see Stage 0).

- [ ] **Store each product's shop id** `S` — add `shopId` to `Product`, set it on sync + create
- [ ] **Route orders to the right store** `M`
  Today every order goes to the Adult store. A Kids product ordered now would be sent to the wrong store and fail. **If we launch Adult-only, skip this stage entirely.**

---

## Stage 5 · Returns (POD-shaped) `L`

- [ ] **New order statuses** `S` — `RETURNED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `DISPUTED`. The schema literally cannot represent a returned order today.
- [ ] **Return / RMA model** `M`
- [ ] **Customer return request flow** `M` — from the account page, within the policy window

> **POD note:** returns should mean **reprint, not restock**. Nothing goes back on a shelf — there is no shelf. Build it as *"customer reports a defect with a photo → auto-approve small cases → trigger a Printify reprint or a Stripe refund"*. No item ever travels back to us. This is much simpler than classic e-commerce returns — design it that way from the start.

---

## Stage 6 · Launch `S–M`

- [ ] Production Supabase + run migrations
- [ ] Deploy to Vercel, add every env value
- [ ] Point the domain, set `NEXT_PUBLIC_APP_URL`
- [ ] Create the live Stripe webhook, add the signing secret
- [ ] Register the Printify shipment webhook on the live domain
- [ ] Create the admin account (`/auth` with `MASTER_ADMIN_EMAIL`)
- [ ] **Full dress rehearsal** — buy a real product with a real card (small amount), confirm: charged → Printify receives it → emails arrive → status flips to Shipped → refund it back

---

## Stage 7 · After launch (not blocking)

- [ ] Coupons / discount codes (only a sitewide flash-sale banner today)
- [ ] Inventory / stock sync — block checkout on sold-out variants
- [ ] Bulk order actions (checkboxes exist, nothing wired)
- [ ] Structured shipping address (currently a flattened text string)
- [ ] Packing slip / invoice PDF
- [ ] SMS notifications
- [ ] Design Studio extras — graphics library, stock photos, more fonts, undo/redo
- [ ] Fulfillment SLA dashboard, fraud/risk score surfaced pre-fulfillment

---

## Recommended order

```
Stage 0  (you)      →  decisions + accounts
Stage 1  (security) →  🔴 must, before any real payment
Stage 2  (order ops)→  can't run a store without it
Stage 3  (emails)   →  customers expect this
Stage 4  (routing)  →  only if Adult + Kids both
Stage 5  (returns)  →  before scaling volume
Stage 6  (launch)   →  go live
Stage 7             →  growth
```

**Fastest sensible path to live:** Stage 0 → 1 → 2 → 3 → 6, launching **Adult-only** (skips Stage 4), with Stage 5 close behind.

Launching without Stage 1 is the one thing we should never do.

---

## Two things worth deciding early

1. **Adult-only first?** It removes a whole stage and gets us live sooner. Kids can be added right after.
2. **Returns scope.** Full RMA is `L`. A defect-photo → reprint-or-refund flow gives 90% of the value for a fraction of the work.
