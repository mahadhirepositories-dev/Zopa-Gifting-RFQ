/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from "@react-email/render";
import { createElement } from "react";
import { sendEmail } from "./nodemailer";
import MagicLinkEmail from "@/emails/templates/MagicLinkEmail";
import BuyerThankYouEmail from "@/emails/templates/BuyerThankYouEmail";
import RfpMagicLinkEmail from "@/emails/templates/RfpMagicLinkEmail";
import WelcomeEmail from "@/emails/templates/WelcomeEmail";
import VendorSubmissionEmail from "@/emails/templates/VendorSubmissionEmail";
import VendorPreviewEmail from "@/emails/templates/VendorPreviewEmail";

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

  static async sendWelcomeEmail({
    email,
    name,
    url,
  }: {
    email: string;
    name?: string;
    url?: string;
  }) {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const targetUrl = url || "/rfq/074db83b-2fe4-4978-874c-a2d34e269a7c/requirement";
    const fullUrl = targetUrl.startsWith("http") ? targetUrl : `${baseURL}${targetUrl}`;

    await this.renderAndSend({
      template: WelcomeEmail,
      props: { username: name || "User", verificationUrl: fullUrl },
      email,
      subject: "Welcome to ZOPA Gifting RFQ Portal!",
      companyName: "ZOPA Gifting RFQ",
    });
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
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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

  static async sendBuyerThankYouEmail({
    companyName,
    projectName,
    vendors,
    buyerEmail,
    url,
  }: {
    companyName: string;
    projectName: string;
    vendors: Array<{ email: string; companyName: string }>;
    buyerEmail: string;
    url: string;
  }) {
    await this.renderAndSend({
      template: BuyerThankYouEmail,
      props: {
        companyName,
        projectName,
        vendors,
        buyerEmail,
        url,
      },
      email: buyerEmail,
      subject: `Thank you for submitting your RFQ for ${projectName}`,
      companyName: companyName,
      buyerEmail,
    });
  }

  static async sendRfpMagicLinkEmail({
    email,
    url,
    rfpName,
    companyName,
    expiredata,
    rfpId,
    buyerEmail,
  }: {
    email: string;
    url: string;
    rfpName?: string;
    companyName?: string;
    expiredata?: string;
    contactName?: string;
    rfpId: string;
    buyerEmail?: string;
    vendorResponseId?: string;
  }) {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`;

    await this.renderAndSend({
      template: RfpMagicLinkEmail,
      props: {
        url: fullUrl,
        rfpName: rfpName || "Gifting Requirement",
        companyName: companyName || "ZOPA",
        expiryHours: expiredata || "7 days",
      },
      email,
      subject: `Invitation to respond to RFQ: ${rfpName || "Gifting Requirement"}`,
      companyName: companyName || "ZOPA Gifting RFQ",
      buyerEmail,
    });

    const token = `tok_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    const sessionId = `sess_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return {
      success: true,
      token,
      sessionId,
      expiresAt,
      rfpId,
    };
  }

  static async sendVendorSubmissionEmail({
    companyName,
    projectName,
    vendorEmail,
    buyerEmail,
    url,
  }: {
    companyName: string;
    projectName: string;
    vendorEmail: string;
    buyerEmail: string;
    url: string;
  }) {
    const targetEmail = buyerEmail || "buyer@zopapro.com";
    await this.renderAndSend({
      template: VendorSubmissionEmail,
      props: { companyName, projectName, vendorEmail, url },
      email: targetEmail,
      subject: `New Vendor Submission for ${projectName} from ${companyName}`,
      companyName,
      buyerEmail: targetEmail,
    });
  }

  static async sendVendorPreviewSubmission({
    companyName,
    projectName,
    vendorEmail,
    buyerEmail,
    VendorCompanyName,
    url,
  }: {
    companyName?: string;
    projectName: string;
    vendorEmail: string;
    buyerEmail?: string;
    VendorCompanyName: string;
    url: string;
  }) {
    const targetEmail = vendorEmail;
    await this.renderAndSend({
      template: VendorPreviewEmail,
      props: { projectName, VendorCompanyName, url },
      email: targetEmail,
      subject: `Thank you for submitting ${projectName} from ${companyName || "Buyer"}`,
      companyName: companyName || "ZOPA",
      buyerEmail,
    });
    return { success: true };
  }

  static async sendExpressInterestEmail(data: any) {
    console.log("Express interest email triggered:", data);
    return { success: true };
  }

  static async sendRfpCCNotification(data: any) {
    console.log("RFP CC notification email triggered:", data);
    return { success: true };
  }

  static async sendVendorSubmissionCCNotification(data: any) {
    console.log("Vendor submission CC notification email triggered:", data);
    return { success: true };
  }

  static async sendApprovalRequestEmail(data: any) {
    console.log("Approval request email triggered:", data);
    return { success: true };
  }

  static async sendApprovalDecisionEmail(data: any) {
    console.log("Approval decision email triggered:", data);
    return { success: true };
  }

  static async sendRevisionRequestEmail(data: any) {
    console.log("Revision request email triggered:", data);
    return { success: true };
  }

  static async sendVendorApprovalNotificationEmail(data: any) {
    console.log("Vendor proposal selected email triggered:", data);
    return { success: true };
  }

  static async sendVendorProposalNotSelectedEmail(data: any) {
    console.log("Vendor proposal not selected email triggered:", data);
    return { success: true };
  }

  static async sendRfpLimitRequestEmail(data: any) {
    console.log("RFP limit request email triggered:", data);
    return { success: true };
  }

  static async sendAllVendorsCompletedEmail(data: any) {
    console.log("All vendors completed email triggered:", data);
    return { success: true };
  }
}
