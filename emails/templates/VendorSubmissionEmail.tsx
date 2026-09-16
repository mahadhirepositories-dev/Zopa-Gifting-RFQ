import React from "react";
import { Section, Text, Preview, Button, Hr } from "@react-email/components";
import EmailLayout from "../components/EmailLayout";
import { emailStyles } from "../styles/email";

interface VendorSubmissionEmailProps {
  companyName: string;
  projectName: string;
  vendorEmail: string;
  url: string;
}

export default function VendorSubmissionEmail({
  companyName,
  projectName,
  vendorEmail,
  url,
}: VendorSubmissionEmailProps) {
  return (
    <EmailLayout>
      <Preview>New Vendor Submission for {projectName}</Preview>
      <Section style={emailStyles.content}>
        <Text style={emailStyles.heading}>New Vendor Submission</Text>
        <Text style={emailStyles.paragraph}>
          {companyName} has submitted their response for the project:{" "}
          <strong>{projectName}</strong>
        </Text>
        <Text style={emailStyles.paragraph}>
          <strong>Vendor Contact:</strong> {vendorEmail}
        </Text>
        <Text style={emailStyles.paragraph}>
          Review their submission at your earliest convenience.
        </Text>

        <Button href={url} style={emailStyles.button}>
          View RFQ
        </Button>
      </Section>
      <Hr style={emailStyles.hr} />
      <Text style={emailStyles.footer}>
        This is an automated notification. Please do not reply directly to this
        email.
      </Text>
    </EmailLayout>
  );
}
