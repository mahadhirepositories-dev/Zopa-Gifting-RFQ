import React from "react";
import { Section, Text, Preview, Button, Hr } from "@react-email/components";
import EmailLayout from "../components/EmailLayout";
import { emailStyles } from "../styles/email";

interface ApprovalRequestEmailProps {
  projectName?: string;
  rfqId: string;
  approvalUrl: string;
  buyerComments?: string;
  recommendedVendors?: Array<{ companyName: string; vendorResponseId?: string }>;
  approvalLevel?: string;
}

export default function ApprovalRequestEmail({
  projectName = "Gifting Project",
  rfqId,
  approvalUrl,
  buyerComments,
  recommendedVendors = [],
  approvalLevel = "Level 1",
}: ApprovalRequestEmailProps) {
  return (
    <EmailLayout>
      <Preview>Approval Required: RFQ Recommendations for {projectName}</Preview>
      <Section style={emailStyles.content}>
        <Text style={emailStyles.heading}>RFQ Approval Request ({approvalLevel})</Text>
        <Text style={emailStyles.paragraph}>Dear Approver,</Text>
        <Text style={emailStyles.paragraph}>
          You have received a new vendor recommendation approval request for RFQ:{" "}
          <strong>{projectName}</strong> (ID: {rfqId}).
        </Text>

        {recommendedVendors.length > 0 && (
          <Section style={{ margin: "16px 0", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "6px" }}>
            <Text style={{ ...emailStyles.paragraph, margin: 0, fontWeight: "bold" }}>
              Recommended Vendor(s):
            </Text>
            {recommendedVendors.map((v, i) => (
              <Text key={i} style={{ ...emailStyles.paragraph, margin: "4px 0 0 0", color: "#2563eb" }}>
                • {v.companyName} {v.vendorResponseId ? `(${v.vendorResponseId})` : ""}
              </Text>
            ))}
          </Section>
        )}

        {buyerComments && (
          <Section style={{ margin: "16px 0", padding: "12px", backgroundColor: "#eff6ff", borderRadius: "6px" }}>
            <Text style={{ ...emailStyles.paragraph, margin: 0, fontWeight: "bold" }}>
              Buyer Comments / Justification:
            </Text>
            <Text style={{ ...emailStyles.paragraph, margin: "4px 0 0 0", fontStyle: "italic" }}>
              "{buyerComments}"
            </Text>
          </Section>
        )}

        <Text style={emailStyles.paragraph}>
          Please click the button below to review the complete RFQ details, vendor responses, and submit your approval:
        </Text>

        <Button href={approvalUrl} style={{ ...emailStyles.button, backgroundColor: "#16a34a" }}>
          Review & Approve RFQ
        </Button>

        <Text style={{ ...emailStyles.paragraph, fontSize: "12px", color: "#64748b", marginTop: "16px" }}>
          Link: <a href={approvalUrl} style={{ color: "#2563eb" }}>{approvalUrl}</a>
        </Text>
      </Section>
      <Hr style={emailStyles.hr} />
      <Text style={emailStyles.footer}>
        This is an automated request from ZOPA Gifting RFQ Portal. Please do not reply directly.
      </Text>
    </EmailLayout>
  );
}
