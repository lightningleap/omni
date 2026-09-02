import { Resend } from "resend"

/**
 * Centralised email sending via Resend.
 * All outbound mail should go through sendEmail() so we have one place
 * to handle the API key, the from-address and error logging.
 */

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// e.g. "UNRWLY <hello@unrwly.com>" — must be a domain you've verified in Resend.
const FROM = process.env.EMAIL_FROM || "UNRWLY <onboarding@resend.dev>"

type SendArgs = {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail({ to, subject, html, replyTo }: SendArgs) {
  // If the key isn't configured (e.g. local dev), don't crash the flow —
  // just log so the rest of the request still succeeds.
  if (!resend) {
    console.warn("[EMAIL] RESEND_API_KEY not set — skipping send:", { to, subject })
    return { skipped: true }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      replyTo,
    })

    if (error) {
      console.error("[EMAIL] Resend error:", error)
      return { error }
    }

    return { data }
  } catch (err) {
    console.error("[EMAIL] Send failed:", err)
    return { error: err }
  }
}

// ---- Templates -------------------------------------------------------------

const wrap = (inner: string) => `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#111">
    <h1 style="font-size:20px;letter-spacing:0.5px">UNRWLY</h1>
    ${inner}
    <hr style="border:none;border-top:1px solid #eee;margin:32px 0" />
    <p style="font-size:12px;color:#888">You're receiving this because you interacted with UNRWLY.</p>
  </div>
`

export function orderConfirmationEmail(opts: {
  customerName?: string | null
  orderId: string
  amountPaid: number
  currency: string
  items: { name: string; quantity: number; price: number }[]
}) {
  const rows = opts.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.quantity}× ${i.name}</td><td style="padding:6px 0;text-align:right">${opts.currency} ${(i.price * i.quantity).toFixed(2)}</td></tr>`
    )
    .join("")

  return wrap(`
    <p>Hey ${opts.customerName || "there"},</p>
    <p>Thanks for your order — we're on it. Here's your confirmation:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">${rows}
      <tr><td style="padding:10px 0;border-top:1px solid #eee;font-weight:600">Total</td>
      <td style="padding:10px 0;border-top:1px solid #eee;text-align:right;font-weight:600">${opts.currency} ${opts.amountPaid.toFixed(2)}</td></tr>
    </table>
    <p style="font-size:13px;color:#666">Order ref: ${opts.orderId}</p>
  `)
}

export function newsletterWelcomeEmail() {
  return wrap(`
    <p>Welcome to the rebellion.</p>
    <p>Here's your <strong>10% discount code: <code>UNRWLY10</code></strong> — use it at checkout.</p>
  `)
}

export function contactNotificationEmail(opts: {
  name: string
  email: string
  orderNumber?: string
  message: string
}) {
  return wrap(`
    <p><strong>New contact form submission</strong></p>
    <p><b>Name:</b> ${opts.name}<br/>
       <b>Email:</b> ${opts.email}<br/>
       ${opts.orderNumber ? `<b>Order #:</b> ${opts.orderNumber}<br/>` : ""}
    </p>
    <p><b>Message:</b><br/>${opts.message.replace(/\n/g, "<br/>")}</p>
  `)
}
