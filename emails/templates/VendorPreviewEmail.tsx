import React from "react";
import { Section, Text, Preview, Button, Hr } from "@react-email/components";
import EmailLayout from "../components/EmailLayout";
import { emailStyles } from "../styles/email";

interface VendorPreviewEmailProps {
  projectName: string;
  VendorCompanyName: string;
  url: string;
}

export default function VendorPreviewEmail({
  projectName,
  VendorCompanyName,
  url,
}: VendorPreviewEmailProps) {
  return (
    <EmailLayout>
      <Preview>Your RFQ submission for {projectName} has been received</Preview>
      <Section style={emailStyles.content}>
        <Text style={emailStyles.heading}>RFQ Response Submitted</Text>
        <Text style={emailStyles.paragraph}>Dear {VendorCompanyName},</Text>
        <Text style={emailStyles.paragraph}>
          Thank you for submitting your response for the project:{" "}
          <strong>{projectName}</strong>.
        </Text>
        <Text style={emailStyles.paragraph}>
          You can review your submitted response using the link below:
        </Text>
        <Button href={url} style={emailStyles.button}>
          View Your Submission
        </Button>
      </Section>
      <Hr style={emailStyles.hr} />
      <Text style={emailStyles.footer}>
        This is a confirmation email. Please do not reply directly.
      </Text>
    </EmailLayout>
  );
}
