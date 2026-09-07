import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

/**
 * Where Supabase sends people after they open an emailed link — an admin
 * invite today, a password reset next.
 *
 * The link carries a one-time `code`; exchanging it here is what turns it into
 * a session cookie. Only after that can the visitor set a password, because
 * `updateUser` acts on the signed-in user.
 *
 * `next` decides where they land afterwards, and is restricted to in-app paths:
 * an open redirect on an authentication callback is how a phishing page ends up
 * wearing your domain.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get("code")
  const requested = searchParams.get("next") || "/admin"
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/admin"

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent("That link is missing its code. Ask for a new invite.")}`)
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    // Expired or already used — both are ordinary, and both need a new link.
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent("That link has expired or was already used. Ask for a new invite.")}`
    )
  }

  return NextResponse.redirect(`${origin}${next}`)
}
