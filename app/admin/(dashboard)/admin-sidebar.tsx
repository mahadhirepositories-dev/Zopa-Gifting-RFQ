"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, FileText, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

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

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-slate-200 bg-white hidden md:flex">
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          ZOPA Admin
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
