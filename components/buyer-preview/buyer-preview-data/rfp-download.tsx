/* eslint-disable jsx-a11y/alt-text */
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
  Image,
} from "@react-pdf/renderer";

interface TemplateSettings {
  showCompanyLogo: boolean;
  showCompanyName: boolean;
  showDocumentTitle: boolean;
  headerLayout: "left" | "center" | "right";
  includeSections: {
    companyIntroduction: boolean;
    aboutRequirement: boolean;
    scopeOfWork: boolean;
    billOfQuantities: boolean;
    evaluationCriteria: boolean;
    financialInformation: boolean;
    generalTerms: boolean;
    specialTerms: boolean;
    documentsToShare: boolean;
    vendorSelection: boolean;
    contactInformation: boolean;
    rfpTimeline: boolean;
  };
  showFooterContact: boolean;
  showPageNumbers: boolean;
  footerLayout: "single-line" | "multi-line";
  footerAlignment: "left" | "center" | "right";
  pageNumberAlignment: "left" | "center" | "right";
  fontFamily:
    | "inter"
    | "roboto"
    | "poppins"
    | "opensans"
    | "raleway"
    | "allura"
    | "delius"
    | "asimovian";
  fontSize: {
    header: number;
    subheader: number;
    body: number;
    footer: number;
  };
  pageMargins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  sectionSpacing: number;
  lineSpacing: number;
}

const getFontFamilyForPDF = (
  fontFamily:
    | "inter"
    | "roboto"
    | "poppins"
    | "opensans"
    | "raleway"
    | "allura"
    | "delius"
    | "asimovian"
): string => {
  try {
    switch (fontFamily) {
      case "inter":
        return "Inter";
      case "roboto":
        return "Roboto";
      case "poppins":
        return "Poppins";
      case "opensans":
        return "Open Sans";
      case "raleway":
        return "Raleway";
      case "allura":
        return "Allura";
      case "delius":
        return "Delius";
      case "asimovian":
        return "Asimovian";
      default:
        return "Inter";
    }
  } catch (error) {
    console.error("Error getting font family:", error);
    return "Inter"; // safe fallback
  }
};

// Register custom fonts (keeping the existing font registration)
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
  primary: "#3B82F6", // Blue-500
  primaryLight: "#93C5FD", // Blue-300
  primaryDark: "#1D4ED8", // Blue-700
  secondary: "#10B981", // Emerald-500
  danger: "#EF4444", // Red-500
  warning: "#F59E0B", // Amber-500
  success: "#10B981", // Emerald-500
  gray: "#6B7280", // Gray-500
  grayLight: "#F3F4F6", // Gray-100
  grayDark: "#374151", // Gray-700
  white: "#FFFFFF",
  black: "#111827",
};

