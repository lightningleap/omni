"use server";

import { sendEmail, newsletterWelcomeEmail } from "@/lib/email";

/**
 * Newsletter Subscription Server Action
 * Handles email submissions for marketing and sends a welcome email.
 */
export async function subscribeToNewsletter(formData: FormData) {
  const email = String(formData.get("email") || "");

  if (!email) {
    return { success: false, message: "Please enter a valid email." };
  }

  await sendEmail({
    to: email,
    subject: "Welcome to the rebellion — here's your 10% off",
    html: newsletterWelcomeEmail(),
  });

  return {
    success: true,
    message: "Welcome to the rebellion. Check your inbox for your 10% discount.",
  };
}
