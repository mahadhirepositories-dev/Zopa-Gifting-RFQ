/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register custom fonts
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-400-normal.woff",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-500-normal.woff",
      fontWeight: 500,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-600-normal.woff",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-700-normal.woff",
      fontWeight: 700,
    },
  ],
});

// Color palette
const colors = {
  primary: "#3B82F6",
  primaryLight: "#93C5FD",
  primaryDark: "#1D4ED8",
  secondary: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
  gray: "#6B7280",
  grayLight: "#F3F4F6",
  grayDark: "#374151",
  white: "#FFFFFF",
  black: "#111827",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    padding: "40 30",
    fontSize: 7,
    lineHeight: 1.3,
    color: colors.grayDark,
    backgroundColor: colors.white,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 9,
    color: colors.gray,
    marginBottom: 3,
  },
  section: {
    marginBottom: 12,
    pageBreakInside: "avoid",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
  },
  subsectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.grayDark,
    marginBottom: 4,
    marginTop: 8,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: colors.grayLight,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
    minHeight: 20,
  },
  tableHeader: {
    backgroundColor: colors.grayLight,
    fontWeight: "bold",
    color: colors.black,
  },
  tableCell: {
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: colors.grayLight,
    fontSize: 7,
    justifyContent: "center",
    textAlign: "center",
  },
  tableCellLeft: {
    textAlign: "left",
    paddingLeft: 4,
  },
  lastCell: {
    borderRightWidth: 0,
  },
  vendorName: {
    fontWeight: "bold",
    color: colors.primary,
  },
  priceCell: {
    textAlign: "right",
    fontWeight: "bold",
  },
  statusGood: {
    color: colors.success,
    fontWeight: "bold",
  },
  statusBad: {
    color: colors.danger,
    fontWeight: "bold",
  },
  statusNeutral: {
    color: colors.gray,
  },
  summaryBox: {
    backgroundColor: colors.grayLight,
    padding: 8,
    borderRadius: 3,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 8,
    marginBottom: 2,
  },
  boldText: {
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 15,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 7,
    color: colors.gray,
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
    paddingTop: 8,
  },
  recommendationBox: {
    backgroundColor: "#E0F2FE",
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: 6,
    marginBottom: 6,
  },
  complianceCheckmark: {
    color: colors.success,
    fontWeight: "bold",
  },
  complianceCross: {
    color: colors.danger,
    fontWeight: "bold",
  },
  itemRow: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayLight,
  },
  totalRow: {
    backgroundColor: "#F8FAFC",
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    fontWeight: "bold",
  },
});

interface VendorComparisonDocumentProps {
  vendors: any[];
  buyerData?: any;
  evaluationCriteria?: any[];
  rfpUniqueId?: string;
  projectName?: string;
  selectedVendors?: Map<string, any>;
  document?: any;
}

export const VendorComparisonDocument: React.FC<
  VendorComparisonDocumentProps
