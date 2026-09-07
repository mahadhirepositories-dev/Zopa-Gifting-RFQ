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
      <Preview>Welcome to our platform, {username}!</Preview>

      <Section style={emailStyles.content}>
        <Text style={emailStyles.heading}>Welcome, {username}!</Text>
        <Text style={emailStyles.paragraph}>
          We&apos;re excited to have you on board. Please verify your email to
          get started.
        </Text>

        <Button href={verificationUrl} style={emailStyles.button}>
          Verify Email
        </Button>
      </Section>
    </EmailLayout>
  );
}
