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
    <div data-admin-surface className="flex min-h-screen bg-[#F8F9FA]">
      <AdminSidebar user={user} />
      <main className="flex-1 ml-64 p-12 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
