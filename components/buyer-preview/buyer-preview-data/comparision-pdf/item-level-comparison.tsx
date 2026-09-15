/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";

const itemLevelStyles = StyleSheet.create({
  section: {
    marginBottom: 15,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1f2937",
  },
  tableContainer: {
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#374151",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    minHeight: 35,
  },
  tableHeaderRow: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  descriptionCell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    justifyContent: "center",
    textAlign: "left",
    flexWrap: "wrap",
  },
  specCell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    justifyContent: "center",
    textAlign: "left",
    flexWrap: "wrap",
  },
  tableCell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    flexWrap: "wrap",
  },
  lopCell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    flexWrap: "wrap",
  },
  vendorCell: {
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    flexWrap: "wrap",
    overflow: "hidden",
  },
  totalRow: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
    minHeight: 60,
  },
  priceText: {
    fontSize: 8,
    marginBottom: 1,
    flexWrap: "wrap",
    textAlign: "center",
  },
  gstText: {
    fontSize: 7,
    color: "#6b7280",
    flexWrap: "wrap",
    textAlign: "center",
  },
  totalText: {
    fontSize: 7,
    fontWeight: "bold",
    marginTop: 1,
    flexWrap: "wrap",
    textAlign: "center",
  },
  wrappableText: {
    flexWrap: "wrap",
    wordWrap: "break-word",
    textAlign: "center",
    width: "100%",
    overflow: "hidden",
  },
});

interface BoqDetail {
  quotePrice?: string | number;
  gst?: string | number;
  specification?: string;
  [key: string]: any;
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

interface ProcessedVendor {
  id: string;
  name: string;
  revisions?: any[];
  vendorResponseId?: string;
}

interface ItemLevelComparisonProps {
  buyerData: BuyerDataItem[];
  sortedVendors: ProcessedVendor[];
  allRevisionIndices: number[];
  targetPriceTotal: number;
  lopTotals: { totalInclTax: number };
  getVendorCellWidth: () => number;
  getFontSize: () => number;
  getRevisionItem: any;
}

export const ItemLevelComparison: React.FC<ItemLevelComparisonProps> = ({
  buyerData,
  sortedVendors,
  allRevisionIndices,
  targetPriceTotal,
  lopTotals,
  getRevisionItem,
}) => {
  const calculateItemTotalForDisplay = (
    item: BoqDetail | null,
    qty: string | number
  ): { lineTotalInclTax: number } | null => {
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
      lineTotalInclTax: lineTotalExclTax + gstAmount,
    };
  };

  const formatNumberForCell = (value: number, maxWidth: number): string => {
    // Return empty string for zero values
    if (value === 0) return "";
    
    const formatted = value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const estimatedWidth = formatted.length * 4;
    if (estimatedWidth > maxWidth && formatted.includes(',')) {
      return formatted.replace(/,/g, ',\n');
    }
    
    return formatted;
  };

