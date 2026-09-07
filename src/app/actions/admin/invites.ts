"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { sendEmail, adminInviteEmail } from "@/lib/email"

/**
 * Invite someone into the admin panel by email.
 *
 * Before this, a new admin had to sign up as a customer first and then be
 * promoted from the Customers table — which meant handing the person a
 * confusing two-step and no way to reach them if they never signed up.
 *
 * The link itself is minted by Supabase (signed, single-use, 24h) but sent
 * through Resend, so it arrives from the store's own address rather than
 * Supabase's, and doesn't depend on SMTP being configured in the Supabase
 * dashboard.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type InviteResult =
  | { success: true; message: string }
  | { success: false; message: string }

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function inviteAdmin(formData: FormData): Promise<InviteResult> {
  const invitedBy = await requireAdmin()

  const email = String(formData.get("email") || "").toLowerCase().trim()
  if (!EMAIL_RE.test(email)) {
    return { success: false, message: "That doesn't look like an email address." }
  }

  const supabase = adminClient()
  if (!supabase) {
    return { success: false, message: "Supabase is not configured on this server." }
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "")
  if (!appUrl) {
    return { success: false, message: "NEXT_PUBLIC_APP_URL is not set, so the invite link would be broken." }
  }

  // Does an account already exist? listUsers is paged, so filter by email
  // rather than assuming the first page holds everyone.
  const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const account = existing?.users?.find((u) => u.email?.toLowerCase() === email)

  try {
    if (account) {
      // They can already sign in. Promoting is the whole job; the email is a
      // courtesy so they know the dashboard is now there.
      await grantAdmin(email)
      await sendEmail({
        to: email,
        subject: "You now have admin access to UNRWLY",
        html: adminInviteEmail({
          inviteUrl: `${appUrl}/admin`,
          invitedBy: invitedBy.email,
          isExistingAccount: true,
        }),
      })

      revalidatePath("/admin/customers")
      return { success: true, message: `${email} already had an account — they're an admin now and have been emailed.` }
    }

    // No account yet: mint an invite link they can set a password with.
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "invite",
      email,
      options: { redirectTo: `${appUrl}/auth/callback?next=/auth/set-password` },
    })

    if (error || !data?.properties?.action_link) {
      console.error("[INVITE] generateLink failed:", error?.message)
      return { success: false, message: error?.message || "Could not create the invite link." }
    }

    // Grant the role now, so the dashboard is open the moment they finish
    // setting a password — the gate reads this row, not Supabase metadata.
    await grantAdmin(email)

    const sent = await sendEmail({
      to: email,
      subject: "You've been invited to the UNRWLY admin dashboard",
      html: adminInviteEmail({
        inviteUrl: data.properties.action_link,
        invitedBy: invitedBy.email,
      }),
    })

    revalidatePath("/admin/customers")

    if ("error" in sent && sent.error) {
      return { success: false, message: "The invite was created but the email could not be sent. Check the Resend configuration." }
    }
    if ("skipped" in sent && sent.skipped) {
      return { success: false, message: "RESEND_API_KEY is not set, so no email went out." }
    }

    return { success: true, message: `Invite sent to ${email}.` }
  } catch (err) {
    console.error("[INVITE] failed:", err)
    const message = err instanceof Error ? err.message : "The invite could not be sent."
    return { success: false, message }
  }
}

/**
 * The database row is what grants access (see src/lib/auth.ts), and an invited
 * user has no row yet — one is only created lazily when someone opens their
 * account page. Without this the invite would land them on a dashboard that
 * immediately bounces them back to sign-in.
 */
async function grantAdmin(email: string) {
  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { email, role: "ADMIN" },
  })
}
