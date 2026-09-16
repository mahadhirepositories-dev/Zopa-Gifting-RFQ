/* eslint-disable @typescript-eslint/no-explicit-any */
import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    paddingTop: 80,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 80,
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
  },
  leftSection: {
    width: "25%",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  centerSection: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  rightSection: {
    width: "25%",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  logoCompanyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  companyLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
    resizeMode: "contain",
  },
  companyLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoPlaceholderText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 12,
  },
  buyerInfoContainer: {
    backgroundColor: "#f8fafc",
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  buyerInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  buyerInfoLabel: {
    fontSize: 8,
    color: "#374151",
    fontWeight: "bold",
    width: "30%",
  },
  buyerInfoValue: {
    fontSize: 8,
    color: "#1f2937",
    width: "70%",
  },
  mainContent: {
    flex: 1,
  },
  header: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1f2937",
  },
  subheader: {
    fontSize: 10,
    marginBottom: 15,
    textAlign: "center",
    color: "#6b7280",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 0,
    color: "#374151",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 10,
    padding: 5,
    backgroundColor: "#ffffff",
  },
  table: {
    flexDirection: "column",
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 25,
  },
  tableHeaderRow: {
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 2,
    borderBottomColor: "#cbd5e1",
  },
  tableCell: {
    flex: 1,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  tableCellLeft: {
    width: 100,
    padding: 6,
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  selectedCell: {
    backgroundColor: "#dbeafe",
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  approvedCell: {
    backgroundColor: "#dcfce7",
    borderLeftWidth: 3,
    borderLeftColor: "#059669",
  },
  rejectedCell: {
    backgroundColor: "#fee2e2",
    borderLeftWidth: 3,
    borderLeftColor: "#dc2626",
  },
  pendingCell: {
    backgroundColor: "#fef3c7",
    borderLeftWidth: 3,
    borderLeftColor: "#d97706",
  },
  highlightCell: {
    backgroundColor: "#ecfdf5",
  },
  badge: {
    padding: 2,
    fontSize: 6,
    textAlign: "center",
    marginTop: 2,
    color: "white",
  },
  evenRow: {
    backgroundColor: "#ffffff",
  },
  oddRow: {
    backgroundColor: "#f9fafb",
  },
  summaryRow: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  bestValueBadge: {
    backgroundColor: "#059669",
    color: "white",
    fontSize: 6,
    padding: 2,
    marginTop: 2,
    textAlign: "center",
  },
  executiveSummary: {
    padding: 15,
    backgroundColor: "#ffffff",
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#374151",
    marginBottom: 15,
    textAlign: "justify",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1f2937",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flex: 1,
  },
  footerCenter: {
    flex: 1,
    alignItems: "center",
  },
  footerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  footerText: {
    fontSize: 8,
    color: "#d1d5db",
  },
  footerBold: {
    fontSize: 8,
    color: "#ffffff",
    fontWeight: "bold",
  },
  companyInfo: {
    fontSize: 7,
    color: "#9ca3af",
    marginTop: 2,
  },
  confidentialText: {
    fontSize: 7,
    color: "#9ca3af",
    marginTop: 2,
  },
  // Vendor names section
  vendorNamesSection: {
    backgroundColor: "#f8fafc",
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  vendorNamesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 6,
  },
  vendorNamesList: {
    fontSize: 9,
    color: "#1f2937",
    lineHeight: 1.4,
  },
  selectedVendorsSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  selectedVendorsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  selectedVendorsList: {
    flexDirection: "column",
  },
  selectedVendorItem: {
    fontSize: 9,
    color: "#1f2937",
    marginBottom: 4,
    paddingLeft: 8,
  },
  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },
  reportTitleSection: {
    alignItems: "center",
  },
  addressLine1: {
    fontSize: 8,
    fontWeight: "bold",
  },
});

