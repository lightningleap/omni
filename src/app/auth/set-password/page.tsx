import { redirect } from "next/navigation"
import { Lock, ArrowRight } from "lucide-react"
import { getSessionUser } from "@/lib/auth"
import { setPasswordAction } from "./actions"

/**
 * Where an invited admin lands after opening their emailed link.
 *
 * Reaching this page already means the callback exchanged the link for a
 * session, so the only thing left is choosing a password. Anyone arriving
 * without that session has an expired or reused link and is sent back to
 * sign-in rather than shown an empty form that cannot save.
 */
export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const { user } = await getSessionUser()

  if (!user) {
    redirect(`/auth?error=${encodeURIComponent("That invite link has expired. Ask for a new one.")}`)
  }

  return (
    <div className="min-h-screen bg-[#F6F6F7] flex items-center justify-center p-6 pt-20 md:pt-28 font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-10 space-y-2">
          <h1 className="type-h2 text-black">Unrwly</h1>
          <p className="type-label text-neutral-400">Choose a password</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-[40px] p-10 md:p-12 shadow-2xl shadow-neutral-200/50">
          <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
            You&apos;re signing in as{" "}
            <span className="font-bold text-black">{user!.email}</span>. Set a
            password and you&apos;ll go straight to the dashboard.
          </p>

          {error && (
            <p className="type-caption mb-8 border border-rose-100 bg-rose-50 p-4 text-center text-rose-500 uppercase tracking-[0.18em]">
              {error}
            </p>
          )}

          <form action={setPasswordAction} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-accent-700 transition-colors"
                    size={18}
                  />
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full bg-white border border-neutral-200 rounded-2xl py-4 pl-12 pr-4 text-base font-bold text-black focus:outline-none focus:ring-4 focus:ring-accent-500/10 focus:border-accent-700 transition-all placeholder:text-neutral-300"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 ml-1">At least 8 characters.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-accent-700 transition-colors"
                    size={18}
                  />
                  <input
                    name="confirm"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full bg-white border border-neutral-200 rounded-2xl py-4 pl-12 pr-4 text-base font-bold text-black focus:outline-none focus:ring-4 focus:ring-accent-500/10 focus:border-accent-700 transition-all placeholder:text-neutral-300"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200 active:scale-[0.98] uppercase tracking-widest text-[11px]"
            >
              Save and continue <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
