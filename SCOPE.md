# Unrwly — Full Feature Scope

Everything this platform can do — built, buildable, and impossible.

**Status:** ✅ built · 🔨 buildable · ❌ not possible
**Effort:** `S` small · `M` medium · `L` large · `XL` very large

---

## 1. Design Studio

### Built
| Feature | Notes |
|---|---|
| ✅ Product picker | 659 product types, live from Printify catalog |
| ✅ Canvas editor | Layers, drag / resize / rotate, delete |
| ✅ Image upload | PNG / JPG / WEBP |
| ✅ Text | Font family, size, bold, colour |
| ✅ Shapes | Rectangle, circle, colour |
| ✅ Multi-side design | Front / Back / Sleeve / Neck — each separate |
| ✅ AI image generation | Text prompt → image (free, no key) |
| ✅ Colour & size selection | Choose exactly which variants to offer |
| ✅ Garment templates | T-shirt / tank / hoodie outlines on canvas |
| ✅ Live preview | Rough design-on-product preview |
| ✅ Real mockups | Printify generates per-colour mockups on create |

### Buildable
| Feature | Effort | Notes |
|---|---|---|
| 🔨 Graphics / clipart library | `M` | Our own hosted asset set — icons, shapes, badges |
| 🔨 Stock photos | `S` | Unsplash / Pexels free API search + insert |
| 🔨 More fonts | `S` | Google Fonts picker (100s of fonts) |
| 🔨 Undo / redo | `M` | Canvas history stack |
| 🔨 Duplicate layer | `S` | |
| 🔨 Alignment guides / snapping | `M` | Snap to centre, edges, other layers |
| 🔨 Layer opacity / lock | `S` | |
| 🔨 Curved / arced text | `M` | Text on a path |
| 🔨 Image filters | `M` | B&W, contrast, saturation |
| 🔨 Background removal | `M` | Via a free/paid API — big for POD |
| 🔨 Save design as template | `M` | Reuse a design across products |
| 🔨 Design library | `M` | Saved artwork, re-usable |
| 🔨 Apply one design to many products | `L` | Design once → create tee + hoodie + mug in one go |
| 🔨 Bulk product creation | `L` | Many designs → many products |
| 🔨 Better AI (paid model) | `S` | Swap free AI for OpenAI/Gemini — higher quality, costs cents/image |
| 🔨 AI prompt presets | `S` | "Vintage", "Y2K", "Minimal" style shortcuts |

### Not possible
| Feature | Why |
|---|---|
| ❌ Printify's graphics library | Their private assets — not in the API |
| ❌ Printify's AI | Not exposed via API (we use our own instead) |
| ❌ Shutterstock / Fiverr integrations | Printify-internal |
| ❌ Printify's garment line-art templates | Their private assets (we drew our own) |
| ❌ Editor preview in real garment colours | Catalog gives one photo per product, no per-colour images. Real colours appear in the Printify mockup on create |

---

## 2. Product management

### Built
| Feature | Notes |
|---|---|
| ✅ Multi-store sync | Adult + Kids, all pages (~239 products) |
| ✅ Synced vs Studio separation | Filter tabs + badges |
| ✅ Profit calculator | Retail − (cost + Stripe fees) = net, with margin % |
| ✅ Collections | Group products |
| ✅ Draft / Live gatekeeper | Can't publish without a collection |
| ✅ Colour mockup gallery | Pick the main storefront image |
| ✅ Bulk publish to collection | |
| ✅ Bulk delete | |

### Buildable
| Feature | Effort | Notes |
|---|---|---|
| 🔨 Per-variant pricing | `M` | Different price per size/colour (XL costs more) |
| 🔨 Bulk pricing rules | `M` | "Set 2.2× markup on all hoodies" |
| 🔨 Inventory / stock sync | `M` | Block checkout on sold-out variants |
| 🔨 Print provider selection | `M` | Choose factory (price/quality/location trade-off) |
| 🔨 Edit an existing product's design | `L` | Re-open in Studio, re-publish |
| 🔨 Product duplication | `S` | |
| 🔨 Bulk edit (price, status, collection) | `M` | |
| 🔨 SEO fields per product | `S` | Meta title/description (partly there) |
| 🔨 Tags / categories | `M` | Beyond collections |
| 🔨 CSV import / export | `M` | |
| 🔨 Scheduled publishing | `M` | Go live at a date/time |
| 🔨 Shipping cost display | `S` | Printify shipping API per product |

