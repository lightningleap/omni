import {
  sendEmail,
  orderConfirmationEmail,
  newsletterWelcomeEmail,
  contactNotificationEmail,
} from "../src/lib/email"

// Where the three sample emails go. Override per run:
//   SAMPLE_EMAIL_TO=you@example.com npx tsx scripts/send-all-samples.ts
const to =
  process.env.SAMPLE_EMAIL_TO?.trim() ||
  process.env.CONTACT_INBOX?.trim() ||
  (process.env.ADMIN_EMAILS || process.env.MASTER_ADMIN_EMAIL || "").split(",")[0].trim()

if (!to) {
  throw new Error("Set SAMPLE_EMAIL_TO, CONTACT_INBOX or ADMIN_EMAILS before sending samples.")
}

async function main() {
  const r1 = await sendEmail({
    to,
    subject: "1/3 — Your UNRWLY order is confirmed ✅",
    html: orderConfirmationEmail({
      customerName: "Taniya",
      orderId: "UNRWLY-1042",
      amountPaid: 42.0,
      currency: "USD",
      items: [
        { name: "Rebel Tee", quantity: 1, price: 29.0 },
        { name: "Sticker Pack", quantity: 2, price: 6.5 },
      ],
    }),
  })
  console.log("Order confirmation:", r1.data ? "SENT ✅" : r1)

  const r2 = await sendEmail({
    to,
    subject: "2/3 — Welcome to the rebellion 🖤",
    html: newsletterWelcomeEmail(),
  })
  console.log("Newsletter welcome:", r2.data ? "SENT ✅" : r2)

  const r3 = await sendEmail({
    to,
    subject: "3/3 — New contact form submission",
    html: contactNotificationEmail({
      name: "Aarav Sharma",
      email: "aarav@example.com",
      orderNumber: "UNRWLY-1042",
      message: "Hey, my order hasn't shipped yet. Can you check?",
    }),
  })
  console.log("Contact notification:", r3.data ? "SENT ✅" : r3)
}

main()
