import { Section, Text, Button, Preview } from "@react-email/components";
import EmailLayout from "../components/EmailLayout";
import { emailStyles } from "../styles/email";
import { EmailTemplateProps } from "@/lib/types";

export default function WelcomeEmail({
  username,
  verificationUrl,
}: EmailTemplateProps["Welcome"]) {
  return (
    <EmailLayout>
      {" "}
      <Preview>Welcome to ZOPA RFQ, {username}!</Preview>{" "}
      <Section style={emailStyles.content}>
        {" "}
        <Text style={emailStyles.heading}>
          {" "}
          Welcome to ZOPA RFQ, {username}!{" "}
        </Text>{" "}
        <Text style={emailStyles.paragraph}>
          {" "}
          Thank you for registering with ZOPA RFQ. We&apos;re happy to have you
          on board.{" "}
        </Text>{" "}
        <Text style={emailStyles.paragraph}>
          {" "}
          Your registration has been successfully completed, and you can now
          continue with the RFQ creation process.{" "}
        </Text>{" "}
        <Text style={emailStyles.paragraph}>
          {" "}
          ZOPA RFQ helps you manage your requirements, connect with vendors,
          receive vendor responses, and compare quotations in one place.{" "}
        </Text>{" "}
        <Text style={emailStyles.paragraph}>
          {" "}
          You can continue to the RFQ requirement page and provide the details
          needed to create your RFQ.{" "}
        </Text>{" "}
        <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
          {" "}
          <Button style={emailStyles.button} href={verificationUrl}>
            {" "}
            Login to ZOPA RFQ{" "}
          </Button>{" "}
        </Section>{" "}
        <Text style={emailStyles.paragraph}>
          {" "}
          If you have any questions or need assistance, please feel free to
          contact our support team at{" "}
          <a href="mailto:grow@zopapro.com" style={{ color: "#2563eb" }}>
            grow@zopapro.com
          </a>{" "}
          or WhatsApp via{" "}
          <a href="https://wa.me/917075452105" style={{ color: "#2563eb" }}>
            +91 7075452105
          </a>
          .{" "}
        </Text>{" "}
        <Text style={emailStyles.paragraph}>
          {" "}
          Thank you for choosing ZOPA RFQ.{" "}
        </Text>{" "}
        <Text style={emailStyles.paragraph}>
          {" "}
          Best regards, <br /> ZOPA RFQ Team{" "}
        </Text>{" "}
      </Section>{" "}
    </EmailLayout>
  );
}
