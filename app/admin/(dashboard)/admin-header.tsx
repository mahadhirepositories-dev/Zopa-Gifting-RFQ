"use client";

import React, { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Loader2, Shield } from "lucide-react";
import { signOut } from "@/lib/auth-client";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      } catch (e) {
        console.error("SignOut error:", e);
      }
    } finally {
      window.location.href = "/admin/login";
    }
  };

  const initial = (user.name || user.email || "A").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="h-4 w-px bg-slate-200" />
        <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-blue-600" /> Admin Portal
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-slate-200">
            <AvatarImage src={user.image || undefined} alt={user.name || "Admin"} />
            <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">
              {user.name || "Administrator"}
            </span>
            <span className="text-[10px] text-slate-500 leading-tight">
              {user.email}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs gap-1.5 h-8 cursor-pointer"
        >
          {isLoggingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>
    </header>
  );
}
