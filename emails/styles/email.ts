export const emailStyles = {
  main: {
    backgroundColor: "#f8f8f8",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    paddingBottom: "20px",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 20px",
    marginBottom: "20px",
    maxWidth: "600px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },
  content: {
    padding: "0 20px",
  },
  heading: {
    fontSize: "26px",
    fontWeight: "600",
    color: "#333333",
    letterSpacing: "-0.5px",
    lineHeight: "1.3",
  },
  subheading: {
    fontSize: "20px",
    letterSpacing: "-0.3px",
    lineHeight: "1.3",
    fontWeight: "500",
    color: "#484848",
    padding: "10px 0",
  },
  paragraph: {
    margin: "0 0 15px",
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#3c4149",
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "14px 24px",
  },
  hr: {
    borderColor: "#e6ebf1",
    margin: "20px 0",
  },
  footer: {
    color: "#8898aa",
    fontSize: "13px",
    lineHeight: "16px",
    textAlign: "center" as const,
    marginTop: "8px",
  },
  logo: {
    padding: "15px 0px",
    textAlign: "center" as const,
  },
  otpStyle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#2563eb",
    letterSpacing: "0.5em",
    textAlign: "center" as const,
    padding: "20px 0",
  },
  highlight: {
    color: "#2563eb",
    fontWeight: "bold",
  },
} as const;
