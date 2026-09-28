import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { getAdminUser, getSessionUser } from "@/lib/auth-session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUserRecord = await getAdminUser();

  if (!adminUserRecord) {
    const regularUser = await getSessionUser();
    if (regularUser) {
      redirect("/");
    }
    redirect("/admin/login");
  }

  const adminUser = {
    name: adminUserRecord.name,
    email: adminUserRecord.email,
    image: adminUserRecord.image,
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AdminSidebar user={adminUser} />
        <main className="flex-1 overflow-y-auto">
          <AdminHeader user={adminUser} />
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