---

## 3. Storefront (customer-facing)

### Built
| Feature |
|---|
| ✅ Home, product pages, collections |
| ✅ Cart + checkout (Stripe) |
| ✅ Guest checkout |
| ✅ Wishlist |
| ✅ Account page — order history (read-only) |
| ✅ About, FAQ, Contact, Policies |
| ✅ Newsletter signup |
| ✅ Flash-sale banner |
| ✅ Sitemap / SEO basics |
| ✅ GA4 ecommerce tracking (+ server-side) |

### Buildable
| Feature | Effort | Notes |
|---|---|---|
| 🔨 Product search | `M` | Search + autocomplete |
| 🔨 Filters & sorting | `M` | By price, colour, size, category |
| 🔨 Reviews & ratings | `L` | Big for conversion |
| 🔨 Size guide | `S` | Per product type |
| 🔨 Related / recommended products | `M` | |
| 🔨 Recently viewed | `S` | |
| 🔨 Product image zoom / gallery | `S` | All colour mockups on the product page |
| 🔨 Customer order detail page | `M` | Tracking number, carrier, live link |
| 🔨 Multi-currency | `L` | |
| 🔨 Shipping calculator at checkout | `M` | Real Printify rates |
| 🔨 Blog / content pages | `M` | SEO |
| 🔨 Social share buttons | `S` | |
| 🔨 Live chat / support widget | `S` | Third-party embed |

---

## 4. Payments & pricing

### Built
| Feature |
|---|
| ✅ Stripe checkout |
| ✅ Profit / margin protection |

### Buildable
| Feature | Effort | Notes |
|---|---|---|
| 🔨 **Server-side price validation** | `S` | 🔴 **Security — checkout currently trusts browser prices** |
| 🔨 Coupons / discount codes | `M` | Only a sitewide banner today |
| 🔨 Apple Pay / Google Pay | `S` | Stripe supports out of the box |
| 🔨 Gift cards | `L` | |
| 🔨 Store credit / wallet | `L` | POD-friendly refund alternative |
| 🔨 Tax handling | `M` | Stripe Tax |
| 🔨 Bundles / upsells | `M` | "Buy 2 get 10% off" |
| 🔨 Subscriptions | `XL` | Merch drops / clubs |
| 🔨 Fraud / risk score surfaced | `S` | Stripe Radar score before fulfilment |

---

## 5. Orders & fulfilment

### Built
| Feature |
|---|
| ✅ Order created at checkout |
| ✅ Stripe webhook → mark PAID → auto-push to Printify |
| ✅ Printify webhook → Shipped / Delivered + tracking |
| ✅ Admin order list + search |
| ✅ Force-push a stuck order |
| ✅ Repair order (recover missed webhook) |

### Buildable
| Feature | Effort | Notes |
|---|---|---|
| 🔨 **Printify webhook signature check** | `S` | 🔴 **Security — currently accepts unsigned events** |
| 🔨 Admin order detail panel | `S` | Component exists, just not wired in |
| 🔨 Cancel order | `M` | Stripe refund + Printify cancel + status |
| 🔨 Refunds (full / partial) | `M` | No refund code exists today |
| 🔨 Real tracking sync | `S` | Current button is a no-op stub |
| 🔨 More Stripe webhook events | `M` | Refunds, disputes, failed payments |
| 🔨 Append-only audit log | `S` | Notes are overwritten today |
| 🔨 Bulk order actions | `M` | Checkboxes exist, nothing wired |
| 🔨 Structured shipping address | `M` | Currently a flattened text string |
| 🔨 Packing slip / invoice PDF | `M` | |
| 🔨 Split / partial shipments | `L` | Per-line-item status |
| 🔨 Multi-store order routing | `M` | Kids orders → Kids store (all go to Adult today) |
| 🔨 Fulfilment SLA dashboard | `M` | Time-to-ship, stuck-order alerts |

---

## 6. Returns & support

### Buildable (none built yet)
| Feature | Effort | Notes |
|---|---|---|
| 🔨 Return / refund order statuses | `S` | Schema can't represent a returned order today |
| 🔨 Return / RMA model | `M` | |
| 🔨 Customer return request flow | `M` | From the account page |
| 🔨 **Defect → reprint-or-refund flow** | `M` | ⭐ The POD-correct approach — photo of defect → auto-approve small cases → Printify reprint or Stripe refund. **Nothing ships back.** |
| 🔨 Store credit instead of refund | `L` | |

