import { Html, Body, Container, Text } from "@react-email/components";
import { emailStyles } from "../styles/email";

interface EmailLayoutProps {
  children: React.ReactNode;
}

export default function EmailLayout({ children }: EmailLayoutProps) {
  return (
    <Html>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.logo}>
          <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#2563eb", textAlign: "center" }}>
            ZOPA Gifting RFQ
          </Text>
        </Container>

        <Container style={emailStyles.container}>{children}</Container>
        
        <Text style={emailStyles.footer}>
          Need Assistance? Contact us for support: flux@zopapro.com
        </Text>
        <Text style={emailStyles.footer}>
          &copy; {new Date().getFullYear()} Zopa. All rights reserved.
        </Text>
      </Body>
    </Html>
  );
}
