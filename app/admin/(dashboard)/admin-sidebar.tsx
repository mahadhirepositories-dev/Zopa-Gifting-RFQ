"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Building2,
  FileText,
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  ChevronsUpDown,
  Loader2,
  Shield,
  Building,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "@/lib/auth-client";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Buyers",
    href: "/admin/buyers",
    icon: Users,
  },
  {
    title: "Vendors",
    href: "/admin/vendors",
    icon: Building2,
  },
  {
    title: "RFQs",
    href: "/admin/rfqs",
    icon: FileText,
  },
  {
    title: "Admin Users",
    href: "/admin/users",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AdminSidebar({ user: initialUser }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const currentUser = {
    name: initialUser?.name || session?.user?.name || "Admin User",
    email: initialUser?.email || session?.user?.email || "admin@zopapro.com",
    image: initialUser?.image || session?.user?.image || undefined,
  };

  const initialLetter = (currentUser.name || currentUser.email || "A")
    .charAt(0)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const cookiesToClear = [
        "better-auth.session_token",
        "__Secure-better-auth.session_token",
        "zopa_user_email",
        "zopa_user_name",
        "zopa_user_mobile",
        "zopa_user_company",
      ];
      cookiesToClear.forEach((name) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
      });

      try {
        await signOut();
      } catch (err) {
        console.error("SignOut error:", err);
      }
    } finally {
      window.location.href = "/admin/login";
    }
  };

  return (
    <>
      <Sidebar className="border-r border-slate-200 bg-white">
        <SidebarHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              Z
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-base leading-tight tracking-tight">
                ZOPA Admin
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Procurement Portal
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon
                            className={cn(
                              "w-4 h-4 shrink-0",
                              isActive ? "text-white" : "text-slate-500"
                            )}
                          />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-200 p-2 bg-slate-50/70">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="w-full justify-between p-2 rounded-lg hover:bg-slate-200/60 data-[state=open]:bg-slate-200/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-8 w-8 rounded-full shrink-0 border border-slate-300">
                        <AvatarImage
                          src={currentUser.image}
                          alt={currentUser.name}
                        />
                        <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs">
                          {initialLetter}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left min-w-0 overflow-hidden">
                        <span className="truncate text-xs sm:text-sm font-semibold text-slate-800">
                          {currentUser.name}
                        </span>
                        <span className="truncate text-[11px] text-slate-500">
                          {currentUser.email}
                        </span>
                      </div>
                    </div>
                    <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  sideOffset={8}
                  className="w-56 rounded-lg bg-white border border-slate-200 shadow-lg p-1 text-slate-700"
                >
                  <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 rounded-full border border-slate-200">
                        <AvatarImage
                          src={currentUser.image}
                          alt={currentUser.name}
                        />
                        <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs">
                          {initialLetter}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {currentUser.name}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate">
                          {currentUser.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuItem
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-md cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Admin Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md cursor-pointer font-medium"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    ) : (
                      <LogOut className="w-4 h-4 text-red-600" />
                    )}
                    <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Admin Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Shield className="w-5 h-5 text-blue-600" />
              Admin Profile
            </DialogTitle>
            <DialogDescription>
              Your administrator account credentials and system privileges.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <Avatar className="h-12 w-12 rounded-full border border-slate-300">
                <AvatarImage
                  src={currentUser.image}
                  alt={currentUser.name}
                />
                <AvatarFallback className="bg-blue-600 text-white font-bold text-base">
                  {initialLetter}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <h4 className="font-semibold text-slate-900 text-base truncate">
                  {currentUser.name}
                </h4>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.email}
                </p>
              </div>
            </div>

            <div className="grid gap-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Access Level
                </span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Super Administrator
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-500" />
                  Portal
                </span>
                <span className="font-medium text-slate-800">
                  ZOPA Gifting RFQ Portal
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>{isLoggingOut ? "Signing out..." : "Log out"}</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
