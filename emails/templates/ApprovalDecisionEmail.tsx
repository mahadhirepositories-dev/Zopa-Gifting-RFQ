import React from "react";
import { Section, Text, Preview, Button, Hr } from "@react-email/components";
import EmailLayout from "../components/EmailLayout";
import { emailStyles } from "../styles/email";

interface ApprovalDecisionEmailProps {
  projectName?: string;
  rfqId: string;
  status: "Approved" | "Rejected" | "Re-quote Requested" | string;
  comments?: string;
  rfqUrl: string;
}

export default function ApprovalDecisionEmail({
  projectName = "Gifting Project",
  rfqId,
  status,
  comments,
  rfqUrl,
}: ApprovalDecisionEmailProps) {
  const isApproved = status === "Approved" || status === "approved";
  const isRejected = status === "Rejected" || status === "rejected";
  const isRequote = status === "Re-quote Requested" || status === "revision_requested";

  const badgeColor = isApproved ? "#16a34a" : isRejected ? "#dc2626" : "#d97706";

  return (
    <EmailLayout>
      <Preview>RFQ Update: {projectName} is {status}</Preview>
      <Section style={emailStyles.content}>
        <Text style={emailStyles.heading}>RFQ Approval Status Update</Text>
        <Text style={emailStyles.paragraph}>Dear Buyer,</Text>
        <Text style={emailStyles.paragraph}>
          The approval status for your RFQ <strong>{projectName}</strong> (ID: {rfqId}) has been updated:
        </Text>

        <Section style={{ margin: "16px 0", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "6px", borderLeft: `4px solid ${badgeColor}` }}>
          <Text style={{ ...emailStyles.paragraph, margin: 0, fontWeight: "bold", color: badgeColor, fontSize: "16px" }}>
            Status: {status}
          </Text>
        </Section>

        {comments && (
          <Section style={{ margin: "16px 0", padding: "12px", backgroundColor: "#eff6ff", borderRadius: "6px" }}>
            <Text style={{ ...emailStyles.paragraph, margin: 0, fontWeight: "bold" }}>
              Approver Comments / Instructions:
            </Text>
            <Text style={{ ...emailStyles.paragraph, margin: "4px 0 0 0", fontStyle: "italic" }}>
              "{comments}"
            </Text>
          </Section>
        )}

        <Text style={emailStyles.paragraph}>
          {isApproved
            ? "Your RFQ recommendation has been approved. The approval flow for this RFQ is now complete."
            : isRejected
            ? "Your RFQ recommendation has been rejected by the approver. The approval flow for this RFQ is now completed."
            : "The approver has requested a re-quote/negotiation with the vendor. Please review the comments and submit a revised recommendation when ready."}
        </Text>

        <Button href={rfqUrl} style={{ ...emailStyles.button, backgroundColor: badgeColor }}>
          View RFQ Details
        </Button>
      </Section>
      <Hr style={emailStyles.hr} />
      <Text style={emailStyles.footer}>
        This is an automated notification from ZOPA Gifting RFQ Portal.
      </Text>
    </EmailLayout>
  );
}