const createStyles = (templateSettings: TemplateSettings) => {
  const pdfFontFamily = getFontFamilyForPDF(templateSettings.fontFamily);

  return StyleSheet.create({
    page: {
      fontFamily: pdfFontFamily,
      fontSize: templateSettings.fontSize.body,
      lineHeight: templateSettings.lineSpacing,
      paddingTop: templateSettings.pageMargins.top,
      paddingBottom: templateSettings.pageMargins.bottom,
      paddingLeft: templateSettings.pageMargins.left,
      paddingRight: templateSettings.pageMargins.right,
      color: colors.grayDark,
      backgroundColor: colors.white,
    },
    fixedHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      padding: "12 50 8 50",
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.grayLight,
      zIndex: 100,
      height: 80,
    },
    letterheadHeader: {
      flexDirection: "row",
      justifyContent:
        templateSettings.headerLayout === "center"
          ? "center"
          : templateSettings.headerLayout === "right"
            ? "flex-end"
            : "flex-start",
      alignItems: "center",
      marginBottom: templateSettings.sectionSpacing * 2,
      paddingBottom: 10,
      borderBottom: "1 solid #e0e0e0",
    },
    headerLogoSection: {
      flexDirection:
        templateSettings.headerLayout === "center" ? "column" : "row",
      alignItems: "center",
      gap: 10,
    },
    companyLogo: {
      width: 80,
      height: 40,
      objectFit: "contain",
    },
    mainHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 5,
    },
    companyHeader: {
      fontSize: templateSettings.fontSize.header,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 2,
      fontFamily: pdfFontFamily,
    },
    companyName: {
      fontSize: templateSettings.fontSize.header,
      fontWeight: "bold",
      color: colors.black,
      textAlign: templateSettings.headerLayout === "center" ? "center" : "left",
      fontFamily: pdfFontFamily,
    },
    documentTitle: {
      fontSize: templateSettings.fontSize.subheader,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 4,
      color: colors.black,
      fontFamily: pdfFontFamily,
    },
    section: {
      marginBottom: templateSettings.sectionSpacing,
      pageBreakInside: "avoid",
    },
    sectionHeader: {
      fontSize: templateSettings.fontSize.subheader,
      fontWeight: "bold",
      marginBottom: 8,
      marginTop: 10,
      color: colors.black,
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray,
      fontFamily: pdfFontFamily,
    },
    text: {
      marginBottom: 6,
      fontSize: templateSettings.fontSize.body,
      lineHeight: templateSettings.lineSpacing,
      fontFamily: pdfFontFamily,
    },
    boldText: {
      fontWeight: "semibold",
      color: colors.grayDark,
    },
    table: {
      width: "100%",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: colors.grayLight,
      marginBottom: 12,
      borderRadius: 6,
      overflow: "hidden",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.grayLight,
      minHeight: 26,
    },
    tableHeader: {
      fontWeight: "semibold",
      color: colors.black,
      minHeight: 30,
      backgroundColor: "#f5f5f5",
    },
    tableCell: {
      padding: 6,
      borderRightWidth: 1,
      borderRightColor: colors.grayLight,
      fontSize: templateSettings.fontSize.body,
      justifyContent: "center",
      fontFamily: pdfFontFamily,
    },
    lastCell: {
      borderRightWidth: 0,
    },
    footer: {
      position: "absolute",
      bottom: 25,
      left: 40,
      right: 40,
      fontSize: templateSettings.fontSize.footer,
      color: colors.gray,
      borderTopWidth: 1,
      borderTopColor: colors.grayLight,
      paddingTop: 16,
      paddingHorizontal: 10,
      backgroundColor: colors.white,
      fontFamily: pdfFontFamily,
    },
    letterheadFooter: {
      position: "absolute",
      bottom: templateSettings.pageMargins.bottom - 30,
      left: templateSettings.pageMargins.left,
      right: templateSettings.pageMargins.right,
      paddingTop: 10,
      borderTop: "1 solid #e0e0e0",
    },
    footerContactContainer: {
      flexDirection:
        templateSettings.footerLayout === "multi-line" ? "column" : "row",
      justifyContent:
        templateSettings.footerAlignment === "center"
          ? "center"
          : templateSettings.footerAlignment === "right"
            ? "flex-end"
            : "flex-start",
      alignItems:
        templateSettings.footerAlignment === "center" ? "center" : "flex-start",
      gap: templateSettings.footerLayout === "multi-line" ? 2 : 15,
    },
    footerItem: {
      flexDirection: "row",
    },
    footerText: {
      fontSize: templateSettings.fontSize.footer,
      color: colors.gray,
      textAlign: templateSettings.footerAlignment,
      fontFamily: pdfFontFamily,
    },
    addressLine: {
      textAlign: "center",
      marginBottom: 2,
    },
    contactRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 5,
    },
    threeColumns: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
      gap: 8,
    },
    column: {
      flex: 1,
    },
    statusBadge: {
      padding: "3 6",
      borderRadius: 12,
      fontSize: templateSettings.fontSize.body,
      fontWeight: "bold",
      alignSelf: "flex-start",
    },
    statusAgreed: {
      backgroundColor: "#D1FAE5",
      color: "#065F46",
    },
    statusNotAgreed: {
      backgroundColor: "#FEE2E2",
      color: "#991B1B",
    },
    statusSubmitted: {
      backgroundColor: "#DBEAFE",
      color: colors.primaryDark,
    },
    listItem: {
      flexDirection: "row",
      marginBottom: 4,
      alignItems: "flex-start",
    },
    bulletPoint: {
      width: 8,
      paddingRight: 4,
      fontSize: templateSettings.fontSize.body,
      color: colors.primary,
    },
    highlightBox: {
      backgroundColor: "#F8FAFC",
      padding: 10,
      borderRadius: 6,
      marginBottom: 10,
    },
    pageNumber: {
      position: "absolute",
      bottom: templateSettings.pageMargins.bottom - 50,
      left: templateSettings.pageMargins.left,
      right: templateSettings.pageMargins.right,
      textAlign: templateSettings.pageNumberAlignment,
      fontSize: templateSettings.fontSize.footer,
      color: colors.gray,
      fontFamily: pdfFontFamily,
    },
    card: {
      padding: 10,
      marginBottom: 10,
      backgroundColor: colors.white,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.grayLight,
    },
    cardTitle: {
      fontSize: templateSettings.fontSize.body,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 4,
      letterSpacing: 0.5,
      fontFamily: pdfFontFamily,
    },
    cardContent: {
      fontSize: templateSettings.fontSize.body,
      color: colors.grayDark,
      lineHeight: templateSettings.lineSpacing,
      fontFamily: pdfFontFamily,
    },
    rowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    agreementBadge: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 12,
    },
    extraCard: {
      backgroundColor: colors.white,
      borderRadius: 6,
      padding: 10,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.grayLight,
    },
    extraTitle: {
      fontSize: templateSettings.fontSize.body,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 4,
      fontFamily: pdfFontFamily,
    },
    extraContent: {
      fontSize: templateSettings.fontSize.body,
      color: colors.grayDark,
      lineHeight: templateSettings.lineSpacing,
      fontFamily: pdfFontFamily,
    },
    deliverySection: {
      backgroundColor: "#F9FAFB",
      padding: 10,
      borderRadius: 6,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.grayLight,
    },
    deliveryRow: {
      flexDirection: "row",
      gap: 15,
      marginTop: 6,
    },
    deliveryColumn: {
      flex: 1,
    },
    deliveryLabel: {
      fontSize: templateSettings.fontSize.body,
      color: colors.gray,
      marginBottom: 2,
      fontWeight: "500",
      fontFamily: pdfFontFamily,
    },
    deliveryValue: {
      fontSize: templateSettings.fontSize.body,
      color: colors.grayDark,
      fontWeight: "500",
      fontFamily: pdfFontFamily,
    },
    agreementStatus: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
      padding: 4,
      borderRadius: 6,
      alignSelf: "flex-start",
    },
    remarksSection: {
      marginTop: 8,
    },
    remarksTitle: {
      fontSize: templateSettings.fontSize.body,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 4,
      fontFamily: pdfFontFamily,
    },
    remarksContent: {
      backgroundColor: "#F1F5F9",
      padding: 6,
      borderRadius: 4,
      fontSize: templateSettings.fontSize.body,
      color: colors.grayDark,
      lineHeight: templateSettings.lineSpacing,
    },
    decorativeHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 4,
    },
    attachmentsContainer: {
      flexDirection: "column",
      gap: 6,
    },
    attachmentHeaderRow: {
      flexDirection: "row",
      backgroundColor: "#f3f4f6",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      minHeight: 26,
      fontWeight: "bold",
    },
    attachmentRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      minHeight: 26,
      backgroundColor: "#fff",
    },
    attachmentRowAlt: {
      backgroundColor: "#f9fafb",
    },
    attachmentCell: {
      padding: 6,
      fontSize: templateSettings.fontSize.body,
      justifyContent: "center",
      fontFamily: pdfFontFamily,
    },
    documentNameCell: {
      flex: 3,
      borderRightWidth: 1,
      borderRightColor: "#e5e7eb",
      fontWeight: "medium",
    },
    statusCell: {
      flex: 1,
      fontWeight: "bold",
      textAlign: "center",
    },
    providedStatus: {
      color: "#166534",
      paddingVertical: 1,
      paddingHorizontal: 3,
      borderRadius: 4,
    },
    missingStatus: {
      color: "#991b1b",
      paddingVertical: 1,
      paddingHorizontal: 3,
      borderRadius: 4,
    },
    mainContent: {
      marginTop: 20,
      marginBottom: 20,
    },
    tableCellContent: {
      flex: 1,
      fontSize: templateSettings.fontSize.body,
      lineHeight: 1.3,
      fontFamily: pdfFontFamily,
    },
    wrappedCell: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    currencyCell: {
      textAlign: "right",
      paddingRight: 2,
    },
    quoteHeaderBanner: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.grayLight,
    },
    quoteHeaderTitle: {
      fontSize: templateSettings.fontSize.body + 1,
      fontWeight: "bold",
      color: colors.black,
      fontFamily: pdfFontFamily,
    },
    infoRow: {
      flexDirection: "row",
      marginBottom: 3,
      fontSize: templateSettings.fontSize.body,
      fontFamily: pdfFontFamily,
    },
  });
};