> **POD reality:** there is no warehouse and no shelf. Classic "ship it back and restock" doesn't apply. Build returns as **replace or refund** and it's far simpler.

---

## 7. Customer communication

### Buildable (none built yet — zero emails sent today)
| Feature | Effort | Notes |
|---|---|---|
| 🔨 Resend setup | `S` | Free tier: 3k emails/month |
| 🔨 Order confirmation email | `S` | |
| 🔨 Shipped / Delivered emails | `S` | With tracking link |
| 🔨 Refund / cancellation emails | `S` | |
| 🔨 Abandoned cart emails | `M` | Real revenue lift |
| 🔨 Review request email | `S` | Post-delivery |
| 🔨 Welcome / newsletter emails | `M` | |
| 🔨 SMS notifications | `M` | Twilio — shipped / delivered |
| 🔨 Email template system | `M` | Branded, reusable |

---

## 8. Customers & accounts

### Built
| Feature |
|---|
| ✅ Signup / login (Supabase) |
| ✅ Guest checkout |
| ✅ Admin customer list + profiles |
| ✅ Internal notes on customers |
| ✅ Role: ADMIN / CUSTOMER |

### Buildable
| Feature | Effort |
|---|---|
| 🔨 Password reset flow | `S` |
| 🔨 Social login (Google) | `S` |
| 🔨 Saved addresses | `M` |
| 🔨 Customer LTV / segments | `M` |
| 🔨 Multiple admin users + permissions | `M` |
| 🔨 Email verification | `S` |

---

## 9. Marketing & growth

### Built
| Feature |
|---|
| ✅ Flash-sale banner |
| ✅ Newsletter capture |
| ✅ GA4 tracking (browser + server-side, LTV, session stitching) |

### Buildable
| Feature | Effort |
|---|---|
| 🔨 Coupons / discount codes | `M` |
| 🔨 Referral program | `L` |
| 🔨 Affiliate / influencer codes | `L` |
| 🔨 Abandoned cart recovery | `M` |
| 🔨 Email campaigns | `M` |
| 🔨 Upsells / cross-sells | `M` |
| 🔨 Meta / TikTok pixel | `S` |
| 🔨 Product feed (Google Shopping) | `M` |

---

## 10. Analytics & reporting

### Built
| Feature |
|---|
| ✅ Finance page |
| ✅ Analytics page |
| ✅ Unit economics / profit per product |
| ✅ GA4 ecommerce funnel |

### Buildable
| Feature | Effort |
|---|---|
| 🔨 Best sellers / worst performers | `M` |
| 🔨 Profit dashboard over time | `M` |
| 🔨 Conversion funnel in-app | `M` |
| 🔨 Cohort / retention analysis | `L` |
| 🔨 Export reports (CSV) | `S` |

---

## 11. Multi-store & channels

### Built
| Feature |
|---|
| ✅ Sync from multiple Printify stores (Adult + Kids) |

### Buildable
| Feature | Effort | Notes |
|---|---|---|
| 🔨 Per-store order routing | `M` | Required to sell both stores safely |
| 🔨 Store filter in admin | `S` | See which store a product is from |
| 🔨 Etsy sync awareness | `M` | Both stores are Etsy-connected — publish/unpublish control |
| 🔨 Multi-channel publishing | `L` | Website + Etsy + others from one place |

---

## 12. Platform & ops

### Buildable
| Feature | Effort | Notes |
|---|---|---|
| 🔨 Error monitoring | `S` | Sentry |
| 🔨 Staging environment | `S` | Test before prod |
| 🔨 Rate limiting | `S` | Protect API routes |
| 🔨 Automated backups | `S` | Supabase |
| 🔨 CI (typecheck + build on PR) | `S` | |
| 🔨 Image CDN / optimisation | `S` | Mostly handled by Next |
| 🔨 Cron: auto-sync products daily | `S` | |

---

## The honest summary

**What makes this platform special (already built):** an in-house Design Studio with free AI — most POD storefronts make you go to Printify to design. Ours doesn't.

**What's genuinely missing to be a real store:** security (2 items), refunds/cancel, emails, returns. Everything else is growth.

**What we can never have:** Printify's private editor assets (their clipart, AI, stock integrations, garment line-art). We build our own equivalents instead — and for AI we already did.
