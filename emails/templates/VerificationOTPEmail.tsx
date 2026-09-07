import { Section, Text, Preview } from "@react-email/components";
import EmailLayout from "../components/EmailLayout";
import { emailStyles } from "../styles/email";
import { EmailTemplateProps } from "@/lib/types";

export default function VerificationOTPEmail({
  otp,
  type,
}: EmailTemplateProps["VerificationOTP"]) {
  const getSubjectByType = () => {
    switch (type) {
      case "signup":
        return "Complete your registration";
      case "login":
        return "Login verification code";
      case "reset-password":
        return "Reset your password";
      default:
        return "Verification code";
    }
  };

  return (
    <EmailLayout>
      <Preview>{getSubjectByType()}</Preview>

      <Section style={emailStyles.content}>
        <Text style={emailStyles.heading}>{getSubjectByType()}</Text>
        <Text style={emailStyles.paragraph}>Your verification code is:</Text>
        <Text style={emailStyles.otpStyle}>{otp}</Text>
        <Text style={emailStyles.paragraph}>
          This code will expire in 10 minutes. If you didn&apos;t request this
          code, you can safely ignore this email.
        </Text>
      </Section>
    </EmailLayout>
  );
}