interface FixedHeaderProps {
  logoBase64?: string;
  buyerData: any;
  selectedVendor: any;
  rfpUniqueId?: string;
  templateSettings: TemplateSettings;
  styles: any;
}

const FixedHeader = ({
  logoBase64,
  buyerData,
  selectedVendor,
  rfpUniqueId,
  templateSettings,
  styles,
}: FixedHeaderProps) => {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <View fixed style={styles.fixedHeader}>
      <View style={styles.decorativeHeader} />
      <View style={styles.mainHeader}>
        <View style={styles.headerLogoSection}>
          {logoBase64 ? (
            <Image src={logoBase64} style={styles.companyLogo} />
          ) : (
            <View style={[styles.companyLogo, { backgroundColor: "#ccc" }]}>
              <Text>No Logo</Text>
            </View>
          )}
          <View style={styles.headerTextSection}>
            {templateSettings.showCompanyName && (
              <Text style={styles.companyHeader}>
                {buyerData?.requirement?.company ||
                  selectedVendor?.companydetails?.companyName ||
                  "Company Name"}
              </Text>
            )}
            {templateSettings.showDocumentTitle && (
              <Text style={styles.documentTitle}>
                {buyerData?.requirement?.projectName || "RFQ Document"}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.headerMetadata}>
          <Text style={styles.metadataText}>
            RFQ ID: {rfpUniqueId || "N/A"}
          </Text>
          <Text style={styles.metadataText}>
            VENDOR ID: {selectedVendor?.vendorResponseId || "N/A"}
          </Text>
          <Text style={styles.metadataText}>Generated on {today}</Text>
        </View>
      </View>
    </View>
  );
};

