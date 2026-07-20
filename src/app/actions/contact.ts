"use server";

import { sendEmail, contactNotificationEmail } from "@/lib/email";

/**
 * Contact Form Server Action
 * Handles contact submissions from the UI and notifies the team via email.
 */
export async function handleContactForm(formData: FormData) {
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const orderNumber = String(formData.get("orderNumber") || "");
  const message = String(formData.get("message") || "");

  if (!email || !message) {
    return { success: false, message: "Please fill in your email and message." };
  }

  const to = process.env.CONTACT_INBOX || process.env.MASTER_ADMIN_EMAIL;

  if (to) {
    await sendEmail({
      to,
      subject: `New contact form: ${name || email}`,
      html: contactNotificationEmail({ name, email, orderNumber, message }),
      replyTo: email,
    });
  } else {
    console.warn("[CONTACT] No CONTACT_INBOX/MASTER_ADMIN_EMAIL set — logging instead:", {
      name,
      email,
      orderNumber,
      message,
    });
  }

  return {
    success: true,
    message: "Message Sent!",
  };
}