> = ({
  vendors = [],
  buyerData,
  evaluationCriteria,
  rfpUniqueId,
  projectName,
  selectedVendors,
  document,
}) => {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Helper functions
  const getStatusStyle = (
    value: string | number,
    type: "price" | "delivery" | "compliance"
  ) => {
    switch (type) {
      case "price":
        return typeof value === "number" && value > 0
          ? styles.statusGood
          : styles.statusBad;
      case "delivery":
        return typeof value === "number" && value > 0
          ? styles.statusGood
          : styles.statusNeutral;
      case "compliance":
        return value === "Yes" || (typeof value === "boolean" && value === true)
          ? styles.statusGood
          : styles.statusBad;
      default:
        return styles.statusNeutral;
    }
  };

  const calculateNetAmount = (grossAmount: number, gstRate: number = 18) => {
    if (!grossAmount || isNaN(grossAmount)) return 0;
    return grossAmount / (1 + gstRate / 100);
  };

  const getLatestRevision = (vendor: any) => {
    if (
      !vendor ||
      !vendor.revisions ||
      !Array.isArray(vendor.revisions) ||
      vendor.revisions.length === 0
    ) {
      return null;
    }
    return vendor.revisions[vendor.revisions.length - 1];
  };

  const getRevisionItem = (
    vendor: any,
    itemIndex: number,
    revisionIndex: number
  ) => {
    if (
      !vendor ||
      !vendor.revisions ||
      !Array.isArray(vendor.revisions) ||
      vendor.revisions.length <= revisionIndex
    ) {
      return null;
    }

    const revision = vendor.revisions[revisionIndex];
    if (
      !revision ||
      !revision.boqDetails ||
      !Array.isArray(revision.boqDetails) ||
      revision.boqDetails.length === 0
    ) {
      return null;
    }

    return revision.boqDetails[itemIndex] || revision.boqDetails[0] || null;
  };

  const calculateItemTotal = (item: any, qty: string | number) => {
    if (!item || !item.quotePrice) return null;

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

    if (isNaN(price) || isNaN(quantity)) return null;

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

  // Sort vendors by price
  const sortedVendors = [...vendors].sort(
    (a, b) => (a.actualPrice ?? Infinity) - (b.actualPrice ?? Infinity)
  );

  // Filter out vendors with no data
  const validVendors = sortedVendors.filter(
    (vendor) => vendor && vendor.vendorResponseId
  );

  return (
    <Document>
      {/* Page 1: Overview and Vendor Profiles */}
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vendor Comparison Report</Text>
          <Text style={styles.subtitle}>
            Project: {projectName || "RFQ Project"}
          </Text>
          <Text style={styles.subtitle}>
            RFQ ID: {rfpUniqueId || "N/A"} | Generated on {today}
          </Text>
          <Text style={styles.subtitle}>
            Total Vendors: {validVendors.length} | Submitted:{" "}
            {validVendors.filter((v) => v.status === "submitted").length}
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>
              <Text style={styles.boldText}>Lowest Price Vendor: </Text>
              {validVendors.find((v) => v.isLowestPrice)?.companyName ||
                "N/A"}{" "}
              -
              {validVendors.find((v) => v.isLowestPrice)?.actualPrice
                ? ` ₹${validVendors.find((v) => v.isLowestPrice)?.actualPrice.toLocaleString()}`
                : " N/A"}
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.boldText}>Fastest Delivery: </Text>
              {validVendors.find((v) => v.isFastestDelivery)?.companyName ||
                "N/A"}{" "}
              -
              {validVendors.find((v) => v.isFastestDelivery)?.deliveryTime
                ? ` ${validVendors.find((v) => v.isFastestDelivery)?.deliveryTime} days`
                : " N/A"}
            </Text>
            {selectedVendors && selectedVendors.size > 0 && (
              <Text style={styles.summaryText}>
                <Text style={styles.boldText}>Recommended Vendors: </Text>
                {Array.from(selectedVendors.values())
                  .map((v) => v.companyName)
                  .join(", ")}
              </Text>
            )}
          </View>
        </View>

        {/* Vendor Profile Comparison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Vendor Profile Comparison</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { width: "18%" }]}>Vendor</Text>
              <Text style={[styles.tableCell, { width: "12%" }]}>Email</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>Phone</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>Location</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>
                Quote Ref
              </Text>
              <Text style={[styles.tableCell, { width: "8%" }]}>Revision</Text>
              <Text style={[styles.tableCell, { width: "12%" }]}>
                Total Price (₹)
              </Text>
              <Text
                style={[styles.tableCell, styles.lastCell, { width: "15%" }]}
              >
                Delivery (Days)
              </Text>
            </View>

            {/* Rows */}
            {validVendors.map((vendor, index) => (
              <View
                key={vendor.vendorResponseId}
                style={[
                  styles.tableRow,
                  index % 2 === 0
                    ? { backgroundColor: "#ffffff" }
                    : { backgroundColor: "#f9fafb" },
                ]}
              >
                <Text
                  style={[
                    styles.tableCell,
                    styles.vendorName,
                    styles.tableCellLeft,
                    { width: "18%" },
                  ]}
                >
                  {vendor.name || vendor.companyName || "N/A"}
                  {vendor.isLowestPrice && "\n(Lowest Price)"}
                  {vendor.isFastestDelivery && "\n(Fastest)"}
                  {selectedVendors?.has(vendor.vendorResponseId) &&
                    "\n★ RECOMMENDED"}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellLeft,
                    { width: "12%" },
                  ]}
                >
                  {vendor.email || "N/A"}
                </Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>
                  {vendor.phone || "N/A"}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellLeft,
                    { width: "15%" },
                  ]}
                >
                  {vendor.location || "N/A"}
                </Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>
                  {vendor.quoteRefId || "N/A"}
                </Text>
                <Text style={[styles.tableCell, { width: "8%" }]}>
                  {vendor.revision || "N/A"}
                </Text>
                <Text
                  style={[styles.tableCell, styles.priceCell, { width: "12%" }]}
                >
                  {vendor.actualPrice
                    ? `₹${vendor.actualPrice.toLocaleString()}`
                    : "N/A"}
                </Text>
                <Text
                  style={[styles.tableCell, styles.lastCell, { width: "15%" }]}
                >
                  {vendor.deliveryTime ? `${vendor.deliveryTime} days` : "N/A"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Confidential - Vendor Comparison Report | Generated on {today} |
            Page 1
          </Text>
        </View>
      </Page>

      {/* Page 2: Commercial Comparison */}
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Commercial Comparison</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { width: "25%" }]}>Vendor</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>
                Net Amount (₹)
              </Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>
                Gross Amount (₹)
              </Text>
              <Text style={[styles.tableCell, { width: "12%" }]}>
                Total Discount (₹)
              </Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>
                Revisions
              </Text>
              <Text
                style={[styles.tableCell, styles.lastCell, { width: "23%" }]}
              >
                Exclusions
              </Text>
            </View>

            {/* Rows */}
            {validVendors.map((vendor, index) => {
              const hasDiscount =
                vendor.revisionCount > 1 && vendor.priceDifference > 0;
              return (
                <View
                  key={vendor.vendorResponseId}
                  style={[
                    styles.tableRow,
                    index % 2 === 0
                      ? { backgroundColor: "#ffffff" }
                      : { backgroundColor: "#f9fafb" },
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      styles.vendorName,
                      styles.tableCellLeft,
                      { width: "25%" },
                    ]}
                  >
                    {vendor.name || vendor.companyName || "N/A"}
                    {selectedVendors?.has(vendor.vendorResponseId) &&
                      "\n★ RECOMMENDED"}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.priceCell,
                      { width: "15%" },
                    ]}
                  >
                    {vendor.actualPrice
                      ? `₹${calculateNetAmount(vendor.actualPrice).toLocaleString()}`
                      : "N/A"}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.priceCell,
                      { width: "15%" },
                    ]}
                  >
                    {vendor.actualPrice
                      ? `₹${vendor.actualPrice.toLocaleString()}`
                      : "N/A"}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.priceCell,
                      { width: "12%" },
                    ]}
                  >
                    {hasDiscount
                      ? `₹${vendor.priceDifference.toLocaleString()}`
                      : "No discount"}
                  </Text>
                  <Text style={[styles.tableCell, { width: "10%" }]}>
                    {vendor.revisionCount ? vendor.revisionCount - 1 : 0}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableCellLeft,
                      styles.lastCell,
                      { width: "23%" },
                    ]}
                  >
                    {typeof vendor.otherInformation === "string"
                      ? vendor.otherInformation || "N/A"
                      : vendor.otherInformation &&
                          Object.keys(vendor.otherInformation).length > 0
                        ? JSON.stringify(vendor.otherInformation).substring(
                            0,
                            100
                          ) + "..."
                        : "N/A"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Vendor Recommendations Section */}
        {selectedVendors && selectedVendors.size > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Vendor Recommendations</Text>
            {Array.from(selectedVendors.values()).map((vendor, index) => (
              <View
                key={vendor.vendorResponseId || index}
                style={styles.recommendationBox}
              >
                <Text style={[styles.summaryText, styles.boldText]}>
                  {index + 1}. {vendor.companyName || vendor.name || "N/A"}
                </Text>
                <Text style={styles.summaryText}>
                  <Text style={styles.boldText}>Recommendation Remarks: </Text>
                  {vendor.remarks || "No remarks provided"}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text>
            Confidential - Vendor Comparison Report | Generated on {today} |
            Page 2
          </Text>
        </View>
      </Page>

      {/* Page 3: Item Level Comparison (if BOQ data available) */}
      {buyerData && Array.isArray(buyerData) && buyerData.length > 0 && (
        <Page size="A4" style={styles.page} orientation="landscape">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              4. Item Level Comparison (BOQ)
            </Text>

            {/* BOQ Items Table */}
            <View style={styles.table}>
              {/* Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { width: "20%" }]}>
                  Description
                </Text>
                <Text style={[styles.tableCell, { width: "8%" }]}>UOM</Text>
                <Text style={[styles.tableCell, { width: "8%" }]}>Qty</Text>
                <Text style={[styles.tableCell, { width: "12%" }]}>
                  Target Price (₹)
                </Text>
                {validVendors.slice(0, 4).map((vendor) => (
                  <Text
                    key={vendor.vendorResponseId}
                    style={[
                      styles.tableCell,
                      { width: `${52 / Math.min(validVendors.length, 4)}%` },
                    ]}
                  >
                    {vendor.name || vendor.companyName || "N/A"}
                  </Text>
                ))}
              </View>

              {/* BOQ Items */}
              {buyerData.slice(0, 15).map((item: any, index: number) => {
                const displayQty = item.qty || 0;

                return (
                  <View key={index} style={[styles.tableRow, styles.itemRow]}>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.tableCellLeft,
                        { width: "20%" },
                      ]}
                    >
                      {item.description}
                      {item.category && `\nCat: ${item.category}`}
                    </Text>
                    <Text style={[styles.tableCell, { width: "8%" }]}>
                      {item.uom}
                    </Text>
                    <Text style={[styles.tableCell, { width: "8%" }]}>
                      {displayQty}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.priceCell,
                        { width: "12%" },
                      ]}
                    >
                      ₹
                      {parseFloat(
                        String(item.targetPrice || 0)
                      ).toLocaleString()}
                    </Text>
                    {validVendors.slice(0, 4).map((vendor) => {
                      const revItem = getRevisionItem(
                        vendor,
                        index,
                        vendor.revisions ? vendor.revisions.length - 1 : 0
                      );
                      const revTotal = calculateItemTotal(revItem, displayQty);

                      return (
                        <Text
                          key={vendor.vendorResponseId}
                          style={[
                            styles.tableCell,
                            styles.priceCell,
                            {
                              width: `${52 / Math.min(validVendors.length, 4)}%`,
                            },
                          ]}
                        >
                          {revItem && revTotal
                            ? `₹${Number(revItem.quotePrice).toLocaleString()}\n(Total: ₹${revTotal.lineTotalInclTax.toLocaleString()})`
                            : "N/A"}
                        </Text>
                      );
                    })}
                  </View>
                );
              })}

              {/* Total Row */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[styles.tableCell, styles.boldText, { width: "36%" }]}
                >
                  GRAND TOTAL
                </Text>
                <Text style={[styles.tableCell, { width: "12%" }]}></Text>
                {validVendors.slice(0, 4).map((vendor) => (
                  <Text
                    key={vendor.vendorResponseId}
                    style={[
                      styles.tableCell,
                      styles.priceCell,
                      styles.boldText,
                      { width: `${52 / Math.min(validVendors.length, 4)}%` },
                    ]}
                  >
                    ₹{vendor.actualPrice?.toLocaleString() || "N/A"}
                  </Text>
                ))}
              </View>
            </View>

            {buyerData.length > 15 && (
              <Text
                style={[
                  styles.summaryText,
                  { textAlign: "center", fontStyle: "italic" },
                ]}
              >
                ... and {buyerData.length - 15} more items (showing first 15
                items for space)
              </Text>
            )}
          </View>

          <View style={styles.footer}>
            <Text>
              Confidential - Vendor Comparison Report | Generated on {today} |
              Page 3
            </Text>
          </View>
        </Page>
      )}

      {/* Page 4: Compliance Matrix */}
      {evaluationCriteria && evaluationCriteria.length > 0 && (
        <Page size="A4" style={styles.page} orientation="landscape">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Compliance Matrix</Text>

            {/* Basic Compliance */}
            <View style={styles.subsectionTitle}>
              <Text>Basic Compliance Requirements</Text>
            </View>

            <View style={styles.table}>
              {/* Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { width: "30%" }]}>
                  Compliance Criteria
                </Text>
                {validVendors.slice(0, 5).map((vendor) => (
                  <Text
                    key={vendor.vendorResponseId}
                    style={[
                      styles.tableCell,
                      { width: `${70 / Math.min(validVendors.length, 5)}%` },
                    ]}
                  >
                    {vendor.name || vendor.companyName || "N/A"}
                  </Text>
                ))}
              </View>

              {/* Basic Compliance Rows */}
              {[
                { label: "Scope of Work Agreement", key: "scopeOfWork" },
                { label: "Payment Terms Agreement", key: "paymentTerms" },
                { label: "General T&C Agreement", key: "generalTerms" },
                { label: "Special T&C Agreement", key: "specialTerms" },
              ].map((criteria, index) => (
                <View
                  key={criteria.key}
                  style={[
                    styles.tableRow,
                    index % 2 === 0
                      ? { backgroundColor: "#ffffff" }
                      : { backgroundColor: "#f9fafb" },
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableCellLeft,
                      { width: "30%" },
                    ]}
                  >
                    {criteria.label}
                  </Text>
                  {validVendors.slice(0, 5).map((vendor) => {
                    const revision = getLatestRevision(vendor);
                    let isCompliant = false;

                    switch (criteria.key) {
                      case "scopeOfWork":
                        isCompliant =
                          (revision?.scopeOfWork?.agreement || "agree") === "agree";
                        break;
                      case "paymentTerms":
                        isCompliant =
                          (revision?.financialTerms?.paymentTermsAgreement || "agree") ===
                          "agree";
                        break;
                      case "generalTerms":
                        isCompliant =
                          (revision?.generalTerms?.agreement || "agree") === "agree";
                        break;
                      case "specialTerms":
                        isCompliant =
                          (revision?.specialTerms?.agreement || "agree") === "agree";
                        break;
                    }

                    return (
                      <Text
                        key={vendor.vendorResponseId}
                        style={[
                          styles.tableCell,
                          {
                            width: `${70 / Math.min(validVendors.length, 5)}%`,
                          },
                          isCompliant
                            ? styles.complianceCheckmark
                            : styles.complianceCross,
                        ]}
                      >
                        {isCompliant ? "✓" : "✗"}
                      </Text>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Evaluation Criteria */}
            <View style={styles.subsectionTitle}>
              <Text>Evaluation Criteria</Text>
            </View>

            <View style={styles.table}>
              {/* Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { width: "30%" }]}>
                  Criteria
                </Text>
                {validVendors.slice(0, 5).map((vendor) => (
                  <Text
                    key={vendor.vendorResponseId}
                    style={[
                      styles.tableCell,
                      { width: `${70 / Math.min(validVendors.length, 5)}%` },
                    ]}
                  >
                    {vendor.name || vendor.companyName || "N/A"}
                  </Text>
                ))}
              </View>

              {/* Evaluation Criteria Rows */}
              {evaluationCriteria.slice(0, 10).map((criterion, index) => (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    index % 2 === 0
                      ? { backgroundColor: "#ffffff" }
                      : { backgroundColor: "#f9fafb" },
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableCellLeft,
                      { width: "30%" },
                    ]}
                  >
                    {typeof criterion === "string"
                      ? criterion
                      : criterion?.label || `Criterion ${index + 1}`}
                  </Text>
                  {validVendors.slice(0, 5).map((vendor) => {
                    const revision = getLatestRevision(vendor);
                    const compliance =
                      revision?.evaluationCriteria?.[index]?.value || "No";
                    const isCompliant = compliance === "Yes";

                    return (
                      <Text
                        key={vendor.vendorResponseId}
                        style={[
                          styles.tableCell,
                          {
                            width: `${70 / Math.min(validVendors.length, 5)}%`,
                          },
                          isCompliant
                            ? styles.complianceCheckmark
                            : styles.complianceCross,
                        ]}
                      >
                        {isCompliant ? "✓" : "✗"}
                      </Text>
                    );
                  })}
                </View>
              ))}
            </View>

            {evaluationCriteria.length > 10 && (
              <Text
                style={[
                  styles.summaryText,
                  { textAlign: "center", fontStyle: "italic" },
                ]}
              >
                ... and {evaluationCriteria.length - 10} more criteria (showing
                first 10 for space)
              </Text>
            )}
          </View>

          <View style={styles.footer}>
            <Text>
              Confidential - Vendor Comparison Report | Generated on {today} |
              Page 4
            </Text>
          </View>
        </Page>
      )}

      {/* Final Page: Summary and Recommendations */}
      <Page size="A4" style={styles.page} orientation="portrait">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Final Summary & Recommendations
          </Text>

          {/* Key Metrics Summary */}
          <View style={styles.summaryBox}>
            <Text style={[styles.summaryText, styles.boldText]}>
              Key Metrics Overview
            </Text>
            <Text style={styles.summaryText}>
              • Total Vendors Responded:{" "}
              {validVendors.filter((v) => v.status === "submitted").length} out
              of {validVendors.length}
            </Text>
            <Text style={styles.summaryText}>
              • Price Range: ₹
              {Math.min(
                ...validVendors.map((v) => v.actualPrice || Infinity)
              ).toLocaleString()}{" "}
              - ₹
              {Math.max(
                ...validVendors.map((v) => v.actualPrice || 0)
              ).toLocaleString()}
            </Text>
            <Text style={styles.summaryText}>
              • Average Delivery Time:{" "}
              {Math.round(
                validVendors.reduce(
                  (sum, v) => sum + (parseInt(v.deliveryTime) || 0),
                  0
                ) / validVendors.length
              )}{" "}
              days
            </Text>
            {selectedVendors && selectedVendors.size > 0 && (
              <Text style={styles.summaryText}>
                • Recommended Vendors: {selectedVendors.size} out of{" "}
                {validVendors.length}
              </Text>
            )}
          </View>

          {/* Detailed Recommendations */}
          {selectedVendors && selectedVendors.size > 0 && (
            <View style={styles.section}>
              <Text style={styles.subsectionTitle}>
                Detailed Vendor Recommendations
              </Text>
              {Array.from(selectedVendors.values()).map((vendor, index) => {
                const vendorDetails = validVendors.find(
                  (v) => v.vendorResponseId === vendor.vendorResponseId
                );
                return (
                  <View
                    key={vendor.vendorResponseId || index}
                    style={styles.recommendationBox}
                  >
                    <Text style={[styles.summaryText, styles.boldText]}>
                      {index + 1}. {vendor.companyName || vendor.name || "N/A"}
                    </Text>
                    {vendorDetails && (
                      <>
                        <Text style={styles.summaryText}>
                          • Total Price: ₹
                          {vendorDetails.actualPrice?.toLocaleString() || "N/A"}
                        </Text>
                        <Text style={styles.summaryText}>
                          • Delivery Time: {vendorDetails.deliveryTime || "N/A"}{" "}
                          days
                        </Text>
                        <Text style={styles.summaryText}>
                          • Location: {vendorDetails.location || "N/A"}
                        </Text>
                      </>
                    )}
                    <Text style={styles.summaryText}>
                      <Text style={styles.boldText}>
                        Recommendation Reason:{" "}
                      </Text>
                      {vendor.remarks || "No specific remarks provided"}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Comparative Analysis */}
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>Comparative Analysis</Text>
            <View style={styles.summaryBox}>
              <Text style={[styles.summaryText, styles.boldText]}>
                Price Comparison:
              </Text>
              {validVendors.slice(0, 3).map((vendor, index) => (
                <Text key={vendor.vendorResponseId} style={styles.summaryText}>
                  {index + 1}. {vendor.name || vendor.companyName || "N/A"}: ₹
                  {vendor.actualPrice?.toLocaleString() || "N/A"}
                  {index === 0 && " (Lowest)"}
                </Text>
              ))}
            </View>

            <View style={styles.summaryBox}>
              <Text style={[styles.summaryText, styles.boldText]}>
                Delivery Comparison:
              </Text>
              {validVendors
                .filter((v) => v.deliveryTime)
                .sort(
                  (a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime)
                )
                .slice(0, 3)
                .map((vendor, index) => (
                  <Text
                    key={vendor.vendorResponseId}
                    style={styles.summaryText}
                  >
                    {index + 1}. {vendor.name || vendor.companyName || "N/A"}:{" "}
                    {vendor.deliveryTime} days
                    {index === 0 && " (Fastest)"}
                  </Text>
                ))}
            </View>
          </View>

          {/* Compliance Summary */}
          {evaluationCriteria && evaluationCriteria.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.subsectionTitle}>Compliance Summary</Text>
              <View style={styles.summaryBox}>
                {validVendors.map((vendor) => {
                  const revision = getLatestRevision(vendor);
                  const complianceCount = evaluationCriteria.reduce(
                    (count, _, index) => {
                      return (
                        count +
                        (revision?.evaluationCriteria?.[index]?.value === "Yes"
                          ? 1
                          : 0)
                      );
                    },
                    0
                  );
                  const compliancePercentage = Math.round(
                    (complianceCount / evaluationCriteria.length) * 100
                  );

                  return (
                    <Text
                      key={vendor.vendorResponseId}
                      style={styles.summaryText}
                    >
                      • {vendor.name}: {complianceCount}/
                      {evaluationCriteria.length} criteria met (
                      {compliancePercentage}%)
                    </Text>
                  );
                })}
              </View>
            </View>
          )}

          {/* Next Steps */}
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>Recommended Next Steps</Text>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>
                1. Review recommended vendors and their detailed proposals
              </Text>
              <Text style={styles.summaryText}>
                2. Conduct technical evaluation and site visits if required
              </Text>
              <Text style={styles.summaryText}>
                3. Negotiate final terms and conditions with shortlisted vendors
              </Text>
              <Text style={styles.summaryText}>
                4. Obtain necessary approvals from stakeholders
              </Text>
              <Text style={styles.summaryText}>
                5. Finalize vendor selection and proceed with contract award
              </Text>
            </View>
          </View>

          {/* Disclaimers */}
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>
              Important Notes & Disclaimers
            </Text>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>
                • This report is generated based on vendor responses received as
                of {today}
              </Text>
              <Text style={styles.summaryText}>
                • All prices are subject to final negotiation and contract terms
              </Text>
              <Text style={styles.summaryText}>
                • Compliance status is based on vendor declarations and may
                require verification
              </Text>
              <Text style={styles.summaryText}>
                • Technical specifications and delivery terms should be
                validated before final selection
              </Text>
              <Text style={styles.summaryText}>
                • This document is confidential and intended for internal use
                only
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Confidential - Vendor Comparison Report | Generated on {today} |
            Final Page
          </Text>
        </View>
      </Page>
    </Document>
  );
};
