import { sendEmail, orderConfirmationEmail } from "../src/lib/email"

// Quick standalone test: sends a sample order-confirmation email.
// Run: node --env-file=.env --loader ts-node/esm scripts/test-email.ts <to-email>
const to = process.argv[2] || process.env.CONTACT_INBOX || ""

async function main() {
  if (!to) {
    console.error("No recipient. Pass an email: ... scripts/test-email.ts you@example.com")
    process.exit(1)
  }

  const res = await sendEmail({
    to,
    subject: "UNRWLY — test email ✅",
    html: orderConfirmationEmail({
      customerName: "Taniya",
      orderId: "TEST-1234",
      amountPaid: 42.0,
      currency: "USD",
      items: [
        { name: "Rebel Tee", quantity: 1, price: 29.0 },
        { name: "Sticker Pack", quantity: 2, price: 6.5 },
      ],
    }),
  })

  console.log("Result:", JSON.stringify(res, null, 2))
}

main()