const Footer = ({
  buyerData,
  templateSettings,
  styles,
}: {
  buyerData: any;
  rfpUniqueId?: string;
  templateSettings: TemplateSettings;
  styles: any;
}) => {
  if (!templateSettings.showFooterContact) {
    return null;
  }

  return (
    <View style={styles.letterheadFooter} fixed>
      <View style={styles.footerContactContainer}>
        <View style={styles.footerItem}>
          <Text style={styles.footerText}>
            {buyerData?.contact?.contactPhone || "Phone"}
          </Text>
        </View>

        {templateSettings.footerLayout === "multi-line" ? (
          <>
            <View style={styles.footerItem}>
              <Text style={styles.footerText}>
                {[
                  buyerData?.contact?.contactAddressLine1,
                  buyerData?.contact?.contactAddressLine2,
                  buyerData?.contact?.contactCity,
                  buyerData?.contact?.contactState,
                  buyerData?.contact?.contactPostalCode,
                  buyerData?.contact?.contactCountry,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={styles.footerText}>
                {buyerData?.contact?.contactEmail}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.footerItem}>
              <Text style={styles.footerText}>
                {[
                  buyerData?.contact?.contactAddressLine1,
                  buyerData?.contact?.contactAddressLine2,
                  buyerData?.contact?.contactCity,
                  buyerData?.contact?.contactState,
                  buyerData?.contact?.contactPostalCode,
                  buyerData?.contact?.contactCountry,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={styles.footerText}>
                {buyerData?.contact?.contactEmail}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const renderSection = (
  sectionKey: keyof TemplateSettings["includeSections"],
  title: string,
  content: React.ReactNode,
  templateSettings: TemplateSettings,
  styles: any,
  sectionNumber?: number
) => {
  if (!templateSettings.includeSections[sectionKey]) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>
        {sectionNumber && `${sectionNumber}. `}
        {title}
      </Text>
      {content}
    </View>
  );
};

export const VendorResponseDocument = ({
  buyerData,
  selectedVendor,
  rfpUniqueId,
  templateSettings,
  logoBase64,
}: {
  buyerData: any;
  selectedVendor: any;
  rfpUniqueId?: string;
  templateSettings: TemplateSettings;
  logoBase64?: string;
}) => {
  const styles = createStyles(templateSettings);
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const today = `${day}-${month}-${year}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <FixedHeader
          logoBase64={logoBase64}
          buyerData={buyerData}
          selectedVendor={selectedVendor}
          rfpUniqueId={rfpUniqueId}
          templateSettings={templateSettings}
          styles={styles}
        />

        {/* Main content with top/bottom spacing */}
        <View style={styles.mainContent}>
          {/* Quote Header Banner */}
          <View style={styles.quoteHeaderBanner}>
            <Text style={styles.quoteHeaderTitle}>
              Quote against the RFQ for &quot;
              {buyerData?.requirement?.projectName ||
                "CMS : Content management Systems"}
              &quot; Date: {today}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  fontSize: templateSettings.fontSize.body,
                  fontWeight: "bold",
                  color: colors.primary,
                }}
              >
                RFQ ID :{" "}
              </Text>
              <Text style={{ fontSize: templateSettings.fontSize.body }}>
                {rfpUniqueId || "N/A"}{" "}
              </Text>
              <Text style={{ fontSize: templateSettings.fontSize.body }}>
                {" "}
                /{" "}
              </Text>
              <Text
                style={{
                  fontSize: templateSettings.fontSize.body,
                  fontWeight: "bold",
                  color: colors.primary,
                }}
              >
                VENDOR ID :{" "}
              </Text>
              <Text style={{ fontSize: templateSettings.fontSize.body }}>
                {selectedVendor?.vendorResponseId || "N/A"}
              </Text>
            </View>
          </View>

          {/* Address Cards (To / Quote by) */}
          <View style={styles.threeColumns}>
            {/* To Card */}
            <View style={[styles.card, styles.column]}>
              <Text
                style={[
                  styles.boldText,
                  { marginBottom: 6, color: colors.black },
                ]}
              >
                To:
              </Text>
              <View style={styles.infoRow}>
                <Text style={[styles.boldText, { width: "45%" }]}>
                  Buyer Name
                </Text>
                <Text style={{ width: "55%" }}>
                  {buyerData?.contact?.contactName || "Devipriya"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.boldText, { width: "45%" }]}>
                  Company Name
                </Text>
                <Text style={{ width: "55%" }}>
                  {buyerData?.company?.name || "SunNext Pvt Ltd"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.boldText, { width: "45%" }]}>Address</Text>
                <Text style={{ width: "55%" }}>
                  {[
                    buyerData?.company?.addressLine1,
                    buyerData?.company?.addressLine2,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Not provided"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.boldText, { width: "45%" }]}>
                  Location
                </Text>
                <Text style={{ width: "55%" }}>
                  {[
                    buyerData?.company?.city,
                    buyerData?.company?.state,
                    buyerData?.company?.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  {buyerData?.company?.postalCode
                    ? ` - ${buyerData.company.postalCode}`
                    : ""}
                </Text>
              </View>
            </View>

            {/* Quote by Card */}
            <View style={[styles.card, styles.column]}>
              <Text
                style={[
                  styles.boldText,
                  { marginBottom: 6, color: colors.black },
                ]}
              >
                Quote by:
              </Text>
              <View style={styles.infoRow}>
                <Text style={[styles.boldText, { width: "45%" }]}>
                  Company Name
                </Text>
                <Text style={{ width: "55%" }}>
                  {selectedVendor?.companydetails?.companyName || "N/A"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.boldText, { width: "45%" }]}>Address</Text>
                <Text style={{ width: "55%" }}>
                  {[
                    selectedVendor?.companydetails?.addressLine1,
                    selectedVendor?.companydetails?.addressLine2,
                    selectedVendor?.companydetails?.city,
                    selectedVendor?.companydetails?.state,
                    selectedVendor?.companydetails?.country,
                    selectedVendor?.companydetails?.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.boldText, { width: "45%" }]}>Phone</Text>
                <Text style={{ width: "55%" }}>
                  {selectedVendor?.companydetails?.phone || "N/A"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.boldText, { width: "45%" }]}>Email</Text>
                <Text style={{ width: "55%" }}>
                  {selectedVendor?.companydetails?.email || "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {/* 1. Company Introduction */}
          {renderSection(
            "companyIntroduction",
            "Company Introduction",
            <View style={styles.highlightBox}>
              <Text style={styles.text}>
                <Text style={[styles.boldText, { color: colors.black }]}>
                  {selectedVendor?.companydetails?.companyName || "Vendor Name"}
                </Text>{" "}
                incorporated under Indian Companies Act, having its office at{" "}
                <Text style={styles.boldText}>
                  {[
                    selectedVendor?.companydetails?.addressLine1,
                    selectedVendor?.companydetails?.addressLine2,
                    selectedVendor?.companydetails?.city,
                    selectedVendor?.companydetails?.state,
                    selectedVendor?.companydetails?.country,
                    selectedVendor?.companydetails?.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Vendor Address"}
                </Text>
                , hereinafter referred to as &quot;Company&quot; (which
                expression shall unless repugnant to the context or meaning
                thereof include its administrators and successors in interest of
                the First Part).
              </Text>
              {selectedVendor?.companydetails?.businessType && (
                <Text style={styles.text}>
                  The company is in the business of{" "}
                  <Text style={styles.boldText}>
                    {selectedVendor.companydetails.businessType}
                  </Text>
                  .
                </Text>
              )}
            </View>,
            templateSettings,
            styles,
            1
          )}

          {/* 2. Scope of Work */}
          {renderSection(
            "scopeOfWork",
            "Scope of Work",
            <View style={styles.highlightBox}>
              {/* Bullet points */}
              <View style={styles.listItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.text}>
                  Supply, Installation, testing, and commissioning of the item
                  as per the specification and scope
                </Text>
              </View>

              {(buyerData?.scope?.deliverables ?? []).flatMap(
                (deliverable: any, index: number) => {
                  const content = deliverable?.text || deliverable || "";
                  let items = [];

                  if (typeof content === "string") {
                    try {
                      items = JSON.parse(content);
                      if (!Array.isArray(items)) {
                        items = content
                          .split("\n")
                          .filter((line) => line.trim() !== "");
                      }
                    } catch (e) {
                      items = content
                        .split("\n")
                        .filter((line) => line.trim() !== "");
                    }
                  } else if (Array.isArray(content)) {
                    items = content;
                  } else {
                    items = [content];
                  }

                  return items.map((item: any, itemIndex: number) => (
                    <View style={styles.listItem} key={`${index}-${itemIndex}`}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.text}>{item}</Text>
                    </View>
                  ));
                }
              )}

              {/* Agreement Status */}
              {selectedVendor?.revisionData?.scopeOfWork?.agreement && (
                <View
                  style={[
                    styles.agreementBadge,
                    {
                      backgroundColor:
                        selectedVendor?.revisionData?.scopeOfWork?.agreement ===
                        "agree"
                          ? "#D1FAE5"
                          : "#FEE2E2",
                      marginTop: 8,
                      alignSelf: "flex-start",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        (selectedVendor?.revisionData?.scopeOfWork?.agreement || "agree") ===
                        "agree"
                          ? "#065F46"
                          : "#991B1B",
                      fontSize: templateSettings.fontSize.body,
                      fontWeight: "600",
                    }}
                  >
                    {(selectedVendor?.revisionData?.scopeOfWork?.agreement || "agree") ===
                    "agree"
                      ? "Agreed"
                      : "Disagreed"}
                  </Text>
                </View>
              )}

              {/* Vendor Remarks */}
              {selectedVendor?.revisionData?.scopeOfWork?.remarks && (
                <View style={styles.remarksSection}>
                  <Text style={styles.remarksTitle}>Vendor Remarks:</Text>
                  <View style={styles.remarksContent}>
                    <Text style={{ fontSize: templateSettings.fontSize.body }}>
                      {selectedVendor?.revisionData?.scopeOfWork.remarks}
                    </Text>
                  </View>
                </View>
              )}
            </View>,
            templateSettings,
            styles,
            2
          )}

          {/* 3. Bill of Quantities */}
          {renderSection(
            "billOfQuantities",
            "Bill of Quantities",
            <View style={styles.table}>
              {/* Table Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { width: "16%" }]}>
                  Description
                </Text>
                <Text style={[styles.tableCell, { width: "8%" }]}>Qty</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>
                  Target Price
                </Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>
                  Your Quote
                </Text>
                <Text style={[styles.tableCell, { width: "8%" }]}>GST %</Text>
                <Text style={[styles.tableCell, { width: "12%" }]}>
                  Item Total (Incl. GST)
                </Text>
                <Text style={[styles.tableCell, { width: "13%" }]}>
                  Details
                </Text>
                <Text style={[styles.tableCell, { width: "8%" }]}>
                  Compliance
                </Text>
                <Text style={[styles.tableCell, { width: "13%" }]}>
                  Deviation/Remarks
                </Text>
                <Text
                  style={[styles.tableCell, styles.lastCell, { width: "8%" }]}
                >
                  Remarks
                </Text>
              </View>

              {/* Table Rows */}
              {(buyerData?.boq || []).map((item: any, index: number) => {
                const vendorItem =
                  selectedVendor?.revisionData?.boqDetails?.[index] || {};
                const qty = parseFloat(item.qty || 0);
                const quotePrice = parseFloat(vendorItem.quotePrice || 0);
                const gst = parseFloat(vendorItem.gst || 0);
                const itemTotal = qty * quotePrice * (1 + gst / 100);

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.tableRow,
                      index % 2 === 0
                        ? { backgroundColor: "#ffffff" }
                        : { backgroundColor: "#f8f9fa" },
                    ]}
                  >
                    {/* Description */}
                    <Text style={[styles.tableCell, { width: "16%" }]}>
                      <Text style={styles.boldText}>{item.description}</Text>
                      {"\n"}
                      <Text
                        style={{
                          fontSize: templateSettings.fontSize.body,
                          color: "#666",
                        }}
                      >
                        {item.specification}
                      </Text>
                    </Text>

                    {/* Qty */}
                    <Text style={[styles.tableCell, { width: "8%" }]}>
                      {item.qty}
                      <Text
                        style={{
                          fontSize: templateSettings.fontSize.body,
                          color: "#666",
                        }}
                      >
                        {item.uom || "Nos"}
                      </Text>
                    </Text>

                    {/* Target Price */}
                    <Text style={[styles.tableCell, { width: "10%" }]}>
                      {item.targetPrice}
                    </Text>

                    {/* Your Quote */}
                    <Text style={[styles.tableCell, { width: "10%" }]}>
                      {vendorItem.quotePrice ? `${vendorItem.quotePrice}` : "-"}
                    </Text>

                    {/* GST */}
                    <Text style={[styles.tableCell, { width: "8%" }]}>
                      {vendorItem.gst ? `${vendorItem.gst}%` : "-"}
                    </Text>

                    {/* Item Total */}
                    <Text style={[styles.tableCell, { width: "12%" }]}>
                      {vendorItem.quotePrice ? `${itemTotal.toFixed(2)}` : "-"}
                    </Text>

                    {/* Details */}
                    <Text style={[styles.tableCell, { width: "13%" }]}>
                      {[vendorItem.make, vendorItem.model]
                        .filter(Boolean)
                        .join("\n")}
                    </Text>

                    {/* Compliance */}
                    <Text style={[styles.tableCell, { width: "8%" }]}>
                      {vendorItem.compliance || "-"}
                    </Text>

                    {/* Deviation/Remarks */}
                    <Text style={[styles.tableCell, { width: "13%" }]}>
                      {vendorItem.remarks || "-"}
                    </Text>

                    {/* Remarks */}
                    <Text
                      style={[
                        styles.tableCell,
                        styles.lastCell,
                        { width: "8%" },
                      ]}
                    >
                      {item.remarks || "-"}
                    </Text>
                  </View>
                );
              })}

              {/* Grand Total Row */}
              {buyerData?.boq?.length > 0 && (
                <View style={[styles.tableRow, { backgroundColor: "#e0e0e0" }]}>
                  {/* Match exact header structure */}
                  <Text
                    style={[
                      styles.tableCell,
                      { width: "16%" },
                      styles.boldText,
                    ]}
                  >
                    Grand Total
                  </Text>
                  <Text style={[styles.tableCell, { width: "8%" }]}></Text>
                  <Text style={[styles.tableCell, { width: "10%" }]}></Text>
                  <Text style={[styles.tableCell, { width: "10%" }]}></Text>
                  <Text style={[styles.tableCell, { width: "8%" }]}></Text>

                  {/* Total Amount */}
                  <Text
                    style={[
                      styles.tableCell,
                      { width: "12%" },
                      styles.boldText,
                    ]}
                  >
                    {(buyerData.boq || [])
                      .reduce((total: number, item: any, index: number) => {
                        const vendorItem =
                          selectedVendor?.revisionData?.boqDetails?.[index] ||
                          {};
                        const qty = parseFloat(item.qty || 0);
                        const quotePrice = parseFloat(
                          vendorItem.quotePrice || 0
                        );
                        const gst = parseFloat(vendorItem.gst || 0);
                        return total + qty * quotePrice * (1 + gst / 100);
                      }, 0)
                      .toFixed(2)}
                  </Text>

                  {/* Empty cells to maintain structure */}
                  <Text style={[styles.tableCell, { width: "13%" }]}></Text>
                  <Text style={[styles.tableCell, { width: "8%" }]}></Text>
                  <Text style={[styles.tableCell, { width: "13%" }]}></Text>
                  <Text
                    style={[styles.tableCell, styles.lastCell, { width: "8%" }]}
                  ></Text>
                </View>
              )}
            </View>,
            templateSettings,
            styles,
            4
          )}

          {/* 4. Evaluation Criteria */}
          {renderSection(
            "evaluationCriteria",
            "Evaluation Criteria",
            <View style={styles.highlightBox}>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, { width: "60%" }]}>
                    Criteria
                  </Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>
                    Compliance
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.lastCell,
                      { width: "20%" },
                    ]}
                  >
                    Remark
                  </Text>
                </View>

                {/* Table Rows */}
                {(buyerData?.evaluation || []).map(
                  (criterion: string, index: number) => {
                    const vendorResponse =
                      selectedVendor?.revisionData?.evaluationCriteria?.[index]
                        ?.value || "No";
                    const vendorRemark =
                      selectedVendor?.revisionData?.evaluationCriteria?.[index]
                        ?.remarks || "-";

                    return (
                      <View
                        key={index}
                        style={[
                          styles.tableRow,
                          index % 2 === 0
                            ? { backgroundColor: "#ffffff" }
                            : { backgroundColor: "#F9FAFB" },
                        ]}
                      >
                        <Text style={[styles.tableCell, { width: "60%" }]}>
                          {criterion}
                        </Text>

                        <Text style={[styles.tableCell, { width: "20%" }]}>
                          <Text
                            style={{
                              color:
                                vendorResponse.toLowerCase() === "yes"
                                  ? colors.success
                                  : colors.danger,
                              fontWeight: "bold",
                            }}
                          >
                            {vendorResponse}
                          </Text>
                        </Text>

                        <Text
                          style={[
                            styles.tableCell,
                            styles.lastCell,
                            { width: "20%" },
                          ]}
                        >
                          {vendorRemark}
                        </Text>
                      </View>
                    );
                  }
                )}
              </View>

              {/* Fallback for empty evaluation criteria */}
              {(!buyerData?.evaluation ||
                buyerData?.evaluation?.length === 0) && (
                <Text style={styles.text}>
                  No evaluation criteria specified
                </Text>
              )}
            </View>,
            templateSettings,
            styles,
            5
          )}

          {/* 5. Financial Information */}
          {renderSection(
            "financialInformation",
            "Financial Information",
            <>
              {/* Cost Model + Currency */}
              <View style={styles.threeColumns}>
                {/* Cost Model Card */}
                <View style={[styles.card, styles.column]}>
                  <Text style={styles.cardTitle}>Cost Model</Text>
                  <Text style={styles.cardContent}>
                    {buyerData?.financials?.budgetType === "mrp"
                      ? "Discount on MRP"
                      : buyerData?.financials?.budgetType === "rateCard"
                        ? "Discount on Rate Card"
                        : buyerData?.financials?.budgetType === "srp"
                          ? "Discount on SRP"
                          : buyerData?.financials?.budgetType === "fee"
                            ? "Time & Materials"
                            : buyerData?.financials?.budgetType === "cost"
                              ? "Cost Plus Fee"
                              : buyerData?.financials?.budgetType ===
                                  "unspecified"
                                ? "Unspecified"
                                : buyerData?.financials?.budgetType ||
                                  "Not specified"}
                  </Text>
                </View>

                {/* Currency Card */}
                <View style={[styles.card, styles.column]}>
                  <Text style={styles.cardTitle}>Currency</Text>
                  <Text style={styles.cardContent}>
                    {buyerData?.financials?.currency || "Not specified"}
                  </Text>
                </View>
              </View>

              {/* Payment Terms and PBG Amount in a two-column layout */}
              <View style={styles.threeColumns}>
                {/* Payment Terms Card */}
                <View style={[styles.card, styles.column]}>
                  <Text style={styles.cardTitle}>Payment Terms</Text>
                  <Text style={styles.cardContent}>
                    {buyerData?.financials?.paymentTerm || "Not specified"}
                  </Text>
                  {selectedVendor?.revisionData?.financialTerms
                    ?.paymentTermsAgreement && (
                    <View
                      style={[
                        styles.agreementBadge,
                        {
                          backgroundColor:
                            (selectedVendor.revisionData.financialTerms
                              .paymentTermsAgreement || "agree") === "agree"
                              ? "#D1FAE5"
                              : "#FEE2E2",
                          marginTop: 8,
                          alignSelf: "flex-start",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            (selectedVendor.revisionData.financialTerms
                              .paymentTermsAgreement || "agree") === "agree"
                              ? "#065F46"
                              : "#991B1B",
                          fontSize: templateSettings.fontSize.body,
                          fontWeight: "600",
                        }}
                      >
                        {(selectedVendor.revisionData.financialTerms
                          .paymentTermsAgreement || "agree") === "agree"
                          ? "Agreed"
                          : "Disagreed"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* PBG Amount Card */}
                <View style={[styles.card, styles.column]}>
                  <Text style={styles.cardTitle}>PBG Amount</Text>
                  <Text style={styles.cardContent}>
                    {buyerData?.financials?.pbgAmount || "Not specified"}
                  </Text>
                  {selectedVendor?.revisionData?.financialTerms
                    ?.pbgAmountAgreement && (
                    <View
                      style={[
                        styles.agreementBadge,
                        {
                          backgroundColor:
                            (selectedVendor.revisionData.financialTerms
                              .pbgAmountAgreement || "agree") === "agree"
                              ? "#D1FAE5"
                              : "#FEE2E2",
                          marginTop: 8,
                          alignSelf: "flex-start",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            (selectedVendor.revisionData.financialTerms
                              .pbgAmountAgreement || "agree") === "agree"
                              ? "#065F46"
                              : "#991B1B",
                          fontSize: templateSettings.fontSize.body,
                          fontWeight: "600",
                        }}
                      >
                        {(selectedVendor.revisionData.financialTerms
                          .pbgAmountAgreement || "agree") === "agree"
                          ? "Agreed"
                          : "Disagreed"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Payment Terms Remarks */}
              {selectedVendor?.revisionData?.financialTerms
                ?.paymentTermsRemarks && (
                <View style={styles.extraCard}>
                  <Text style={styles.extraTitle}>
                    Vendor Payment Terms Remarks
                  </Text>
                  <Text style={styles.extraContent}>
                    {
                      selectedVendor.revisionData.financialTerms
                        .paymentTermsRemarks
                    }
                  </Text>
                </View>
              )}

              {/* PBG Amount Remarks */}
              {selectedVendor?.revisionData?.financialTerms
                ?.pbgAmountRemarks && (
                <View style={styles.extraCard}>
                  <Text style={styles.extraTitle}>Vendor PBG Remarks</Text>
                  <Text style={styles.extraContent}>
                    {
                      selectedVendor.revisionData.financialTerms
                        .pbgAmountRemarks
                    }
                  </Text>
                </View>
              )}

              {/* PBG Notes from Buyer */}
              {buyerData?.financials?.pbgNotes && (
                <View style={styles.extraCard}>
                  <Text style={styles.extraTitle}>PBG Notes</Text>
                  <Text style={styles.extraContent}>
                    {buyerData.financials.pbgNotes}
                  </Text>
                  {selectedVendor?.revisionData?.financialTerms
                    ?.pbgNotesAgreement && (
                    <View
                      style={[
                        styles.agreementBadge,
                        {
                          backgroundColor:
                            (selectedVendor.revisionData.financialTerms
                              .pbgNotesAgreement || "agree") === "agree"
                              ? "#D1FAE5"
                              : "#FEE2E2",
                          marginTop: 8,
                          alignSelf: "flex-start",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            (selectedVendor.revisionData.financialTerms
                              .pbgNotesAgreement || "agree") === "agree"
                              ? "#065F46"
                              : "#991B1B",
                          fontSize: templateSettings.fontSize.body,
                          fontWeight: "600",
                        }}
                      >
                        {(selectedVendor.revisionData.financialTerms
                          .pbgNotesAgreement || "agree") === "agree"
                          ? "Agreed"
                          : "Disagreed"}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* PBG Notes Remarks */}
              {selectedVendor?.revisionData?.financialTerms
                ?.pbgNotesRemarks && (
                <View style={styles.extraCard}>
                  <Text style={styles.extraTitle}>
                    Vendor PBG Notes Remarks
                  </Text>
                  <Text style={styles.extraContent}>
                    {selectedVendor.revisionData.financialTerms.pbgNotesRemarks}
                  </Text>
                </View>
              )}

              {/* Buyer Financial Notes */}
              {buyerData?.financials?.financialNotes && (
                <View style={styles.extraCard}>
                  <Text style={styles.extraTitle}>Buyer Financial Notes</Text>
                  <Text style={styles.extraContent}>
                    {buyerData.financials.financialNotes}
                  </Text>
                  {selectedVendor?.revisionData?.financialTerms
                    ?.financialNotesAgreement && (
                    <View
                      style={[
                        styles.agreementBadge,
                        {
                          backgroundColor:
                            (selectedVendor.revisionData.financialTerms
                              .financialNotesAgreement || "agree") === "agree"
                              ? "#D1FAE5"
                              : "#FEE2E2",
                          marginTop: 8,
                          alignSelf: "flex-start",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            (selectedVendor.revisionData.financialTerms
                              .financialNotesAgreement || "agree") === "agree"
                              ? "#065F46"
                              : "#991B1B",
                          fontSize: templateSettings.fontSize.body,
                          fontWeight: "600",
                        }}
                      >
                        {(selectedVendor.revisionData.financialTerms
                          .financialNotesAgreement || "agree") === "agree"
                          ? "Agreed"
                          : "Disagreed"}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Financial Notes Remarks */}
              {selectedVendor?.revisionData?.financialTerms
                ?.financialNotesRemarks && (
                <View style={styles.extraCard}>
                  <Text style={styles.extraTitle}>
                    Vendor Financial Notes Remarks
                  </Text>
                  <Text style={styles.extraContent}>
                    {
                      selectedVendor.revisionData.financialTerms
                        .financialNotesRemarks
                    }
                  </Text>
                </View>
              )}

              {/* General Financial Remarks */}
              {selectedVendor?.revisionData?.financialTerms?.remarks && (
                <View style={styles.extraCard}>
                  <Text style={styles.extraTitle}>
                    Vendor Additional Remarks
                  </Text>
                  <Text style={styles.extraContent}>
                    {selectedVendor.revisionData.financialTerms.remarks}
                  </Text>
                </View>
              )}
            </>,
            templateSettings,
            styles,
            6
          )}

          {/* 6. Commercial Terms */}
          {renderSection(
            "generalTerms",
            "General Terms",
            <View style={styles.deliverySection}>
              <Text
                style={[
                  styles.sectionHeader,
                  {
                    backgroundColor: "transparent",
                    padding: 0,
                    marginBottom: 8,
                    fontSize: templateSettings.fontSize.body,
                  },
                ]}
              >
                Delivery Terms
              </Text>
              <View style={styles.deliveryRow}>
                <View style={styles.deliveryColumn}>
                  <Text style={styles.deliveryLabel}>
                    RFQ Required Delivery Time
                  </Text>
                  <Text style={styles.deliveryValue}>
                    {buyerData.generalTerms.deliveryTimeValue}{" "}
                    {buyerData.generalTerms.deliveryTimeUnit}
                  </Text>
                </View>

                <View style={styles.deliveryColumn}>
                  <Text style={styles.deliveryLabel}>
                    Vendor Proposed Delivery Time
                  </Text>
                  <Text style={styles.deliveryValue}>
                    {
                      selectedVendor?.revisionData?.generalTerms
                        ?.deliveryTimeValue
                    }
                    <Text style={{ color: "#4B5563", fontWeight: 500 }}>
                      {" "}{buyerData.generalTerms.deliveryTimeUnit}
                    </Text>
                  </Text>
                </View>
              </View>
              <View style={styles.deliveryRow}>
                <View style={styles.deliveryColumn}>
                  <Text style={styles.deliveryLabel}> Delivery Location</Text>
                  <Text style={styles.deliveryValue}>
                    {buyerData.generalTerms.deliveryLocations.join(", ")}
                  </Text>
                </View>

                <View style={styles.deliveryColumn}>
                  <Text style={styles.deliveryLabel}>
                    Vendor Dispatch Location
                  </Text>
                  <Text style={styles.deliveryValue}>
                    {(() => {
                      const dl = selectedVendor?.revisionData?.generalTerms?.dispatchLocation;
                      if (!dl) return "Not specified";
                      if (typeof dl === "string") return dl;
                      return dl.name || dl.state || "Not specified";
                    })()}
                  </Text>
                </View>
              </View>

              {/* Agreement Status for Commercial Terms */}
              <View style={styles.remarksSection}>
                <Text style={styles.remarksTitle}>General terms</Text>
                {buyerData?.generalTerms?.selectedTerms
                  ?.filter((line: string) => line.trim() !== "")
                  ?.map((term: string, index: number) => (
                    <View style={styles.listItem} key={index}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.text}>{term.trim()}</Text>
                    </View>
                  ))}
              </View>

              {/* Agreement Status */}
              {selectedVendor?.revisionData?.generalTerms?.agreement && (
                <View
                  style={[
                    styles.agreementBadge,
                    {
                      backgroundColor:
                        (selectedVendor?.revisionData?.generalTerms
                          ?.agreement || "agree") === "agree"
                          ? "#D1FAE5"
                          : "#FEE2E2",
                      marginTop: 8,
                      alignSelf: "flex-start",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        (selectedVendor?.revisionData?.generalTerms
                          ?.agreement || "agree") === "agree"
                          ? "#065F46"
                          : "#991B1B",
                      fontSize: templateSettings.fontSize.body,
                      fontWeight: "600",
                    }}
                  >
                    {(selectedVendor?.revisionData?.generalTerms?.agreement || "agree") ===
                    "agree"
                      ? "Agreed"
                      : "Disagreed"}
                  </Text>
                </View>
              )}

              {/* Vendor Commercial Remarks */}
              {selectedVendor?.revisionData?.generalTerms?.remarks && (
                <View style={styles.remarksSection}>
                  <Text style={styles.remarksTitle}>Vendor Remarks</Text>
                  <View style={styles.remarksContent}>
                    <Text style={{ fontSize: templateSettings.fontSize.body }}>
                      {selectedVendor?.revisionData?.generalTerms.remarks}
                    </Text>
                  </View>
                </View>
              )}
            </View>,
            templateSettings,
            styles,
            7
          )}

          {/* Additional Commercial Notes */}
          {buyerData?.generalTerms?.notes && (
            <View style={styles.extraCard}>
              <Text style={styles.extraTitle}>Additional Commercial Notes</Text>
              <Text style={styles.extraContent}>
                {buyerData.generalTerms.notes}
              </Text>
            </View>
          )}

          {/* 7. Technical Specifications */}
          {renderSection(
            "specialTerms",
            "Special Terms and Conditions",
            <View style={styles.remarksSection}>
              {buyerData?.specialTerms?.selectedTerms
                ?.filter((line: string) => line.trim() !== "")
                ?.map((term: string, index: number) => (
                  <View style={styles.listItem} key={index}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.text}>{term.trim()}</Text>
                  </View>
                ))}

              {/* Agreement Status */}
              {selectedVendor?.revisionData?.specialTerms?.agreement && (
                <View
                  style={[
                    styles.agreementBadge,
                    {
                      backgroundColor:
                        (selectedVendor?.revisionData?.specialTerms
                          ?.agreement || "agree") === "agree"
                          ? "#D1FAE5"
                          : "#FEE2E2",
                      marginTop: 8,
                      alignSelf: "flex-start",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        (selectedVendor?.revisionData?.specialTerms
                          ?.agreement || "agree") === "agree"
                          ? "#065F46"
                          : "#991B1B",
                      fontSize: templateSettings.fontSize.body,
                      fontWeight: "600",
                    }}
                  >
                    {(selectedVendor?.revisionData?.specialTerms?.agreement || "agree") ===
                    "agree"
                      ? "Agreed"
                      : "Disagreed"}
                  </Text>
                </View>
              )}

              {/* Vendor Remarks */}
              {selectedVendor?.revisionData?.specialTerms?.remarks && (
                <View style={styles.remarksSection}>
                  <Text style={styles.remarksTitle}>Vendor Remarks</Text>
                  <View style={styles.remarksContent}>
                    <Text style={{ fontSize: templateSettings.fontSize.body }}>
                      {selectedVendor?.revisionData?.specialTerms.remarks}
                    </Text>
                  </View>
                </View>
              )}
            </View>,
            templateSettings,
            styles,
            7
          )}

          {/* 8. Other Information */}
          {renderSection(
            "vendorSelection",
            "Other Information",
            <View style={styles.remarksSection}>
              <Text style={styles.remarksTitle}>Notes to Buyer</Text>
              <View style={styles.remarksContent}>
                <Text style={{ fontSize: templateSettings.fontSize.body }}>
                  {selectedVendor?.revisionData?.buyerNotes?.remarks ||
                    "No additional notes"}
                </Text>
              </View>
            </View>,
            templateSettings,
            styles,
            8
          )}

          {/* 9. Attachments */}
          {renderSection(
            "documentsToShare",
            "Attachments",
            <View style={styles.attachmentsContainer}>
              {/* Header Row */}
              <View style={styles.attachmentHeaderRow}>
                <Text style={[styles.attachmentCell, styles.documentNameCell]}>
                  Document
                </Text>
                <Text style={[styles.attachmentCell, styles.statusCell]}>
                  Status
                </Text>
              </View>

              {/* Attachment Rows */}
              {buyerData?.documentsToShare?.documentsToShare ? (
                buyerData.documentsToShare.documentsToShare
                  .split(",")
                  .map((doc: string, index: number) => {
                    const documentType = doc.trim();
                    const matchingAttachment =
                      selectedVendor?.revisionData?.attachments?.find(
                        (a: { documentName: string }) =>
                          a.documentName === documentType
                      );

                    const isProvided = !!matchingAttachment;

                    return (
                      <View
                        key={`requested-${index}`}
                        style={[styles.attachmentRow]}
                      >
                        <Text
                          style={[
                            styles.attachmentCell,
                            styles.documentNameCell,
                          ]}
                        >
                          {documentType}
                        </Text>

                        <View
                          style={[styles.attachmentCell, styles.statusCell]}
                        >
                          <Text
                            style={
                              isProvided
                                ? styles.providedStatus
                                : styles.missingStatus
                            }
                          >
                            {isProvided ? "✓ Provided" : "✗ Missing"}
                          </Text>
                        </View>
                      </View>
                    );
                  })
              ) : (
                <View style={styles.attachmentRow}>
                  <Text
                    style={[
                      styles.attachmentCell,
                      { flex: 1, textAlign: "center" },
                    ]}
                  >
                    No documents requested by buyer
                  </Text>
                </View>
              )}

              {/* Additional Attachments */}
              {(() => {
                const requestedDocs = buyerData?.documentsToShare?.documentsToShare
                  ? buyerData.documentsToShare.documentsToShare.split(",").map((d: string) => d.trim())
                  : [];
                const allAttachments = selectedVendor?.revisionData?.attachments || [];
                const additionalAttachments = allAttachments.filter(
                  (a: any) => !a.documentName || !requestedDocs.includes(a.documentName)
                );

                if (additionalAttachments.length === 0) return null;

                return (
                  <View>
                    <View style={[styles.attachmentHeaderRow, { marginTop: 10 }]}>
                      <Text style={[styles.attachmentCell, styles.documentNameCell]}>
                        Additional Document
                      </Text>
                      <Text style={[styles.attachmentCell, styles.statusCell]}>
                        Status
                      </Text>
                    </View>
                    {additionalAttachments.map((att: any, idx: number) => (
                      <View key={`additional-${idx}`} style={[styles.attachmentRow]}>
                        <Text style={[styles.attachmentCell, styles.documentNameCell]}>
                          {att.documentName || att.name || `Additional File ${idx + 1}`}
                        </Text>
                        <View style={[styles.attachmentCell, styles.statusCell]}>
                          <Text style={styles.providedStatus}>
                            ✓ Provided
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })()}
            </View>,
            templateSettings,
            styles,
            9
          )}

          {/* 10. Contact */}
          {renderSection(
            "contactInformation",
            "Buyer Contact",
            <View style={styles.highlightBox}>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Name: </Text>
                {buyerData?.contact?.contactName || "Buyer Name"}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Email: </Text>
                {buyerData?.contact?.contactEmail || "Buyer Email"}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Phone: </Text>
                {buyerData?.contact?.contactPhone || "Buyer Phone"}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Address: </Text>
                {[
                  buyerData?.contact?.contactAddressLine1,
                  buyerData?.contact?.contactAddressLine2,
                  buyerData?.contact?.contactCity,
                  buyerData?.contact?.contactState,
                  buyerData?.contact?.contactCountry,
                  buyerData?.contact?.contactPostalCode,
                ]
                  .filter(Boolean)
                  .join(", ") || "Buyer Address"}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Department: </Text>
                {buyerData?.contact?.contactDepartment || "Buyer Department"}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Title: </Text>
                {buyerData?.contact?.contactTitle || "Buyer Title"}
              </Text>
            </View>,
            templateSettings,
            styles,
            10
          )}

          {/* RFP Timeline */}
          {renderSection(
            "rfpTimeline",
            "RFQ Timeline",
            <View style={styles.highlightBox}>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Start Date: </Text>
                {buyerData?.rfpDates?.startDate || "2025-04-21"}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.boldText}>End Date: </Text>
                {buyerData?.rfpDates?.endDate || "2025-04-30"}
              </Text>
            </View>,
            templateSettings,
            styles,
            11
          )}
        </View>

        <Footer
          buyerData={buyerData}
          rfpUniqueId={rfpUniqueId}
          templateSettings={templateSettings}
          styles={styles}
        />

        {templateSettings.showPageNumbers && (
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
            fixed
          />
        )}
      </Page>
    </Document>
  );
};