// Item level comparison styles
export const itemLevelStyles = StyleSheet.create({
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    fontSize: 8,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 18,
  },
  tableHeaderRow: {
    backgroundColor: "#f1f5f9",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#cbd5e1",
  },
  tableCell: {
    flex: 1,
    padding: 3,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  tableCellLeft: {
    width: 80,
    padding: 3,
    textAlign: "left",
    fontWeight: "bold",
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  descriptionCell: {
    width: 120,
    padding: 3,
    textAlign: "left",
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  specCell: {
    width: 100,
    padding: 3,
    textAlign: "left",
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  lopCell: {
    width: 80,
    padding: 3,
    textAlign: "center",
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
});

// Fixed Savings styles
export const savingsStyles = StyleSheet.create({
  savingsContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  savingsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1e293b",
    textAlign: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  savingsSubtitle: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  savingsGrid: {
    display: "flex",
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  savingsCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  savingsCardTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#374151",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  savingsAmount: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    padding: 8,
  },
  savingsPositive: {
    color: "#059669",
  },
  savingsNegative: {
    color: "#dc2626",
  },
  // Used when a savings figure has no underlying data (e.g. no LOP captured),
  // so a flat zero doesn't read as a real gain or loss.
  savingsNeutral: {
    color: "#6b7280",
  },
  savingsDetail: {
    fontSize: 9,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  savingsFormula: {
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 8,
    padding: 4,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  overallSummary: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 15,
    textAlign: "center",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
    color: "#374151",
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
});

// Enhanced styles for approval summary
export const enhancedStyles = StyleSheet.create({
  approvalSummaryContainer: {
    marginTop: 8,
  },
  approvalStatusSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  approvalSectionTitle: {
    fontSize: 8,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  approvalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  approvalLabel: {
    fontSize: 8,
    fontWeight: "600",
    color: "#666",
    flex: 1,
  },
  approvalValue: {
    fontSize: 8,
    fontWeight: "500",
    color: "#1a1a1a",
    flex: 2,
    textAlign: "right",
  },
  approvedText: {
    color: "#34C759",
    fontWeight: "700",
  },
  rejectedText: {
    color: "#FF3B30",
    fontWeight: "700",
  },
  pendingText: {
    color: "#FF9500",
    fontWeight: "700",
  },
  commentsSection: {
    marginTop: 12,
  },
  commentsContainer: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  commentsText: {
    fontSize: 8,
    color: "#333",
    lineHeight: 20,
  },

  // Contact Information Styles
  contactInfoContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  contactColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  contactColumn: {
    flex: 1,
    paddingHorizontal: 8,
  },
  contactColumnTitle: {
    fontSize: 8,
    fontWeight: "700",
    marginBottom: 12,
    color: "#007AFF",
    textAlign: "center",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
  },
  contactRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  contactLabel: {
    fontSize: 8,
    fontWeight: "600",
    color: "#666",
    width: 80,
    marginRight: 8,
  },
  contactValue: {
    fontSize: 8,
    fontWeight: "500",
    color: "#1a1a1a",
    flex: 1,
    flexWrap: "wrap",
  },

  // Final Recommendations Styles
  finalRecommendationsContainer: {
    marginTop: 8,
  },
  recommendationTypeSection: {
    marginBottom: 16,
  },
  recommendationTypeTitle: {
    fontSize: 8,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  recommendationItem: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  recommendationVendor: {
    fontSize: 8,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  recommendationReason: {
    fontSize: 8,
    color: "#666",
    fontStyle: "italic",
    marginLeft: 12,
  },
});

// Updated Footer styles
export const updatedFooterStyles = StyleSheet.create({
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "auto",
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  footerSection: {
    flex: 1,
  },
  footerLeft: {
    alignItems: "flex-start",
  },
  footerCenter: {
    alignItems: "center",
  },
  footerRight: {
    alignItems: "flex-end",
  },
  footerTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 3,
  },
  footerText: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 1,
  },
  footerSubtext: {
    fontSize: 7,
    color: "#9ca3af",
  },
});

// Types
export interface ProcessedVendor {
  id: string;
  vendorResponseId: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  quoteRefId?: string;
  revision?: string;
  actualPrice?: number;
  grossAmount?: number;
  revisionCount?: number;
  priceDifference?: number;
  otherInformation?: string | any;
  deliveryTime?: string;
  status: any;
  revisions?: any[];
}

export interface SelectedVendor {
  vendorResponseId: string;
  companyName: string;
  remarks: string;
}

export interface BuyerDataItem {
  id?: number;
  description: string;
  uom: string;
  qty: string | number;
  specification?: string;
  targetPrice?: string | number;
  remarks?: string;
  category?: string;
  lopPrice?: string | number;
  lopGst?: string | number;
  [key: string]: any;
  requirements?: {
    projectName?: string;
    [key: string]: any;
  };
}

export interface ContactInfo {
  contactEmail?: string;
  contactState?: string;
  contactCity?: string;
  contactPhone?: string;
  logoPath?: string;
  contactName?: string;
  addressLine1?: string;
  contactAddressLine1?: string;
}

export interface CompanyInfo {
  name?: string;
  city?: string;
  state?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  country?: string;
  businessType?: string;
}

export interface Requirements {
  projectName?: string;
}

export interface BuyerInfo {
  company?: CompanyInfo;
  contact?: ContactInfo;
  name?: string;
  companyName?: string;
  address?: string;
  location?: string;
  email?: string;
  phone?: string;
  requirements?: {
    projectName?: string;
    [key: string]: any;
  };
}

export interface VendorComparisonPDFProps {
  vendors: ProcessedVendor[];
  selectedVendors: Map<string, SelectedVendor>;
  recommendations?: any[];
  currentApproval?: any;
  rfpId?: string;
  document?: any;
  buyerData?: BuyerDataItem[];
  savings?: {
    negotiations: number;
    targetVsLastRev: number;
    lopVsLastRev: number;
    firstRevTotal: number;
    lastRevTotal: number;
    lastRevTotalExclGst: number;
  };
  targetPriceTotal?: number;
  lopTotals?: {
    totalExclTax: number;
    totalInclTax: number;
  };
  evaluationCriteria?: any[];
  buyerInfo?: BuyerInfo;
  approverInfo?: any;
  vendorSummary?: any;
}
