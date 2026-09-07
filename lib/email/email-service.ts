import { render } from "@react-email/render";
import { createElement } from "react";
import { sendEmail } from "./nodemailer";
import MagicLinkEmail from "@/emails/templates/MagicLinkEmail";

export class EmailService {
  private static async renderAndSend({
    template,
    props,
    email,
    subject,
    companyName,
    buyerEmail,
  }: {
    template: React.ComponentType<any>;
    props: any;
    email: string;
    subject: string;
    companyName: string;
    buyerEmail?: string;
  }) {
    try {
      const emailHtml = await render(createElement(template, props));
      await sendEmail({
        to: email,
        subject,
        html: emailHtml,
        companyName,
        buyerEmail,
      });
    } catch (error) {
      console.error("EmailService renderAndSend error:", error);
      throw error;
    }
  }

  static async sendMagicLinkEmail({
    email,
    url,
    buyerEmail,
  }: {
    email: string;
    url: string;
    buyerEmail?: string;
  }) {
    const baseURL =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`;

    await this.renderAndSend({
      template: MagicLinkEmail,
      props: { url: fullUrl },
      email,
      subject: "Sign in to Your ZOPA Gifting RFQ Account",
      companyName: "ZOPA Gifting RFQ",
      buyerEmail,
    });
  }
}