  const getResponsiveDimensions = (vendorCount: number) => {
    const actualVendorCount = Math.min(vendorCount, 5); 
    
    let descWidth, specWidth, uomWidth, qtyWidth, targetWidth, lopWidth, vendorWidth, fontSize;

    if (actualVendorCount <= 3) {
      descWidth = 120;
      specWidth = 100;
      uomWidth = 50;
      qtyWidth = 50;
      targetWidth = 70;
      lopWidth = 70;
      vendorWidth = 80; 
      fontSize = 9;
    } else if (actualVendorCount <= 5) {
      descWidth = 100;
      specWidth = 80;
      uomWidth = 40;
      qtyWidth = 40;
      targetWidth = 60;
      lopWidth = 60;
      vendorWidth = 65;
      fontSize = 8;
    } else {
      descWidth = 80;
      specWidth = 65;
      uomWidth = 35;
      qtyWidth = 35;
      targetWidth = 50;
      lopWidth = 50;
      vendorWidth = 45;
      fontSize = 7;
    }

    return { descWidth, specWidth, uomWidth, qtyWidth, targetWidth, lopWidth, vendorWidth, fontSize };
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return "N/A";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (!buyerData || buyerData.length === 0) {
    return (
      <View style={itemLevelStyles.section}>
        <Text style={itemLevelStyles.sectionTitle}>ITEM LEVEL COMPARISON</Text>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 10, color: "#6b7280", textAlign: "center" }}>
            No BOQ details available for item-level comparison
          </Text>
        </View>
      </View>
    );
  }

  const activeVendorRevisions = sortedVendors.flatMap((vendor) =>
    allRevisionIndices
      .filter(revIndex => vendor.revisions?.[revIndex]?.boqDetails?.length)
      .map(revIndex => ({ vendor, revIndex }))
  );
  const vendorChunks: Array<Array<{ vendor: ProcessedVendor; revIndex: number }>> = [];
  const chunkSize = 5;
  
  for (let i = 0; i < activeVendorRevisions.length; i += chunkSize) {
    vendorChunks.push(activeVendorRevisions.slice(i, i + chunkSize));
  }
  if (vendorChunks.length === 0) {
    vendorChunks.push([]);
  }

  const renderTable = (vendorChunk: Array<{ vendor: ProcessedVendor; revIndex: number }>, chunkIndex: number) => {
    const dimensions = getResponsiveDimensions(vendorChunk.length);
    const { descWidth, specWidth, uomWidth, qtyWidth, targetWidth, lopWidth, vendorWidth, fontSize } = dimensions;

    return (
      <View key={chunkIndex} style={itemLevelStyles.tableContainer}>
        {vendorChunks.length > 1 && (
          <Text style={itemLevelStyles.tableTitle}>
            Vendor Comparison {chunkIndex + 1} of {vendorChunks.length}
          </Text>
        )}
        
        <View style={itemLevelStyles.table}>
          {/* Header Row */}
          <View style={[itemLevelStyles.tableRow, itemLevelStyles.tableHeaderRow]}>
            <View style={[itemLevelStyles.descriptionCell, { width: descWidth }]}>
              <Text style={{ fontSize }}>Item Description</Text>
            </View>
            <View style={[itemLevelStyles.specCell, { width: specWidth }]}>
              <Text style={{ fontSize }}>Specification</Text>
            </View>
            <View style={[itemLevelStyles.tableCell, { width: uomWidth }]}>
              <Text style={{ fontSize }}>UOM</Text>
            </View>
            <View style={[itemLevelStyles.tableCell, { width: qtyWidth }]}>
              <Text style={{ fontSize }}>Qty</Text>
            </View>
            <View style={[itemLevelStyles.tableCell, { width: targetWidth }]}>
              <Text style={{ fontSize }}>Target Price</Text>
            </View>
            <View style={[itemLevelStyles.lopCell, { width: lopWidth }]}>
              <Text style={{ fontSize }}>LOP</Text>
            </View>

            {/* Vendor columns */}
            {vendorChunk.map(({ vendor, revIndex }) => {
              const maxNameLength = vendorWidth > 60 ? 12 : vendorWidth > 50 ? 10 : 8;
              const displayName = truncateText(vendor.name, maxNameLength);

              return (
                <View
                  key={`${vendor.id}-rev-${revIndex}`}
                  style={[itemLevelStyles.vendorCell, { width: vendorWidth }]}
                >
                  <Text style={{ fontSize }}>
                    {displayName} R{revIndex}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Item Rows */}
          {buyerData.map((item: BuyerDataItem, index: number) => {
            const displayQty = item.qty || 0;
            const lopPrice = parseFloat(String(item.lopPrice || 0));
            const lopGst = parseFloat(String(item.lopGst || 0));
            const quantity = typeof displayQty === "string" ? parseFloat(displayQty) : Number(displayQty);

            const lopLineTotalExclTax = lopPrice * (quantity || 0);
            const lopGstAmount = lopLineTotalExclTax * (lopGst / 100);
            const lopLineTotalInclTax = lopLineTotalExclTax + lopGstAmount;

            // Check if target price is zero or empty
            const targetPriceValue = item.targetPrice ? parseFloat(String(item.targetPrice)) : 0;
            const showTargetPrice = targetPriceValue > 0;

            return (
              <View key={index} style={itemLevelStyles.tableRow}>
                <View style={[itemLevelStyles.descriptionCell, { width: descWidth }]}>
                  <Text style={{ fontSize }}>
                    {truncateText(item.description || "", descWidth > 80 ? 20 : descWidth > 60 ? 15 : 10)}
                  </Text>
                </View>
                <View style={[itemLevelStyles.specCell, { width: specWidth }]}>
                  <Text style={{ fontSize }}>
                    {truncateText(item.specification || "", specWidth > 70 ? 15 : specWidth > 50 ? 10 : 8)}
                  </Text>
                </View>
                <View style={[itemLevelStyles.tableCell, { width: uomWidth }]}>
                  <Text style={{ fontSize }}>{item.uom || "N/A"}</Text>
                </View>
                <View style={[itemLevelStyles.tableCell, { width: qtyWidth }]}>
                  <Text style={{ fontSize }}>{displayQty}</Text>
                </View>
                <View style={[itemLevelStyles.tableCell, { width: targetWidth }]}>
                  <Text style={[{ fontSize }, itemLevelStyles.wrappableText]}>
                    {showTargetPrice
                      ? formatNumberForCell(targetPriceValue, targetWidth)
                      : "N/A"}
                  </Text>
                </View>
                <View style={[itemLevelStyles.lopCell, { width: lopWidth }]}>
                  {lopPrice > 0 ? (
                    <View style={{ width: "100%" }}>
                      <Text style={[itemLevelStyles.priceText, { fontSize: fontSize - 1 }]}>
                        {formatNumberForCell(lopPrice, lopWidth)}
                      </Text>
                      <Text style={[itemLevelStyles.gstText, { fontSize: fontSize - 2 }]}>
                        GST: {lopGst}%
                      </Text>
                      <Text style={[itemLevelStyles.totalText, { fontSize: fontSize - 2 }]}>
                        {formatNumberForCell(lopLineTotalInclTax, lopWidth)}
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize }}>N/A</Text>
                  )}
                </View>

                {/* Vendor quote data */}
                {vendorChunk.map(({ vendor, revIndex }) => {
                  const revItem = getRevisionItem(vendor, index, revIndex);
                  const revTotal = calculateItemTotalForDisplay(revItem, displayQty);

                  if (!revItem) {
                    return (
                      <View
                        key={`${vendor.id}-${index}-rev-${revIndex}`}
                        style={[itemLevelStyles.vendorCell, { width: vendorWidth }]}
                      >
                        <Text style={{ fontSize }}>N/A</Text>
                      </View>
                    );
                  }

                  return (
                    <View
                      key={`${vendor.id}-${index}-rev-${revIndex}`}
                      style={[itemLevelStyles.vendorCell, { width: vendorWidth }]}
                    >
                      <Text style={[itemLevelStyles.priceText, { fontSize: fontSize - 1 }]}>
                        {formatNumberForCell(Number(revItem.quotePrice), vendorWidth)}
                      </Text>
                      <Text style={[itemLevelStyles.gstText, { fontSize: fontSize - 2 }]}>
                        GST: {revItem.gst || 0}%
                      </Text>
                      {revTotal && (
                        <Text style={[itemLevelStyles.totalText, { fontSize: fontSize - 2 }]}>
                          {formatNumberForCell(revTotal.lineTotalInclTax, vendorWidth)}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}

          {/* Totals Row - Updated to show empty cells instead of N/A or 0.00 */}
          <View style={[itemLevelStyles.tableRow, itemLevelStyles.totalRow]}>
            <View style={[itemLevelStyles.descriptionCell, { width: descWidth }]}>
              <Text style={{ fontWeight: "bold", fontSize: fontSize + 1 }}>TOTAL</Text>
            </View>
            <View style={[itemLevelStyles.specCell, { width: specWidth }]}></View>
            <View style={[itemLevelStyles.tableCell, { width: uomWidth }]}></View>
            <View style={[itemLevelStyles.tableCell, { width: qtyWidth }]}></View>
            <View style={[itemLevelStyles.tableCell, { width: targetWidth, justifyContent: "center", alignItems: "center" }]}>
              <Text 
                style={[
                  { 
                    fontWeight: "bold", 
                    fontSize,
                    textAlign: "center",
                  },
                  itemLevelStyles.wrappableText
                ]}
              >
                {targetPriceTotal > 0 ? formatNumberForCell(targetPriceTotal, targetWidth) : ""}
              </Text>
            </View>
            <View style={[itemLevelStyles.lopCell, { width: lopWidth, justifyContent: "center", alignItems: "center" }]}>
              <Text 
                style={[
                  { 
                    fontWeight: "bold", 
                    fontSize,
                    textAlign: "center",
                  },
                  itemLevelStyles.wrappableText
                ]}
              >
                {lopTotals.totalInclTax > 0 ? formatNumberForCell(lopTotals.totalInclTax, lopWidth) : ""}
              </Text>
            </View>

            {/* Vendor totals */}
            {vendorChunk.map(({ vendor, revIndex }) => {
              const vendorTotal = buyerData.reduce(
                (sum: number, item: BuyerDataItem, itemIndex: number) => {
                  const revItem = getRevisionItem(vendor, itemIndex, revIndex);
                  const revTotal = calculateItemTotalForDisplay(revItem, item.qty || 0);
                  return sum + (revTotal?.lineTotalInclTax || 0);
                },
                0
              );

              return (
                <View
                  key={`${vendor.id}-rev-${revIndex}-total`}
                  style={[
                    itemLevelStyles.vendorCell, 
                    { 
                      width: vendorWidth,
                      paddingVertical: 2,
                      minHeight:1,
                      justifyContent: "center",
                      alignItems: "center",
                    }
                  ]}
                >
                  <Text 
                    style={[
                      { 
                        fontWeight: "bold", 
                        fontSize,
                        textAlign: "center",
                        lineHeight: 2
                      },
                      itemLevelStyles.wrappableText
                    ]}
                  >
                    {vendorTotal > 0 ? formatNumberForCell(vendorTotal, vendorWidth) : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={itemLevelStyles.section}>
      <Text style={itemLevelStyles.sectionTitle}>ITEM LEVEL COMPARISON</Text>
      {vendorChunks.map((vendorChunk, chunkIndex) => renderTable(vendorChunk, chunkIndex))}
      {/* Add a note for multiple tables */}
      {vendorChunks.length > 1 && (
        <View style={{ marginTop: 5 }}>
          <Text style={{ fontSize: 7, color: "#6b7280", fontStyle: "italic" }}>
            * Vendors split into {vendorChunks.length} tables for better readability (max 5 vendors per table)
          </Text>
        </View>
      )}
    </View>
  );
};

export default ItemLevelComparison;