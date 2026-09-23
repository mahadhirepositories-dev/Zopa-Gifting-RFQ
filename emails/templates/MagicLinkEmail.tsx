import { Section, Text, Button, Preview, Hr } from "@react-email/components";
import EmailLayout from "../components/EmailLayout";
import { emailStyles } from "../styles/email";

interface MagicLinkEmailProps {
  url: string;
}

export default function MagicLinkEmail({ url }: MagicLinkEmailProps) {
  return (
    <EmailLayout>
      <Preview>Sign in to your ZOPA Gifting RFQ account</Preview>
      <Section style={emailStyles.content}>
        <Text style={emailStyles.heading}>Sign in to your account</Text>
        <Text style={emailStyles.paragraph}>
          Click the button below to sign in to your ZOPA Gifting RFQ account. This link will expire in 10 minutes.
        </Text>
        <Button href={url} style={emailStyles.button}>
          Sign In to ZOPA RFQ
        </Button>
      </Section>
      <Hr style={emailStyles.hr} />
      <Text style={emailStyles.footer}>
        If you didn&apos;t request this email, you can safely ignore it.
      </Text>
    </EmailLayout>
  );
}
