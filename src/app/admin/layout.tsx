import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getSessionUser } from "@/lib/auth";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getSessionUser();

  // Silent gate: anyone who is not a configured admin is bounced to sign-in
  // rather than shown a 403, so the panel's existence stays unadvertised.
  if (!user || !isAdmin) {
    redirect("/auth");
  }

  return (
    <div data-admin-surface className="min-h-screen bg-[#F4F2ED]">
      <AdminSidebar user={user} />
      {/* The offset is BREAKPOINT-SCOPED. It used to be an unconditional
          `ml-64` against a sidebar that was fixed at every width, so on a
          phone the content was pushed 256px right underneath a panel that was
          already covering it — the admin scrolled sideways and could not be
          used. The rail only exists from `lg`, and so does the margin; below
          that the sidebar is a drawer and the content clears the mobile top
          bar with `pt-14` instead.

          `overflow-x-hidden` was doing the job of hiding that overflow rather
          than preventing it. It is gone: any horizontal scroll now belongs to
          the element that owns it (a wide table inside its own panel), which
          is where it can be seen and fixed. */}
      <main className="min-w-0 px-4 pb-12 pt-[4.5rem] md:px-8 lg:ml-60 lg:px-10 lg:pt-10">
        {children}
      </main>
    </div>
  );
}
