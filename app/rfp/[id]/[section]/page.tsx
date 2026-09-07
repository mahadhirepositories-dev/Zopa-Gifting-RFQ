/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Briefcase,
  Layers,
  CheckSquare,
  DollarSign,
  FileCheck,
  FileSpreadsheet,
  UploadCloud,
  Users,
  UserPlus,
  Calendar,
  Eye,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  User as UserIcon,
  LogOut,
} from "lucide-react";

const sidebarNavItems = [
  {
    id: "requirement",
    label: "About the Requirement",
    icon: FileText,
    stepNum: 2,
  },
  { id: "scope", label: "Scope of Work", icon: Briefcase, stepNum: 3 },
  { id: "boq", label: "BOQ/BOM", icon: Layers, stepNum: 4 },
  {
    id: "evaluation",
    label: "Evaluation Criteria",
    icon: CheckSquare,
    stepNum: 5,
  },
  { id: "financials", label: "Financials", icon: DollarSign, stepNum: 6 },
  {
    id: "terms",
    label: "General Terms & Conditions",
    icon: FileCheck,
    stepNum: 7,
  },
  {
    id: "special-terms",
    label: "Special Terms & Conditions",
    icon: FileSpreadsheet,
    stepNum: 8,
  },
  {
    id: "documents",
    label: "Documents to Share",
    icon: UploadCloud,
    stepNum: 9,
  },
  { id: "vendors", label: "Vendor Selection", icon: Users, stepNum: 10 },
  { id: "add-vendors", label: "Add Vendors", icon: UserPlus, stepNum: 11 },
  { id: "dates", label: "RFQ Start and End Date", icon: Calendar, stepNum: 12 },
  { id: "preview", label: "Preview & Submit", icon: Eye, stepNum: 13 },
];

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) return decodeURIComponent(match[2]);
  return "";
}

