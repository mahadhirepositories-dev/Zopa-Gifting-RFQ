import { Section, Text, Button, Preview } from "@react-email/components";
import { EmailTemplateProps } from "@/lib/types";
import EmailLayout from "../components/EmailLayout";
import { emailStyles } from "../styles/email";

export default function RfpMagicLinkEmail({
  url,
  rfpName,
  companyName,
  expiryHours,
}: EmailTemplateProps["RfpMagicLink"]) {
  return (
    <EmailLayout>
      <Preview>Access RFQ: {rfpName}</Preview>
      <Section style={emailStyles.content}>
        <Text style={emailStyles.heading}>Access the RFQ</Text>
        <Text style={emailStyles.paragraph}>
          {companyName} has shared a Request for Proposal with you: {rfpName}
        </Text>
        <Text style={emailStyles.paragraph}>
          Click the button below to view the RFQ details. This link will expire
          in {expiryHours}.
        </Text>
        <Button href={url} style={emailStyles.button}>
          View RFQ
        </Button>
      </Section>
    </EmailLayout>
  );
}
