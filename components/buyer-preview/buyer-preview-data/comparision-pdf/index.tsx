/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/buyer-preview/buyer-preview-data/comparison-pdf.tsx
import React from "react";
import { Document, Page, Text, View, Font, Image } from "@react-pdf/renderer";
import { styles } from "./comparison-pdf-styles";
import {
  VendorComparisonPDFProps,
  ProcessedVendor,
  savingsStyles,
} from "./comparison-pdf-styles";
import ItemLevelComparison from "./item-level-comparison";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7W0Q5n-wU.woff2",
      fontWeight: 400,
      fontStyle: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa25L7W0Q5n-wU.woff2",
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5n-wU.woff2",
      fontWeight: 700,
      fontStyle: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa15L7W0Q5n-wU.woff2",
      fontWeight: 700,
      fontStyle: "italic",
    },
  ],
});

interface BoqDetail {
  quotePrice?: string | number;
  gst?: string | number;
  specification?: string;
  [key: string]: any;
}

interface ItemTotal {
  quotePrice: number;
  gst: number;
  lineTotalExclTax: number;
  gstAmount: number;
  lineTotalInclTax: number;
}

interface BuyerDataItem {
  description?: string;
  specification?: string;
  uom?: string;
  qty?: string | number;
  targetPrice?: string | number;
  lopPrice?: string | number;
  lopGst?: string | number;
}

interface Recommendation {
  vendorResponse?: {
    companyDetails?: {
      companyName?: string;
    };
  };
  recommenderRole?: string;
  status?: string;
}

interface DocumentInfo {
  documentsToShare?: string | string[];
}

interface EvaluationCriteriaItem {
  label?: string;
  value?: string;
  remarks?: string;
}

