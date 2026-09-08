"use client";

import React, { useMemo, memo } from "react";
import Image from "next/image";
import { useNavigation } from "@/components/navigation-context";
import { cn } from "@/lib/utils";
import {
  FileText,
  Boxes,
  ListChecks,
  Award,
  DollarSign,
  FileCheck,
  ShieldAlert,
  FolderUp,
  Users,
  UserPlus,
  CalendarDays,
  Eye,
  Lock,
} from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";

interface SidebarProps {
  isSubmitted?: boolean;
  isLoggedIn?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = memo(
  ({ isSubmitted, isLoggedIn = false }) => {
    const { currentSection, activeSection, navigateToSection, canNavigateToSection } =
      useNavigation();

    const currentActive = activeSection || currentSection;

    const allRfpSections = useMemo(
      () => [
        { section: "requirement", title: "About the Requirement", icon: FileText },
        { section: "scope", title: "Scope of Work", icon: Boxes },
        { section: "boq", title: "BOQ/BOM", icon: ListChecks },
        { section: "evaluation", title: "Evaluation Criteria", icon: Award },
        { section: "financials", title: "Financials", icon: DollarSign },
        {
          section: "generalTerms",
          title: "General Terms & Conditions",
          icon: FileCheck,
        },
        {
          section: "specialTerms",
          title: "Special Terms & Conditions",
          icon: ShieldAlert,
        },
        { section: "documents", title: "Documents to Share", icon: FolderUp },
        { section: "vendors", title: "Vendor Selection", icon: Users },
        { section: "vendorcontacts", title: "Add Vendors", icon: UserPlus },
        { section: "dates", title: "RFQ Start and End Date", icon: CalendarDays },
        { section: "preview", title: "Preview & Submit", icon: Eye },
      ],
      [],
    );

    const visibleSections = useMemo(() => {
      if (isSubmitted) {
        return allRfpSections.filter((sec) =>
          ["vendorcontacts", "dates", "preview"].includes(sec.section),
        );
      }
      return allRfpSections;
    }, [isSubmitted, allRfpSections]);

    return (
      <ShadcnSidebar
        collapsible="icon"
        className="h-screen border-r border-slate-200 bg-gray-100/90 text-slate-800 flex flex-col justify-between shrink-0 select-none font-sans"
      >
        <SidebarHeader className="p-3 flex items-center justify-center border-b border-slate-200/80 bg-white/60 shrink-0">
          <Image
            src="/zopa-logo.svg"
            alt="ZOPA FLUX Logo"
            width={160}
            height={40}
            className="w-4/5 h-auto max-h-10 object-contain"
            priority
          />
        </SidebarHeader>

        <SidebarContent className="p-2 space-y-1 overflow-y-auto min-h-0 flex-1">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleSections.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentActive === item.section;
                  const isAccessible = canNavigateToSection
                    ? canNavigateToSection(item.section)
                    : true;

                  return (
                    <SidebarMenuItem key={item.section}>
                      <SidebarMenuButton
                        onClick={() =>
                          isAccessible && navigateToSection(item.section)
                        }
                        disabled={!isAccessible}
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all text-left font-sans cursor-pointer h-auto",
                          isActive
                            ? "bg-blue-600 text-white font-semibold shadow-xs hover:bg-blue-600 hover:text-white"
                            : isAccessible
                              ? "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                              : "text-slate-400 cursor-not-allowed hover:bg-transparent opacity-60",
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={cn(
                              "w-4 h-4 shrink-0",
                              isActive ? "text-white" : "text-slate-600",
                            )}
                          />
                          <span className="truncate">{item.title}</span>
                        </div>

                        {!isAccessible ? (
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                        ) : null}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-200 p-2 bg-slate-50/90 shrink-0">
          <NavUser />
        </SidebarFooter>
      </ShadcnSidebar>
    );
  },
);

Sidebar.displayName = "Sidebar";
