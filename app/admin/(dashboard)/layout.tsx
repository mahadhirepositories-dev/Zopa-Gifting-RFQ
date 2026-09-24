import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/admin/login");
  }

  if (session.user.role !== "admin") {
    // If they are logged in but not an admin, redirect them out
    redirect("/");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 border-b bg-white flex items-center justify-between">
            <SidebarTrigger />
            <div className="font-semibold text-slate-800">Admin Portal</div>
            <div className="text-sm text-slate-500">{session.user.name}</div>
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
