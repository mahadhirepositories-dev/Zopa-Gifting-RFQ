"use client";

import React, { useMemo } from "react";
import { useNavigation } from "@/components/navigation-context";
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
  CheckCircle2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavUser } from "@/components/nav-user";
import Image from "next/image";

interface SidebarProps {
  isSubmitted?: boolean;
  isLoggedIn?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isSubmitted }) => {
  const { currentSection, navigateToSection } = useNavigation();

  const sections = useMemo(
    () => [
      { id: "requirement", label: "About the Requirement", icon: FileText },
      { id: "scope", label: "Scope of Work", icon: Boxes },
      { id: "boq", label: "BOQ/BOM", icon: ListChecks },
      { id: "evaluation", label: "Evaluation Criteria", icon: Award },
      { id: "financials", label: "Financials", icon: DollarSign },
      {
        id: "generalTerms",
        label: "General Terms & Conditions",
        icon: FileCheck,
      },
      {
        id: "specialTerms",
        label: "Special Terms & Conditions",
        icon: ShieldAlert,
      },
      { id: "documents", label: "Documents to Share", icon: FolderUp },
      { id: "vendors", label: "Vendor Selection", icon: Users },
      { id: "vendorcontacts", label: "Add Vendors", icon: UserPlus },
      { id: "dates", label: "RFQ Start and End Date", icon: CalendarDays },
      { id: "preview", label: "Preview & Submit", icon: Eye },
    ],
    [],
  );

  const submittedAllowed = ["vendorcontacts", "dates", "preview"];

  return (
    <aside className="w-64 h-full border-r border-slate-200 bg-gray-100 text-slate-800 flex flex-col justify-between overflow-hidden shrink-0 select-none">
      <div className="p-2 flex items-center justify-center shrink-0">
        <Image
          src="/zopa-logo.svg"
          alt="ZOPA FLUX Logo"
          width={0}
          height={0}
          className="w-4/5 h-auto"
        />
      </div>
      {/* Upper Navigation section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = currentSection === section.id;
          const isLocked =
            isSubmitted && !submittedAllowed.includes(section.id);

          return (
            <button
              key={section.id}
              onClick={() => !isLocked && navigateToSection(section.id)}
              disabled={isLocked}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors text-left font-sans",
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : isLocked
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-slate-700 hover:bg-blue-100 hover:text-blue-600",
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-white" : "text-slate-600",
                  )}
                />
                <span className="truncate">{section.label}</span>
              </div>

              {isLocked ? (
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              ) : isActive ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 ml-1" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="border-t border-slate-200 shrink-0">
        <NavUser />
      </div>
    </aside>
  );
};