export const VendorComparisionPdf: React.FC<VendorComparisonPDFProps> = ({
  vendors,
  selectedVendors,
  recommendations = [],
  currentApproval,
  document,
  buyerData = [],
  targetPriceTotal = 0,
  lopTotals = { totalExclTax: 0, totalInclTax: 0 },
  evaluationCriteria = [],
  buyerInfo,
  approverInfo,
}) => {
  const getLowestPrice = (): number => {
    const prices = vendors.map((v) => v.actualPrice ?? Infinity);
    return Math.min(...prices);
  };

  const getFastestDelivery = (): number => {
    const deliveryTimes = vendors.map(
      (v) => parseInt(v.deliveryTime || "") || Infinity
    );
    return Math.min(...deliveryTimes);
  };

  const calculateNetAmount = (
    grossAmount: number,
    gstRate: number = 18
  ): number => {
    return grossAmount / (1 + gstRate / 100);
  };

  const getVendorRecommendationInfo = (
    companyName: string
  ): { status: string; type: string } | null => {
    if (!recommendations || recommendations.length === 0) return null;

    const vendorRecs = recommendations.filter(
      (rec: Recommendation) =>
        rec?.vendorResponse?.companyDetails?.companyName === companyName
    );

    if (vendorRecs.length === 0) return null;

    const approverRecs = vendorRecs.filter(
      (rec: Recommendation) => rec?.recommenderRole === "approver"
    );

    if (approverRecs.length > 0) {
      const approverRec = approverRecs[0];
      return {
        status: approverRec.status || "pending",
        type:
          approverRec.status === "approve"
            ? "approved"
            : approverRec.status === "reject"
              ? "rejected"
              : "pending",
      };
    }
    return { status: "pending", type: "buyer" };
  };

  const getCellStyle = (vendor: ProcessedVendor): any => {
    const isSelected = selectedVendors.has(vendor.vendorResponseId);
    const recommendationInfo = getVendorRecommendationInfo(vendor.name);
    if (isSelected) {
      return styles.selectedCell;
    }
    if (recommendationInfo) {
      switch (recommendationInfo.type) {
        case "approved":
          return styles.approvedCell;
        case "rejected":
          return styles.rejectedCell;
        default:
          return styles.pendingCell;
      }
    }
    return {};
  };

  const sortedVendors = [...vendors].sort(
    (a, b) => (a.actualPrice ?? Infinity) - (b.actualPrice ?? Infinity)
  );

  const getLatestRevision = (vendor: ProcessedVendor): any => {
    if (!vendor.revisions || vendor.revisions.length === 0) return null;
    return vendor.revisions[vendor.revisions.length - 1];
  };

  const checkDocumentCompliance = (
    vendor: ProcessedVendor,
    documentName: string
  ): boolean => {
    const latestRevision = getLatestRevision(vendor);
    if (!latestRevision) return false;
    const normalizeDocName = (name: string) =>
      name
        ?.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const normalizedTargetDoc = normalizeDocName(documentName);
    if (
      latestRevision.documentAgreements &&
      typeof latestRevision.documentAgreements === "object"
    ) {
      for (const [key, value] of Object.entries(
        latestRevision.documentAgreements
      )) {
        const normalizedKey = normalizeDocName(key);
        if (normalizedKey === normalizedTargetDoc) {
          return value === "agree" || value === true || value === "true";
        }
      }
    }

    if (
      latestRevision.attachments &&
      Array.isArray(latestRevision.attachments)
    ) {
      return latestRevision.attachments.some((attachment: any) => {
        if (!attachment.documentName || !attachment.url) return false;
        const normalizedAttachmentName = normalizeDocName(
          attachment.documentName
        );
        return normalizedAttachmentName === normalizedTargetDoc;
      });
    }

    return false;
  };

  const checkEvaluationCriteria = (
    vendor: ProcessedVendor,
    criteriaLabel: string
  ): boolean => {
    const latestRevision = getLatestRevision(vendor);
    if (!latestRevision || !latestRevision.evaluationCriteria) return false;

    const normalizeLabel = (label: string) =>
      label
        ?.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const normalizedTarget = normalizeLabel(criteriaLabel);

    return latestRevision.evaluationCriteria.some((criteria: any) => {
      if (
        criteria.value !== "Yes" &&
        criteria.value !== "yes" &&
        criteria.value !== true
      ) {
        return false;
      }

      const normalizedCriteriaLabel = normalizeLabel(criteria.label || "");
      const normalizedCriteriaRemarks = normalizeLabel(criteria.remarks || "");

      return (
        normalizedCriteriaLabel === normalizedTarget ||
        normalizedCriteriaRemarks === normalizedTarget
      );
    });
  };

  // FIXED: Responsive vendor cell width calculation
  const getVendorCellWidth = (): number => {
    const vendorCount = sortedVendors.length;
    if (vendorCount <= 2) return 140;
    if (vendorCount <= 3) return 120;
    if (vendorCount <= 4) return 100;
    if (vendorCount <= 6) return 80;
    if (vendorCount <= 8) return 65;
    return 50; // For 9+ vendors
  };

  const getFontSize = (): number => {
    const vendorCount = sortedVendors.length;
    if (vendorCount <= 3) return 9;
    if (vendorCount <= 6) return 8;
    return 7;
  };

  // Vendor Profile Criteria
  const profileCriteria = [
    { name: "Name", key: "name" },
    { name: "Email", key: "email" },
    { name: "Phone", key: "phone" },
    { name: "Location", key: "location" },
    { name: "Quote Ref ID", key: "quoteRefId" },
    { name: "Revision", key: "revision" },
    { name: "Price", key: "price" },
    { name: "Delivery (days)", key: "delivery" },
  ];

  // Commercials Criteria
  const commercialsCriteria = [
    {
      name: "Net Amount\n(Excl. GST)",
      key: "netAmount",
    },
    {
      name: "Gross Amount\n(Incl. GST)",
      key: "grossAmount",
    },
    { name: "Total Discount", key: "discount" },
    { name: "No. of Revisions", key: "revisions" },
    { name: "Exclusions", key: "exclusions" },
  ];

  const renderProfileCellContent = (
    vendor: ProcessedVendor,
    criteriaKey: string
  ): string => {
    const maxLength =
      sortedVendors.length > 6 ? 15 : sortedVendors.length > 3 ? 20 : 25;

    switch (criteriaKey) {
      case "name":
        const name = vendor.name || "";
        return name.length > maxLength
          ? name.substring(0, maxLength) + "..."
          : name;
      case "email":
        const email = vendor.email || "N/A";
        return email.length > maxLength
          ? email.substring(0, maxLength) + "..."
          : email;
      case "phone":
        return vendor.phone || "N/A";
      case "location":
        const location = vendor.location || "N/A";
        return location.length > maxLength
          ? location.substring(0, maxLength) + "..."
          : location;
      case "quoteRefId":
        const refId = vendor.quoteRefId || "N/A";
        return refId.length > maxLength
          ? refId.substring(0, maxLength) + "..."
          : refId;
      case "revision":
        return vendor.revision || "N/A";
      case "price":
        return vendor.actualPrice
          ? `${vendor.actualPrice.toLocaleString()}`
          : "N/A";
      case "delivery":
        return vendor.deliveryTime ? `${vendor.deliveryTime}` : "N/A";
      default:
        return "N/A";
    }
  };

  const renderCommercialsCellContent = (
    vendor: ProcessedVendor,
    criteriaKey: string
  ): string | number => {
    switch (criteriaKey) {
      case "netAmount":
        const grossAmount = vendor.grossAmount || vendor.actualPrice || 0;
        return grossAmount > 0
          ? `${calculateNetAmount(grossAmount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : " ";
      case "grossAmount":
        return vendor.actualPrice
          ? `${vendor.actualPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : " ";
      case "discount":
        const hasDiscount =
          (vendor.revisionCount || 0) > 1 && (vendor.priceDifference || 0) > 0;
        return hasDiscount
          ? `${(vendor.priceDifference || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "No discount";
      case "revisions":
        return (vendor.revisionCount || 1) - 1;
      case "exclusions":
        const maxLength = sortedVendors.length > 6 ? 20 : 30;
        let exclusionStr = "";
        if (typeof vendor.otherInformation === "string") {
          exclusionStr = vendor.otherInformation || " ";
        } else if (
          vendor.otherInformation &&
          typeof vendor.otherInformation === "object" &&
          Object.keys(vendor.otherInformation).length > 0
        ) {
          const info = vendor.otherInformation as Record<string, any>;
          const parts: string[] = [];
          for (const [key, val] of Object.entries(info)) {
            if (val !== undefined && val !== null && String(val).trim() !== "") {
              const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
              parts.push(`${label}: ${parseFloat(String(val)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            }
          }
          exclusionStr = parts.length > 0 ? parts.join(", ") : "";
        }
        return exclusionStr.length > maxLength
          ? exclusionStr.substring(0, maxLength) + "..."
          : exclusionStr;
      default:
        return "";
    }
  };

  const isLowestPrice = (vendor: ProcessedVendor): boolean => {
    return vendor.actualPrice === getLowestPrice();
  };

  const isFastestDelivery = (vendor: ProcessedVendor): boolean => {
    return parseInt(vendor.deliveryTime || "") === getFastestDelivery();
  };

  const renderEnhancedHeader = (): React.ReactElement => {
    const projectName =
      buyerInfo?.requirements?.projectName ||
      (buyerData &&
        buyerData.length > 0 &&
        buyerData[0].requirements?.projectName) ||
      "Project Name";

    // Extract logo information from buyerInfo
    const logoUrl = buyerInfo?.contact?.logoPath || null;
    const companyName =
      buyerInfo?.company?.name || buyerInfo?.contact?.contactName || "Company";

    return (
      <View style={styles.headerContainer} fixed>
        <View style={styles.headerContent}>
          {/* Left Section - Logo */}
          <View style={styles.leftSection}>
            {logoUrl ? (
              <Image src={logoUrl} style={styles.companyLogo} />
            ) : (
              <View style={styles.companyLogoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>
                  {companyName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Center Section - Report Title */}
          <View style={styles.centerSection}>
            <Text style={styles.headerTitle}>Vendor Comparison Report</Text>
            <Text style={styles.headerSubtitle}>{projectName}</Text>
          </View>

          {/* Right Section - Company Info */}
          <View style={styles.rightSection}>
            {/* <Text style={styles.companyName}>{companyName}</Text> */}

            <Text style={styles.companyAddress}>
              {/* {buyerInfo?.company?.city || buyerInfo?.contact?.contactCity}
              {", "}
              {buyerInfo?.company?.state ||
                buyerInfo?.contact?.contactState}{" "}
              {buyerInfo?.company?.postalCode} */}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEnhancedFooter = (): React.ReactElement => {
    return (
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "auto",
        }}
        fixed
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            backgroundColor: "#ffffff",
            minHeight: 50,
          }}
        >
          {/* Left section - Company & Buyer Info */}
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            {buyerInfo?.company?.name && (
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: "bold",
                  color: "#374151",
                  marginBottom: 2,
                }}
              >
                {buyerInfo.company.name}
              </Text>
            )}
            {buyerInfo?.name && (
              <Text style={{ fontSize: 8, color: "#6b7280", marginBottom: 1 }}>
                Buyer: {buyerInfo.name}
              </Text>
            )}
            <Text style={{ fontSize: 8, color: "#6b7280", lineHeight: 1.2 }}>
              {buyerInfo?.company?.city ||
                buyerInfo?.contact?.contactCity ||
                "City"}
              {buyerInfo?.company?.state && `, ${buyerInfo.company.state}`}
            </Text>
          </View>

          {/* Center section - Project & RFP Info */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "bold",
                color: "#374151",
                marginBottom: 2,
              }}
            >
              {buyerInfo?.requirements?.projectName ||
                document?.projectName ||
                "RFP Project"}
            </Text>
            <Text style={{ fontSize: 8, color: "#6b7280" }}>
              Generated: {new Date().toLocaleDateString()}
            </Text>
          </View>

          {/* Right section - Page Info & Status */}
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
            {/* {currentApproval?.status && (
              <Text style={{ fontSize: 8, color: "#6b7280", marginBottom: 1 }}>
                Status: {currentApproval.status.toUpperCase()}
              </Text>
            )} */}
            <Text style={{ fontSize: 7, color: "#9ca3af" }}>
              Confidential Document
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTableHeader = (): React.ReactElement => {
    const cellWidth = getVendorCellWidth();
    const fontSize = getFontSize();

    return (
      <View style={[styles.tableRow, styles.tableHeaderRow]}>
        <View style={[styles.tableCellLeft, { width: 100 }]}>
          <Text>Descriptions</Text>
        </View>
        {sortedVendors.map((vendor) => {
          const isSelected = selectedVendors.has(vendor.vendorResponseId);
          const recommendationInfo = getVendorRecommendationInfo(vendor.name);

          // Truncate vendor name based on available space
          const maxNameLength =
            sortedVendors.length > 8 ? 8 : sortedVendors.length > 6 ? 10 : 12;
          const displayName =
            vendor.name.length > maxNameLength
              ? vendor.name.substring(0, maxNameLength) + "..."
              : vendor.name;

          return (
            <View
              key={vendor.id}
              style={[
                styles.tableCell,
                getCellStyle(vendor),
                { width: cellWidth, minWidth: cellWidth },
              ]}
            >
              <Text style={{ fontWeight: "bold", fontSize }}>
                {displayName}
              </Text>
              {isSelected && (
                <Text
                  style={[
                    styles.badge,
                    { backgroundColor: "#3b82f6", fontSize: fontSize - 1 },
                  ]}
                >
                  SELECTED
                </Text>
              )}
              {recommendationInfo && !isSelected && (
                <Text
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        recommendationInfo.type === "approved"
                          ? "#059669"
                          : recommendationInfo.type === "rejected"
                            ? "#dc2626"
                            : "#d97706",
                      fontSize: fontSize - 1,
                    },
                  ]}
                >
                  {recommendationInfo.type === "approved"
                    ? "APPROVED"
                    : recommendationInfo.type === "rejected"
                      ? "REJECTED"
                      : "PENDING"}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // Complete Approval Summary Section
  const renderApprovalSummary = (): React.ReactElement | null => {
    if (!currentApproval && !approverInfo) return null;

    const approverName =
      approverInfo?.name || currentApproval?.approver?.name || "N/A";
    const approverEmail =
      approverInfo?.email || currentApproval?.approver?.email || "";
    const buyerName =
      currentApproval?.requester?.name || buyerInfo?.name || "Unknown Buyer";
    const buyerEmail =
      currentApproval?.requester?.email ||
      buyerInfo?.contact?.contactEmail ||
      "";
    const status = approverInfo?.status || currentApproval?.status || "pending";
    const comments =
      approverInfo?.comments ||
      currentApproval?.approverComments ||
      currentApproval?.buyerComments ||
      "";
    const reviewDate =
      approverInfo?.reviewedAt ||
      currentApproval?.reviewedAt ||
      currentApproval?.createdAt;

    // Get recommended vendors
    const approverRecommendations =
      recommendations?.filter(
        (rec: any) => rec?.recommenderRole === "approver"
      ) || [];

    const buyerRecommendations =
      recommendations?.filter(
        (rec: any) => rec?.recommenderRole !== "approver"
      ) || [];

    const fontSize = getFontSize();

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>APPROVAL SUMMARY</Text>

        {/* Final Vendor Recommendations */}
        {(approverRecommendations.length > 0 ||
          buyerRecommendations.length > 0) && (
          <View style={styles.table}>
            {/* Section Header */}
            {/* <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <View style={[styles.tableCellLeft, { width: 100 }]}>
                <Text style={{ fontSize }}>Final Vendor Recommendations</Text>
              </View>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text style={{ fontSize }}>Details</Text>
              </View>
            </View> */}

            {/* Approver Recommendations */}
            {/* {approverRecommendations.length > 0 && (
              <View style={[styles.tableRow, styles.evenRow]}>
                <View style={[styles.tableCellLeft, { width: 100 }]}>
                  <Text style={{ fontSize, fontWeight: "bold" }}>
                    Approver Approved
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    { flex: 1, alignItems: "flex-start" },
                  ]}
                >
                  {approverRecommendations.map((rec: any, index: number) => (
                    <View key={index} style={{ marginBottom: 4 }}>
                      <Text style={{ fontSize, fontWeight: "bold" }}>
                        •{" "}
                        {rec.vendorResponse?.companyDetails?.companyName ||
                          "Unknown Vendor"}
                      </Text>
                      {rec.reason && (
                        <Text
                          style={{ fontSize, color: "#6b7280", marginLeft: 8 }}
                        >
                          Reason: {rec.reason}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )} */}

            {/* Buyer Recommendations */}
            {/* {buyerRecommendations.length > 0 && (
              <View style={[styles.tableRow, styles.oddRow]}>
                <View style={[styles.tableCellLeft, { width: 100 }]}>
                  <Text style={{ fontSize, fontWeight: "bold" }}>
                    Buyer Recommended
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    { flex: 1, alignItems: "flex-start" },
                  ]}
                >
                  {buyerRecommendations.map((rec: any, index: number) => (
                    <View key={index} style={{ marginBottom: 4 }}>
                      <Text style={{ fontSize, fontWeight: "bold" }}>
                        •{" "}
                        {rec.vendorResponse?.companyDetails?.companyName ||
                          "Unknown Vendor"}
                      </Text>
                      {rec.reason && (
                        <Text
                          style={{ fontSize, color: "#6b7280", marginLeft: 8 }}
                        >
                          Reason: {rec.reason}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )} */}
          </View>
        )}

        {/* RFP Status */}
        <View style={styles.table}>
          {/* Section Header */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={[styles.tableCellLeft, { width: 100 }]}>
              <Text style={{ fontSize }}>RFP Status</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text style={{ fontSize }}>Details</Text>
            </View>
          </View>

          {/* Status Row */}
          <View style={[styles.tableRow, styles.evenRow]}>
            <View style={[styles.tableCellLeft, { width: 100 }]}>
              <Text style={{ fontSize }}>Status</Text>
            </View>
            <View
              style={[styles.tableCell, { flex: 1, alignItems: "flex-start" }]}
            >
              <Text
                style={[
                  { fontSize, fontWeight: "bold" },
                  status === "approved"
                    ? { color: "#059669" }
                    : status === "rejected"
                      ? { color: "#dc2626" }
                      : { color: "#d97706" },
                ]}
              >
                {status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Review Date Row */}
          {reviewDate && (
            <View style={[styles.tableRow, styles.oddRow]}>
              <View style={[styles.tableCellLeft, { width: 100 }]}>
                <Text style={{ fontSize }}>Review Date</Text>
              </View>
              <View
                style={[
                  styles.tableCell,
                  { flex: 1, alignItems: "flex-start" },
                ]}
              >
                <Text style={{ fontSize }}>
                  {new Date(reviewDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          {/* Comments Row */}
          {comments && (
            <View style={[styles.tableRow, styles.evenRow]}>
              <View style={[styles.tableCellLeft, { width: 100 }]}>
                <Text style={{ fontSize }}>Comments</Text>
              </View>
              <View
                style={[
                  styles.tableCell,
                  { flex: 1, alignItems: "flex-start", padding: 8 },
                ]}
              >
                <Text style={{ fontSize, textAlign: "left", lineHeight: 1.4 }}>
                  {comments}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.table}>
          {/* Section Header */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={[styles.tableCellLeft, { width: 100 }]}>
              <Text style={{ fontSize, fontWeight: "bold" }}>
                Contact Information
              </Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text style={{ fontSize, fontWeight: "bold" }}>Buyer</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text style={{ fontSize, fontWeight: "bold" }}>Approver</Text>
            </View>
          </View>

          {/* Name Row */}
          <View style={[styles.tableRow, styles.evenRow]}>
            <View style={[styles.tableCellLeft, { width: 100 }]}>
              <Text style={{ fontSize }}>Name</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text style={{ fontSize }}>{buyerName}</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text style={{ fontSize }}>{approverName}</Text>
            </View>
          </View>

          {/* Email Row */}
          {(buyerEmail || approverEmail) && (
            <View style={[styles.tableRow, styles.oddRow]}>
              <View style={[styles.tableCellLeft, { width: 100 }]}>
                <Text style={{ fontSize }}>Email</Text>
              </View>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text style={{ fontSize }}>{buyerEmail || "N/A"}</Text>
              </View>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text style={{ fontSize }}>{approverEmail || "N/A"}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const getRevisionItem = (
    vendor: ProcessedVendor,
    itemIndex: number,
    revisionIndex: number
  ): BoqDetail | null => {
    const revision = vendor.revisions?.[revisionIndex];
    if (!revision?.boqDetails?.length) return null;
    return revision.boqDetails[itemIndex] || revision.boqDetails[0] || null;
  };

  const calculateItemTotal = (
    item: BoqDetail | null,
    qty: string | number
  ): ItemTotal | null => {
    if (!item?.quotePrice) return null;

    const price =
      typeof item.quotePrice === "string"
        ? parseFloat(item.quotePrice)
        : Number(item.quotePrice);

    const gst =
      typeof item.gst === "string"
        ? parseFloat(item.gst || "0")
        : Number(item.gst || 0);

    const quantity =
      typeof qty === "string" ? parseFloat(qty.toString()) : Number(qty);

    const lineTotalExclTax = price * (quantity || 0);
    const gstAmount = lineTotalExclTax * (gst / 100);

    return {
      quotePrice: price,
      gst,
      lineTotalExclTax,
      gstAmount,
      lineTotalInclTax: lineTotalExclTax + gstAmount,
    };
  };

  // Get all revision indices
  const allRevisionIndices = Array.from(
    new Set(
      sortedVendors.flatMap((vendor) =>
        (vendor.revisions || []).map((_, index) => index)
      )
    )
  ).sort((a, b) => a - b);

  const calculateCumulativeTotals = (): Record<string, number> => {
    const totals: Record<string, number> = {};

    buyerData.forEach((item: BuyerDataItem, index: number) => {
      const displayQty = item.qty || 0;

      sortedVendors.forEach((vendor) => {
        allRevisionIndices.forEach((revIndex) => {
          const revItem = getRevisionItem(vendor, index, revIndex);
          if (revItem) {
            const revTotal = calculateItemTotal(revItem, displayQty);
            if (revTotal) {
              const key = `${vendor.id}-rev-${revIndex}`;
              totals[key] = (totals[key] || 0) + revTotal.lineTotalInclTax;
            }
          }
        });
      });
    });

    return totals;
  };

  const cumulativeTotals = calculateCumulativeTotals();

  // Savings Calculation Function
  const calculateSavings = (): {
    negotiations: number;
    targetVsLastRev: number;
    lopVsLastRev: number;
    firstRevTotal: number;
    lastRevTotal: number;
    lastRevTotalExclGst: number;
    targetPriceTotalInclGst: number;
  } | null => {
    if (allRevisionIndices.length === 0) return null;

    const firstRevIndex = Math.min(...allRevisionIndices);
    const lastRevIndex = Math.max(...allRevisionIndices);

    let lowestFirstRevisionTotal = Infinity;
    let lowestLastRevisionTotal = Infinity;

    sortedVendors.forEach((vendor) => {
      const firstRevKey = `${vendor.id}-rev-${firstRevIndex}`;
      const lastRevKey = `${vendor.id}-rev-${lastRevIndex}`;

      const firstRevTotal = cumulativeTotals[firstRevKey] || 0;
      const lastRevTotal = cumulativeTotals[lastRevKey] || 0;

      if (firstRevTotal > 0 && firstRevTotal < lowestFirstRevisionTotal) {
        lowestFirstRevisionTotal = firstRevTotal;
      }
      if (lastRevTotal > 0 && lastRevTotal < lowestLastRevisionTotal) {
        lowestLastRevisionTotal = lastRevTotal;
      }
    });

    if (lowestFirstRevisionTotal === Infinity) lowestFirstRevisionTotal = 0;
    if (lowestLastRevisionTotal === Infinity) lowestLastRevisionTotal = 0;

    const lowestLastRevisionTotalExclGst = calculateNetAmount(
      lowestLastRevisionTotal,
      18
    );

    const targetPriceTotalInclGst = targetPriceTotal * (1 + 18 / 100);

    return {
      negotiations: lowestFirstRevisionTotal - lowestLastRevisionTotal,
      targetVsLastRev: targetPriceTotalInclGst - lowestLastRevisionTotal,
      lopVsLastRev: lopTotals.totalInclTax - lowestLastRevisionTotal,
      firstRevTotal: lowestFirstRevisionTotal,
      lastRevTotal: lowestLastRevisionTotal,
      lastRevTotalExclGst: lowestLastRevisionTotalExclGst,
      targetPriceTotalInclGst,
    };
  };

  const renderSavingsAnalysis = (): React.ReactElement | null => {
    const savingsData = calculateSavings();
    if (!savingsData) return null;

    // Mirrors SavingsAnalysis on screen: LOP savings only mean something when
    // an LOP total actually exists. Without one, lopVsLastRev is just
    // `0 - lastRevTotal`, which would print the whole last-revision value as a
    // loss instead of the zero the buyer preview shows.
    const hasLopData = lopTotals.totalInclTax > 0;
    const displayLopSavings = hasLopData ? savingsData.lopVsLastRev : 0;

    return (
      <View style={savingsStyles.savingsContainer}>
        <Text style={savingsStyles.savingsTitle}>SAVINGS ANALYSIS</Text>

        <View style={savingsStyles.savingsGrid}>
          <View style={savingsStyles.savingsCard}>
            <Text style={savingsStyles.savingsCardTitle}>
              Negotiations Savings
            </Text>
            <Text style={savingsStyles.savingsDetail}>
              First Revision (R0):
              {savingsData.firstRevTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text style={savingsStyles.savingsDetail}>
              Last Revision (Rn):
              {savingsData.lastRevTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text
              style={[
                savingsStyles.savingsAmount,
                savingsData.negotiations >= 0
                  ? savingsStyles.savingsPositive
                  : savingsStyles.savingsNegative,
              ]}
            >
              {savingsData.negotiations >= 0 ? "+" : ""}
              {Math.abs(savingsData.negotiations).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            {/* <Text style={savingsStyles.savingsFormula}>Formula: R0 - Rn</Text> */}
          </View>
          {/* Target Price Savings Card */}
          <View style={savingsStyles.savingsCard}>
            <Text style={savingsStyles.savingsCardTitle}>
              Target Price Savings
            </Text>
            <Text style={savingsStyles.savingsDetail}>
              Target Price (Incl. GST):
              {savingsData.targetPriceTotalInclGst.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text style={savingsStyles.savingsDetail}>
              Last Revision Rn (Incl. GST):
              {savingsData.lastRevTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text
              style={[
                savingsStyles.savingsAmount,
                savingsData.targetVsLastRev >= 0
                  ? savingsStyles.savingsPositive
                  : savingsStyles.savingsNegative,
              ]}
            >
              {savingsData.targetVsLastRev >= 0 ? "+" : ""}
              {Math.abs(savingsData.targetVsLastRev).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            {/* <Text style={savingsStyles.savingsFormula}>
              Formula: Target Price (Incl. GST) - Rn
            </Text> */}
          </View>
          {/* LOP Savings Card */}
          <View style={savingsStyles.savingsCard}>
            <Text style={savingsStyles.savingsCardTitle}>LOP Savings</Text>
            <Text style={savingsStyles.savingsDetail}>
              LOP Total (Incl. GST):
              {lopTotals.totalInclTax.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text style={savingsStyles.savingsDetail}>
              Last Revision Rn (Incl. GST):
              {savingsData.lastRevTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text
              style={[
                savingsStyles.savingsAmount,
                !hasLopData
                  ? savingsStyles.savingsNeutral
                  : displayLopSavings >= 0
                    ? savingsStyles.savingsPositive
                    : savingsStyles.savingsNegative,
              ]}
            >
              {hasLopData && displayLopSavings >= 0 ? "+" : ""}
              {Math.abs(displayLopSavings).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            {/* <Text style={savingsStyles.savingsFormula}>Formula: LOP - Rn</Text> */}
          </View>
        </View>
      </View>
    );
  };

  const renderComplianceTable = (): React.ReactElement | null => {
    const documentInfo: DocumentInfo = document || {};
    const documentArray: string[] = Array.isArray(documentInfo.documentsToShare)
      ? documentInfo.documentsToShare
      : typeof documentInfo.documentsToShare === "string"
        ? documentInfo.documentsToShare.split(",").map((d: string) => d.trim())
        : [];

    const baseCriteria = [
      {
        label: "Scope of work",
        key: "scopeOfWork",
        check: (revision: any) => revision?.scopeOfWork?.agreement === "agree",
      },
      {
        label: "Payment terms",
        key: "paymentTerms",
        check: (revision: any) =>
          revision?.financialTerms?.paymentTermsAgreement === "agree",
      },
      {
        label: "PBG Amount",
        key: "pbgAmount",
        check: (revision: any) =>
          revision?.financialTerms?.pbgAmountAgreement === "agree",
      },
      {
        label: "PBG Notes",
        key: "pbgNotes",
        check: (revision: any) =>
          revision?.financialTerms?.pbgNotesAgreement === "agree",
      },
      {
        label: "Buyer Financial Notes",
        key: "financialNotes",
        check: (revision: any) =>
          revision?.financialTerms?.financialNotesAgreement === "agree",
      },
      {
        label: "General T&C",
        key: "generalTerms",
        check: (revision: any) => revision?.generalTerms?.agreement === "agree",
      },
      {
        label: "Special T&C",
        key: "specialTerms",
        check: (revision: any) => revision?.specialTerms?.agreement === "agree",
      },
    ];
    const documentCriteria = documentArray.map((doc) => ({
      label: doc,
      key: `doc_${doc}`,
      check: (vendor: ProcessedVendor) => checkDocumentCompliance(vendor, doc),
    }));
    const evaluationCriteriaDynamic = evaluationCriteria.map(
      (criteria: EvaluationCriteriaItem) => ({
        label: criteria.label || criteria.remarks || "Unknown Criteria",
        key: `eval_${criteria.label || criteria.remarks}`,
        check: (vendor: ProcessedVendor) =>
          checkEvaluationCriteria(
            vendor,
            criteria.label || criteria.remarks || ""
          ),
      })
    );

    if (
      baseCriteria.length === 0 &&
      documentCriteria.length === 0 &&
      evaluationCriteriaDynamic.length === 0
    )
      return null;

    const cellWidth = getVendorCellWidth();
    const fontSize = getFontSize();

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>COMPLIANCE CHECKLIST</Text>
        {/* <Text style={styles.sectionSubtitle}>
          Vendor compliance with terms, conditions, and evaluation criteria
        </Text> */}

        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={[styles.tableCellLeft, { width: 100 }]}>
              <Text style={{ fontSize }}>Compliance Criteria</Text>
            </View>
            {sortedVendors.map((vendor) => {
              const maxNameLength =
                sortedVendors.length > 8
                  ? 8
                  : sortedVendors.length > 6
                    ? 10
                    : 12;
              const displayName =
                vendor.name.length > maxNameLength
                  ? vendor.name.substring(0, maxNameLength) + "..."
                  : vendor.name;

              return (
                <View
                  key={vendor.id}
                  style={[
                    styles.tableCell,
                    getCellStyle(vendor),
                    { width: cellWidth, minWidth: cellWidth },
                  ]}
                >
                  <Text style={{ fontWeight: "bold", fontSize }}>
                    {displayName}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Base Compliance Criteria */}
          {baseCriteria.map((criteria, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.evenRow : styles.oddRow,
              ]}
            >
              <View style={[styles.tableCellLeft, { width: 100 }]}>
                <Text style={{ fontSize }}>{criteria.label}</Text>
              </View>
              {sortedVendors.map((vendor) => {
                const latestRevision = getLatestRevision(vendor);
                const isCompliant = criteria.check(latestRevision);

                return (
                  <View
                    key={vendor.id}
                    style={[
                      styles.tableCell,
                      getCellStyle(vendor),
                      { width: cellWidth, minWidth: cellWidth },
                    ]}
                  >
                    <Text
                      style={{
                        color: isCompliant ? "#059669" : "#dc2626",
                        fontWeight: "bold",
                        fontSize,
                      }}
                    >
                      {isCompliant ? "Yes" : "No"}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}

          {/* Document Compliance Section */}
          {documentCriteria?.length > 0 && (
            <>
              <View style={[styles.tableRow, { backgroundColor: "#f3f4f6" }]}>
                <View style={[styles.tableCellLeft, { width: 100 }]}>
                  <Text style={{ fontWeight: "bold", fontSize }}>
                    DOCUMENT COMPLIANCE
                  </Text>
                </View>
                {sortedVendors.map((vendor) => {
                  const maxNameLength =
                    sortedVendors.length > 8
                      ? 8
                      : sortedVendors.length > 6
                        ? 10
                        : 12;
                  const displayName =
                    vendor.name.length > maxNameLength
                      ? vendor.name.substring(0, maxNameLength) + "..."
                      : vendor.name;

                  return (
                    <View
                      key={`${vendor.id}-doc-header`}
                      style={[
                        styles.tableCell,
                        getCellStyle(vendor),
                        { width: cellWidth, minWidth: cellWidth },
                      ]}
                    >
                      <Text style={{ fontWeight: "bold", fontSize }}>
                        {displayName}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {documentCriteria.map((criteria, index) => (
                <View
                  key={`doc-${index}`}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}
                >
                  <View style={[styles.tableCellLeft, { width: 100 }]}>
                    <Text style={{ fontSize }}>{criteria.label}</Text>
                  </View>
                  {sortedVendors.map((vendor) => {
                    const isCompliant = criteria.check(vendor);

                    return (
                      <View
                        key={vendor.id}
                        style={[
                          styles.tableCell,
                          getCellStyle(vendor),
                          { width: cellWidth, minWidth: cellWidth },
                        ]}
                      >
                        <Text
                          style={{
                            color: isCompliant ? "#059669" : "#dc2626",
                            fontWeight: "bold",
                            fontSize,
                          }}
                        >
                          {isCompliant ? " Yes" : " No"}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </>
          )}
        </View>
      </View>
    );
  };

  const renderVendorProfileTable = (): React.ReactElement => {
    const cellWidth = getVendorCellWidth();
    const fontSize = getFontSize();
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>VENDOR PROFILES</Text>
        {/* <Text style={styles.sectionSubtitle}>
          Basic vendor information and contact details
        </Text> */}

        <View style={styles.table}>
          {renderTableHeader()}

          {profileCriteria.map((criteria, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.evenRow : styles.oddRow,
              ]}
            >
              <View style={[styles.tableCellLeft, { width: 100 }]}>
                <Text style={{ fontSize }}>{criteria.name}</Text>
              </View>
              {sortedVendors.map((vendor) => (
                <View
                  key={vendor.id}
                  style={[
                    styles.tableCell,
                    getCellStyle(vendor),
                    { width: cellWidth, minWidth: cellWidth },
                  ]}
                >
                  <Text style={{ fontSize }}>
                    {renderProfileCellContent(vendor, criteria.key)}
                  </Text>

                  {criteria.key === "price" && isLowestPrice(vendor) && (
                    <Text
                      style={[
                        styles.bestValueBadge,
                        { fontSize: fontSize - 1 },
                      ]}
                    >
                      Best Price
                    </Text>
                  )}

                  {criteria.key === "delivery" && isFastestDelivery(vendor) && (
                    <Text
                      style={[
                        styles.bestValueBadge,
                        { fontSize: fontSize - 1 },
                      ]}
                    >
                      Fastest
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderCommercialsTable = (): React.ReactElement => {
    const cellWidth = getVendorCellWidth();
    const fontSize = getFontSize();

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>COMMERCIAL COMPARISON</Text>
        {/* <Text style={styles.sectionSubtitle}>
          Financial terms and commercial considerations
        </Text> */}
        <View style={styles.table}>
          {renderTableHeader()}
          {commercialsCriteria.map((criteria, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.evenRow : styles.oddRow,
              ]}
            >
              <View style={[styles.tableCellLeft, { width: 100 }]}>
                <Text style={{ fontSize }}>{criteria.name}</Text>
              </View>
              {sortedVendors.map((vendor) => (
                <View
                  key={vendor.id}
                  style={[
                    styles.tableCell,
                    getCellStyle(vendor),
                    { width: cellWidth, minWidth: cellWidth },
                  ]}
                >
                  <Text style={{ fontSize }}>
                    {renderCommercialsCellContent(vendor, criteria.key)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {renderEnhancedHeader()}
        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXECUTIVE SUMMARY</Text>
          <View style={styles.executiveSummary}>
            <Text style={styles.summaryText}>
              This vendor comparison report provides a comprehensive analysis of{" "}
              {vendors?.length} vendors for RFP.
            </Text>

            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{vendors.length}</Text>
                <Text style={styles.statLabel}>Vendors</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {getLowestPrice().toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Lowest Price</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getFastestDelivery()}</Text>
                <Text style={styles.statLabel}>Fastest Delivery (days)</Text>
              </View>
            </View>
          </View>
        </View>
        {renderVendorProfileTable()}
        {renderCommercialsTable()}
        {/* {renderItemLevelComparison()} */}
        <ItemLevelComparison
          buyerData={buyerData}
          sortedVendors={sortedVendors}
          allRevisionIndices={allRevisionIndices}
          targetPriceTotal={targetPriceTotal}
          lopTotals={lopTotals}
          getVendorCellWidth={getVendorCellWidth}
          getFontSize={getFontSize}
          getRevisionItem={getRevisionItem}
        />
        {renderSavingsAnalysis()}
        {renderComplianceTable()}
        {renderApprovalSummary()}
        {renderEnhancedFooter()}
      </Page>
    </Document>
  );
};

export default VendorComparisionPdf;
