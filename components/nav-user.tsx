"use client";

import React from "react";
import { LogOut, User } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

export function NavUser() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
          Z
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">Zopa Workspace</p>
          <p className="text-[10px] text-slate-500 truncate">Guest / Demo User</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
          {session.user.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">{session.user.name || "User"}</p>
          <p className="text-[10px] text-slate-500 truncate">{session.user.email}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        title="Log out"
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