export default function RFPSectionPage({
  params,
}: {
  params: Promise<{ id: string; section: string }>;
}) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const rfpId = resolvedParams.id;
  const activeSection = resolvedParams.section || "requirement";

  // UI state for bottom-left user menu popover
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Comprehensive RFQ Form State initialized with logged-in user defaults
  const [formData, setFormData] = useState({
    // 1. Company & Buyer Details
    companyName: "KG Corp",
    companyAddress:
      "894, Sri Ram Colony , Jai Ram Puram, Chennai, Tamil Nadu, 600014, India",
    companyBusiness: "Retail",
    contactName: "Devipriya Venkatesan",
    contactEmail: "devipriyavenkatesan.v@gmail.com",
    contactPhone: "+91 8521479630",

    // 2. Requirement
    projectName: "",
    purpose: "",

    // 3. Scope of Work
    scopeText:
      "Procure, assemble, custom-brand, and distribute premium executive gift boxes containing eco-friendly leather planners, stainless steel thermoses, handcrafted artisanal sweets, and custom-embossed greeting cards.",
    deliverables:
      "Sample approval within 7 days, bulk packaging by Oct 15, doorstep distribution by Oct 20.",

    // 4. BOQ Items
    boqItems: [
      {
        id: "1",
        item: "Executive Leather Planner",
        qty: "500",
        targetPrice: "₹850",
        specs: "A5 size, tan brown, debossed company logo",
      },
      {
        id: "2",
        item: "Insulated Stainless Thermos",
        qty: "500",
        targetPrice: "₹1,200",
        specs: "750ml, matte black finish, laser engraved",
      },
      {
        id: "3",
        item: "Artisanal Sweet Box",
        qty: "500",
        targetPrice: "₹950",
        specs: "Assorted dry-fruit sweets, FSSAI certified",
      },
    ],

    // 5. Evaluation Criteria
    techWeight: "60",
    priceWeight: "40",
    deliveryWeight: "Strict deadline compliance required",

    // 6. Financials
    currency: "INR (₹)",
    paymentTerms: "100% post-delivery verification within 30 days",
    estimatedBudget: "₹15,00,000",

    // 7. General Terms
    warrantyPeriod: "6 Months replacement warranty on damaged goods",
    penaltyClause: "0.5% per day delay up to maximum 10% of order value",

    // 8. Special Terms
    brandingSpecs: "Pantone matched logo printing, custom tissue wrapping",
    ndaRequired: true,

    // 9. Documents to Share
    documents: [
      { name: "Brand_Identity_Guidelines.pdf", size: "2.4 MB" },
      { name: "Packaging_Design_Template.ai", size: "12.1 MB" },
    ],

    // 10 & 11. Vendors
    selectedVendors: [
      "GiftCraft Solutions",
      "LuxCorp Merchandising",
      "Apex Premium Gifts",
    ],
    customVendorName: "",
    customVendorEmail: "",

    // 12. Dates
    startDate: "2026-09-10",
    endDate: "2026-09-25",
    awardDate: "2026-09-28",
  });

  // Read user details from session cookies or params on mount
  useEffect(() => {
    const cookieName = getCookie("zopa_user_name");
    const cookieEmail = getCookie("zopa_user_email");
    const cookieMobile = getCookie("zopa_user_mobile");
    const cookieCompany = getCookie("zopa_user_company");

    const urlName = searchParams.get("name");
    const urlEmail = searchParams.get("email");
    const urlMobile = searchParams.get("mobile");
    const urlCompany = searchParams.get("company");

    setFormData((prev) => ({
      ...prev,
      contactName: urlName || cookieName || prev.contactName,
      contactEmail: urlEmail || cookieEmail || prev.contactEmail,
      contactPhone: urlMobile || cookieMobile || prev.contactPhone,
      companyName: urlCompany || cookieCompany || prev.companyName,
    }));
  }, [searchParams]);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const activeNav =
    sidebarNavItems.find((item) => item.id === activeSection) ||
    sidebarNavItems[0];
  const activeIndex = sidebarNavItems.findIndex(
    (item) => item.id === activeSection,
  );
  const nextSection = sidebarNavItems[activeIndex + 1]?.id;
  const prevSection = sidebarNavItems[activeIndex - 1]?.id;

  const handleNext = () => {
    if (nextSection) {
      router.push(`/rfp/${rfpId}/${nextSection}`);
    } else {
      setIsSubmitted(true);
    }
  };

  const handlePrev = () => {
    if (prevSection) {
      router.push(`/rfp/${rfpId}/${prevSection}`);
    } else {
      router.push("/");
    }
  };

  const handleLogout = () => {
    // Clear cookies on logout
    if (typeof document !== "undefined") {
      document.cookie =
        "zopa_user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie =
        "zopa_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie =
        "zopa_user_mobile=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie =
        "zopa_user_company=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
    router.push("/");
  };

  const handleAddBoqRow = () => {
    setFormData({
      ...formData,
      boqItems: [
        ...formData.boqItems,
        {
          id: String(Date.now()),
          item: "",
          qty: "100",
          targetPrice: "₹0",
          specs: "",
        },
      ],
    });
  };

  const handleRemoveBoqRow = (id: string) => {
    setFormData({
      ...formData,
      boqItems: formData.boqItems.filter((i) => i.id !== id),
    });
  };

  const handleAddCustomVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.customVendorName.trim()) {
      setFormData({
        ...formData,
        selectedVendors: [
          ...formData.selectedVendors,
          formData.customVendorName.trim(),
        ],
        customVendorName: "",
        customVendorEmail: "",
      });
    }
  };

  const userInitial = formData.contactName
    ? formData.contactName.charAt(0).toUpperCase()
    : "D";

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 overflow-hidden text-slate-900 font-sans">
      {/* Main Workspace Body */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* ========================================================================= */}
        {/* 1. LEFT SIDEBAR: Step Navigation & User Profile                           */}
        {/* ========================================================================= */}
        <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between h-full z-20 relative">
          {/* Logo Header */}
          <div className="p-4 border-b border-slate-100 flex items-center space-x-2">
            <Image
              src="/zopa-logo.svg"
              alt="ZOPA Logo"
              width={140}
              height={40}
              priority
              className="h-8 w-auto"
            />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
              FLUX
            </span>
          </div>

          {/* Navigation Steps */}
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeSection;

              return (
                <Link
                  key={item.id}
                  href={`/rfp/${rfpId}/${item.id}`}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile Footer Container */}
          <div className="relative border-t border-slate-200 bg-white">
            {/* Popover Profile Menu */}
            {showProfileMenu && (
              <div className="absolute bottom-full left-3 mb-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-3 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <span>Profile</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-3 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-slate-500" />
                  <span>Log out</span>
                </button>
              </div>
            )}

            {/* Profile Selector Trigger */}
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="p-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {formData.contactName}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {formData.contactEmail}
                  </div>
                </div>
              </div>
              <div className="text-slate-400 flex flex-col items-center shrink-0">
                <ChevronUp className="w-3 h-3" />
                <ChevronDown className="w-3 h-3 -mt-1" />
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 2. MIDDLE COLUMN: Form Editor Section                                      */}
        {/* ========================================================================= */}
        <main className="flex-1 overflow-y-auto p-3 lg:p-4 bg-slate-50 border-r border-slate-200 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Main Form Section Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {activeNav.stepNum}. {activeNav.label}
                </h2>
                <Badge variant="secondary" className="text-[10px] font-bold">
                  Step {activeIndex + 1} of {sidebarNavItems.length}
                </Badge>
              </div>

              {/* ---------------- SECTION 1: ABOUT THE REQUIREMENT ---------------- */}
              {activeSection === "requirement" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      Project name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g., Office Network Upgrade Project"
                      value={formData.projectName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectName: e.target.value,
                        })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      Purpose <span className="text-rose-500">*</span>
                    </Label>
                    <textarea
                      rows={4}
                      placeholder="e.g., Upgrading existing network infrastructure to support remote work capabilities"
                      value={formData.purpose}
                      onChange={(e) =>
                        setFormData({ ...formData, purpose: e.target.value })
                      }
                      className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* ---------------- SECTION 2: SCOPE OF WORK ---------------- */}
              {activeSection === "scope" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      Scope Description <span className="text-rose-500">*</span>
                    </Label>
                    <textarea
                      rows={4}
                      placeholder="Describe the overall scope of supply or service..."
                      value={formData.scopeText}
                      onChange={(e) =>
                        setFormData({ ...formData, scopeText: e.target.value })
                      }
                      className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      Key Deliverables & Milestones
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g., Sample approval by Day 7, Delivery by Oct 20"
                      value={formData.deliverables}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliverables: e.target.value,
                        })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* ---------------- SECTION 3: BOQ/BOM ---------------- */}
              {activeSection === "boq" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-700">
                      Bill of Quantities / Line Items
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddBoqRow}
                      className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Item
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formData.boqItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-700">
                            Item #{idx + 1}
                          </span>
                          {formData.boqItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBoqRow(item.id)}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Item Name"
                            value={item.item}
                            onChange={(e) => {
                              const updated = [...formData.boqItems];
                              updated[idx].item = e.target.value;
                              setFormData({ ...formData, boqItems: updated });
                            }}
                            className="bg-white text-xs rounded-lg"
                          />
                          <Input
                            placeholder="Quantity"
                            value={item.qty}
                            onChange={(e) => {
                              const updated = [...formData.boqItems];
                              updated[idx].qty = e.target.value;
                              setFormData({ ...formData, boqItems: updated });
                            }}
                            className="bg-white text-xs rounded-lg"
                          />
                        </div>
                        <Input
                          placeholder="Specifications / Requirements"
                          value={item.specs}
                          onChange={(e) => {
                            const updated = [...formData.boqItems];
                            updated[idx].specs = e.target.value;
                            setFormData({ ...formData, boqItems: updated });
                          }}
                          className="bg-white text-xs rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------------- SECTION 4: EVALUATION CRITERIA ---------------- */}
              {activeSection === "evaluation" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold text-slate-700">
                        Technical Weightage (%)
                      </Label>
                      <Input
                        type="number"
                        value={formData.techWeight}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            techWeight: e.target.value,
                          })
                        }
                        className="bg-slate-50 border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700">
                        Commercial Weightage (%)
                      </Label>
                      <Input
                        type="number"
                        value={formData.priceWeight}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priceWeight: e.target.value,
                          })
                        }
                        className="bg-slate-50 border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      Delivery & SLA Requirements
                    </Label>
                    <Input
                      type="text"
                      value={formData.deliveryWeight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryWeight: e.target.value,
                        })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* ---------------- SECTION 5: FINANCIALS ---------------- */}
              {activeSection === "financials" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      Currency
                    </Label>
                    <Input
                      type="text"
                      value={formData.currency}
                      onChange={(e) =>
                        setFormData({ ...formData, currency: e.target.value })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      Payment Terms
                    </Label>
                    <Input
                      type="text"
                      value={formData.paymentTerms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentTerms: e.target.value,
                        })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      Estimated Project Budget
                    </Label>
                    <Input
                      type="text"
                      value={formData.estimatedBudget}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedBudget: e.target.value,
                        })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* ---------------- SECTION 6 & 7: TERMS & CONDITIONS ---------------- */}
              {(activeSection === "terms" ||
                activeSection === "special-terms") && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      Warranty & Guarantee Terms
                    </Label>
                    <Input
                      type="text"
                      value={formData.warrantyPeriod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          warrantyPeriod: e.target.value,
                        })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      Penalty & Delay Clauses
                    </Label>
                    <Input
                      type="text"
                      value={formData.penaltyClause}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          penaltyClause: e.target.value,
                        })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      Custom Branding & Packaging Specifications
                    </Label>
                    <Input
                      type="text"
                      value={formData.brandingSpecs}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brandingSpecs: e.target.value,
                        })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* ---------------- SECTION 8: DOCUMENTS TO SHARE ---------------- */}
              {activeSection === "documents" && (
                <div className="space-y-4">
                  <Label className="text-xs font-bold text-slate-700">
                    Attached Files & Technical Specifications
                  </Label>
                  <div className="border-2 border-dashed border-slate-200 p-6 rounded-2xl text-center bg-slate-50 space-y-2">
                    <UploadCloud className="w-8 h-8 text-blue-500 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      Drag & drop brand assets, RFQ guidelines or specifications
                    </p>
                    <p className="text-[10px] text-slate-400">
                      PDF, PNG, JPG or AI up to 25MB
                    </p>
                  </div>
                  <div className="space-y-2">
                    {formData.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-slate-800">
                            {doc.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {doc.size}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------------- SECTION 9 & 10: VENDORS ---------------- */}
              {(activeSection === "vendors" ||
                activeSection === "add-vendors") && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">
                      Selected Gifting Vendors (
                      {formData.selectedVendors.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedVendors.map((v, i) => (
                        <Badge
                          key={i}
                          className="bg-blue-100 text-blue-800 border-blue-200 py-1 px-3"
                        >
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <form
                    onSubmit={handleAddCustomVendor}
                    className="pt-2 border-t border-slate-100 space-y-3"
                  >
                    <Label className="text-xs font-bold text-slate-700">
                      Invite Additional Vendor
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Vendor Company Name"
                        value={formData.customVendorName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customVendorName: e.target.value,
                          })
                        }
                        className="bg-slate-50 border-slate-200 rounded-xl"
                      />
                      <Input
                        placeholder="Vendor Contact Email"
                        type="email"
                        value={formData.customVendorEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customVendorEmail: e.target.value,
                          })
                        }
                        className="bg-slate-50 border-slate-200 rounded-xl"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-blue-600 text-white rounded-xl"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Vendor to RFQ
                    </Button>
                  </form>
                </div>
              )}

              {/* ---------------- SECTION 11: DATES ---------------- */}
              {activeSection === "dates" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      RFQ Publish Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      Bid Submission Deadline
                    </Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      Target Award Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.awardDate}
                      onChange={(e) =>
                        setFormData({ ...formData, awardDate: e.target.value })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* ---------------- SECTION 12: PREVIEW & SUBMIT ---------------- */}
              {activeSection === "preview" && (
                <div className="space-y-4 py-2">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
                    <div className="flex items-center space-x-2 font-bold text-blue-700">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <span>Ready to Publish Gifting RFQ</span>
                    </div>
                    <p>
                      Your RFQ document has been generated for{" "}
                      <strong>{formData.companyName}</strong>. Clicking submit
                      will broadcast this RFQ to selected vendors for
                      competitive pricing.
                    </p>
                  </div>

                  {isSubmitted && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <strong>RFQ Successfully Published!</strong> Vendors
                        have been notified via email magic link.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="text-xs font-bold rounded-xl border-slate-200"
                >
                  PREVIOUS
                </Button>

                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl shadow-md shadow-blue-500/20"
                >
                  {activeSection === "preview" ? "PUBLISH RFQ" : "NEXT"}
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* ========================================================================= */}
        {/* 3. RIGHT COLUMN: Live RFQ Document Preview (Matching Zopa-rfp)            */}
        {/* ========================================================================= */}
        <aside className="w-[420px] lg:w-[650px] shrink-0 bg-slate-100 overflow-y-auto p-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
            {/* Header / Crest Badge */}
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-red-600 text-yellow-300 font-black text-sm flex items-center justify-center shadow-xs">
                S
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                RFQ Document
              </h3>
            </div>

            {/* 1. Company Introduction */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900">
                1. Company Introduction
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-mono">
                <strong className="text-slate-800">
                  {formData.companyName}
                </strong>{" "}
                incorporated under Indian Companies Act, having its office at{" "}
                <span className="text-slate-700 font-semibold">
                  {formData.companyAddress}
                </span>
                , hereinafter referred to as &quot;Company&quot; which
                expression shall unless repugnant to the context or meaning
                thereof and include its administrators and successors in
                interest of the First Part. Company is in the business of{" "}
                <strong className="text-slate-800">
                  {formData.companyBusiness}
                </strong>
                .
              </p>
            </div>

            {/* 10. Buyer Contacts (Dynamic based on signed in user) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                10. Buyer Contacts
              </h4>
              <div className="text-xs space-y-1.5 font-mono text-slate-700">
                <p>
                  <strong className="text-slate-900 font-sans font-semibold">
                    Contact Name:
                  </strong>{" "}
                  {formData.contactName}
                </p>
                <p>
                  <strong className="text-slate-900 font-sans font-semibold">
                    Email:
                  </strong>{" "}
                  {formData.contactEmail}
                </p>
                <p>
                  <strong className="text-slate-900 font-sans font-semibold">
                    Phone:
                  </strong>{" "}
                  {formData.contactPhone}
                </p>
                <p>
                  <strong className="text-slate-900 font-sans font-semibold">
                    Address:
                  </strong>{" "}
                  {formData.companyAddress}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Bar */}
      <footer className="h-10 shrink-0 bg-white border-t border-slate-200 px-6 flex items-center justify-center text-xs text-slate-500 space-x-4 z-20">
        <span>
          Need Assistance? Contact us for support:{" "}
          <a
            href="mailto:flux@zopapro.com"
            className="text-blue-600 hover:underline font-semibold"
          >
            flux@zopapro.com
          </a>
        </span>
        <span>•</span>
        <span>
          &copy; {new Date().getFullYear()} ZOPA FLUX. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
