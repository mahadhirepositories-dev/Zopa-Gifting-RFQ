import {
  Section,
  Text,
  Preview,
  Button,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import EmailLayout from "../components/EmailLayout";
import { emailStyles } from "../styles/email";
// import { EmailTemplateProps } from "@/lib/types";

export default function BuyerThankYouEmail({
  projectName,
  vendors,
  url,
}: {
  companyName: string;
  projectName: string;
  vendors: Array<{ email: string; companyName: string }>;
  buyerEmail: string;
  url: string;
}) {
  return (
    <EmailLayout>
      <Preview>Thank you for submitting your RFQ for {projectName}</Preview>

      <Section style={emailStyles.content}>
        <Text style={emailStyles.heading}>RFQ Submission Confirmation</Text>

        <Text style={emailStyles.paragraph}>
          Thank you for submitting your RFQ for{" "}
          <span style={emailStyles.highlight}>{projectName}</span>.
        </Text>

        <Text style={emailStyles.paragraph}>
          Your RFQ has been successfully sent to the following vendors:
        </Text>

        {/* Vendor Emails Table */}
        <Section style={emailStyles.tableContainer}>
          <Row style={emailStyles.tableHeaderRow}>
            <Column
              style={{
                ...emailStyles.tableHeaderCell,
                ...emailStyles.serialNumberCell,
              }}
            >
              S.No
            </Column>
            <Column
              style={{
                ...emailStyles.tableHeaderCell,
                ...emailStyles.companyCell,
              }}
            >
              Vendor Company
            </Column>
            <Column
              style={{
                ...emailStyles.tableHeaderCell,
                ...emailStyles.emailCell,
              }}
            >
              Vendor Email
            </Column>
          </Row>
          {vendors.map((vendor, index) => (
            <Row
              key={index}
              style={
                index % 2 === 0
                  ? emailStyles.tableRowEven
                  : emailStyles.tableRowOdd
              }
            >
              <Column
                style={{
                  ...emailStyles.tableCell,
                  ...emailStyles.serialNumberCell,
                }}
              >
                {index + 1}
              </Column>
              <Column
                style={{ ...emailStyles.tableCell, ...emailStyles.companyCell }}
              >
                {vendor.companyName}
              </Column>
              <Column
                style={{ ...emailStyles.tableCell, ...emailStyles.emailCell }}
              >
                {vendor.email}
              </Column>
            </Row>
          ))}
        </Section>

        <Text style={emailStyles.subheading}>What Next?</Text>

        <div style={emailStyles.featureItem}>
          <div style={emailStyles.featureIcon}>↔</div>
          <div>
            <div style={emailStyles.featureTitle}>Vendor Responses</div>
            <div style={emailStyles.paragraph}>
              Vendor responses will be sent to your email.
            </div>
          </div>
        </div>

        <Button href={url} style={emailStyles.button}>
          View Your RFQ
        </Button>
      </Section>
      <Hr style={emailStyles.hr} />

      <Text style={emailStyles.footer}>
        You&apos;ll receive notifications when vendors submit their responses.
      </Text>
    </EmailLayout>
  );
}
