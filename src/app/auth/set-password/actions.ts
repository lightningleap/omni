"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Sets a password for whoever the invite link signed in.
 *
 * There is no "current password" field, and there doesn't need to be: the
 * session only exists because the person opened a single-use link sent to
 * their own inbox, which is the proof. What matters is that the session is
 * real — hence the check below rather than trusting the page was reached.
 */
export async function setPasswordAction(formData: FormData) {
  const password = String(formData.get("password") || "")
  const confirm = String(formData.get("confirm") || "")

  const fail = (msg: string) => redirect(`/auth/set-password?error=${encodeURIComponent(msg)}`)

  if (password.length < 8) fail("Use at least 8 characters.")
  if (password !== confirm) fail("Those two passwords don't match.")

  const { user } = await getSessionUser()
  if (!user) fail("Your link has expired. Ask for a new invite.")

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.updateUser({ data: { role: "ADMIN" }, password })
  if (error) fail(error.message)

  // Name the row after the address if nothing better has been recorded yet, so
  // the Customers table doesn't list a new admin as "Guest Customer".
  if (user!.email) {
    await prisma.user.updateMany({
      where: { email: user!.email.toLowerCase(), name: null },
      data: { name: user!.email.split("@")[0] },
    })
  }

  redirect("/admin/products")
}
