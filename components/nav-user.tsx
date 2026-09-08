"use client";

import React, { useState, useSyncExternalStore } from "react";
import {
  ChevronsUpDown,
  LogOut,
  User,
  LogIn,
  Loader2,
  Mail,
  Shield,
  Building,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) return decodeURIComponent(match[2]);
  return null;
}

const noopSubscribe = () => () => {};
let cachedEmail: string | null = null;
let cachedLocalUser: { name: string; email: string; image?: string } | null =
  null;

function getLocalUserSnapshot() {
  const email = getCookieValue("zopa_user_email");
  if (email !== cachedEmail) {
    cachedEmail = email;
    cachedLocalUser = email
      ? {
          email,
          name: getCookieValue("zopa_user_name") || email.split("@")[0],
        }
      : null;
  }
  return cachedLocalUser;
}

function getServerSnapshot() {
  return null;
}

function getSingleInitial(name?: string | null, email?: string | null): string {
  const source = (name?.trim() || email?.trim() || "").replace(
    /^[^a-zA-Z]+/,
    "",
  );
  return source ? source.charAt(0).toUpperCase() : "U";
}

export function NavUser() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const localUserData = useSyncExternalStore(
    noopSubscribe,
    getLocalUserSnapshot,
    getServerSnapshot,
  );

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Clear local session cookies
      document.cookie =
        "zopa_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie =
        "zopa_user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie =
        "zopa_user_mobile=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie =
        "zopa_user_company=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie =
        "better-auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie =
        "__Secure-better-auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

      await signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const activeUser = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        image: session.user.image || undefined,
      }
    : localUserData;

  if (isPending && !localUserData) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="w-full justify-start gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
            <div className="grid flex-1 text-left text-sm leading-tight gap-1 min-w-0">
              <div className="h-3.5 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-2.5 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!activeUser) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="w-full justify-between p-2 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 rounded-full shrink-0 bg-slate-200 border border-slate-300">
                    <AvatarFallback className="bg-slate-300 text-slate-700 font-bold text-xs">
                      Z
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left min-w-0 overflow-hidden">
                    <span className="truncate text-xs sm:text-sm font-semibold text-slate-800">
                      Zopa Workspace
                    </span>
                    <span className="truncate text-[11px] text-slate-500">
                      Guest / Demo User
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
              className="w-56 rounded-lg bg-white border border-slate-200 shadow-md p-1"
            >
              <DropdownMenuItem
                onClick={() => router.push("/")}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-md cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-slate-500" />
                <span>Log in / Sign up</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const initialLetter = getSingleInitial(activeUser.name, activeUser.email);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="w-full justify-between p-2 rounded-lg hover:bg-slate-200/60 data-[state=open]:bg-slate-200/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 rounded-full shrink-0 bg-slate-200 border border-slate-300">
                    <AvatarImage src={activeUser.image} alt={activeUser.name} />
                    <AvatarFallback className="bg-slate-300 text-slate-700 font-semibold text-xs">
                      {initialLetter}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left min-w-0 overflow-hidden">
                    <span className="truncate text-xs sm:text-sm font-semibold text-slate-800">
                      {activeUser.name}
                    </span>
                    <span className="truncate text-[11px] text-slate-500">
                      {activeUser.email}
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
              className="w-48 rounded-lg bg-white border border-slate-200 shadow-lg p-1 text-slate-700"
            >
              <DropdownMenuItem
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-md cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-md cursor-pointer"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                ) : (
                  <LogOut className="w-4 h-4 text-slate-500" />
                )}
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* User Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <User className="w-5 h-5 text-blue-600" />
              User Profile
            </DialogTitle>
            <DialogDescription>
              Your active account details and organization permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <Avatar className="h-12 w-12 rounded-full border border-slate-300">
                <AvatarImage src={activeUser.image} alt={activeUser.name} />
                <AvatarFallback className="bg-blue-600 text-white font-bold text-base">
                  {initialLetter}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <h4 className="font-semibold text-slate-900 text-base truncate">
                  {activeUser.name}
                </h4>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {activeUser.email}
                </p>
              </div>
            </div>

            <div className="grid gap-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Account Status
                </span>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-500" />
                  Workspace
                </span>
                <span className="font-medium text-slate-800">
                  ZOPA FLUX Gifting
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
