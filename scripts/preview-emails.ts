import { writeFileSync } from "fs"
import {
  orderConfirmationEmail,
  newsletterWelcomeEmail,
  contactNotificationEmail,
} from "../src/lib/email"

// Renders all 3 email templates into one HTML file you can open in a browser.
const order = orderConfirmationEmail({
  customerName: "Taniya",
  orderId: "UNRWLY-1042",
  amountPaid: 42.0,
  currency: "USD",
  items: [
    { name: "Rebel Tee", quantity: 1, price: 29.0 },
    { name: "Sticker Pack", quantity: 2, price: 6.5 },
  ],
})

const welcome = newsletterWelcomeEmail()

const contact = contactNotificationEmail({
  name: "Aarav Sharma",
  email: "aarav@example.com",
  orderNumber: "UNRWLY-1042",
  message: "Hey, my order hasn't shipped yet. Can you check?",
})

const page = `<!doctype html><html><head><meta charset="utf-8">
<style>body{background:#f3f4f6;font-family:system-ui;margin:0;padding:32px}
.card{background:#fff;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.08);max-width:600px;margin:0 auto 40px;padding:28px}
.label{max-width:600px;margin:0 auto 8px;font-weight:700;color:#374151}</style></head><body>
<div class="label">1. Order Confirmation email (customer ko)</div><div class="card">${order}</div>
<div class="label">2. Newsletter Welcome email (subscriber ko)</div><div class="card">${welcome}</div>
<div class="label">3. Contact Form notification (company ko)</div><div class="card">${contact}</div>
</body></html>`

const out = "scripts/email-preview.html"
writeFileSync(out, page)
console.log("Wrote", out)
