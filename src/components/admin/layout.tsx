import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <AdminSidebar />
      {/* Main Content Area: Offset by sidebar width (w-64) */}
      <main className="pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-10 pt-24">
          {children}
        </div>
      </main>
    </div>
  );
}
