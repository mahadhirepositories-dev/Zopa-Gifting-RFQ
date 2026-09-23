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
import ApprovalRequestEmail from "@/emails/templates/ApprovalRequestEmail";
import ApprovalDecisionEmail from "@/emails/templates/ApprovalDecisionEmail";


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
    let baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    if (!baseURL.startsWith("http")) baseURL = `https://${baseURL}`;
    const targetUrl = url || "/";
    const fullUrl = targetUrl.startsWith("http") ? targetUrl : `${baseURL}${targetUrl.startsWith("/") ? "" : "/"}${targetUrl}`;

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
    let baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    if (!baseURL.startsWith("http")) baseURL = `https://${baseURL}`;
    const fullUrl = url.startsWith("http") ? url : `${baseURL}${url.startsWith("/") ? "" : "/"}${url}`;

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
    let baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    if (!baseURL.startsWith("http")) baseURL = `https://${baseURL}`;
    const fullUrl = url.startsWith("http") ? url : `${baseURL}${url.startsWith("/") ? "" : "/"}${url}`;

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

  static async sendApprovalRequestEmail(data: {
    approverEmail: string;
    rfqId?: string;
    rfpId?: string;
    approvalUrl: string;
    projectName?: string;
    buyerComments?: string;
    comments?: string;
    approverName?: string;
    requesterName?: string;
    buyerEmail?: string;
    recommendedVendors?: Array<{ companyName: string; vendorResponseId?: string }>;
    approvalLevel?: string;
  }) {
    console.log("Approval request email triggered:", data);
    const companyName = "ZOPA Gifting RFQ";
    const targetRfqId = data.rfqId || data.rfpId || "RFQ";
    await this.renderAndSend({
      template: ApprovalRequestEmail,
      props: {
        projectName: data.projectName || "Gifting Project",
        rfqId: targetRfqId,
        approvalUrl: data.approvalUrl,
        buyerComments: data.buyerComments || data.comments,
        recommendedVendors: data.recommendedVendors || [],
        approvalLevel: data.approvalLevel || "Level 1",
      },
      email: data.approverEmail,
      subject: `Approval Required: Vendor Recommendation for ${data.projectName || "RFQ " + targetRfqId}`,
      companyName,
      buyerEmail: data.buyerEmail,
    });
    return { success: true };
  }


  static async sendApprovalDecisionEmail(data: {
    buyerEmail?: string;
    vendorEmail?: string;
    rfqId?: string;
    rfpId?: string;
    status: string;
    projectName?: string;
    comments?: string;
    requesterName?: string;
    requesterEmail?: string;
    approverName?: string;
    rfpUrl?: string;
  }) {
    console.log("Approval decision email triggered:", data);
    const targetEmail = data.buyerEmail || data.requesterEmail || data.vendorEmail || process.env.ADMIN_EMAIL_TO || "buyer@zopapro.com";
    const targetRfqId = data.rfqId || data.rfpId || "RFQ";
    const companyName = "ZOPA Gifting RFQ";
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
    const rfqUrl = data.rfpUrl || `${baseUrl}/rfq/buyer_preview/${targetRfqId}`;

    await this.renderAndSend({
      template: ApprovalDecisionEmail,
      props: {
        projectName: data.projectName || "Gifting Project",
        rfqId: targetRfqId,
        status: data.status,
        comments: data.comments,
        rfqUrl,
      },
      email: targetEmail,
      subject: `RFQ ${data.status}: Vendor Recommendation for ${data.projectName || "RFQ " + targetRfqId}`,
      companyName,
    });
    return { success: true };
  }

  static async sendRevisionRequestEmail(data: {
    buyerEmail?: string;
    vendorEmail?: string;
    vendorCompanyName?: string;
    buyerCompanyName?: string;
    approverName?: string;
    revisionComments?: string;
    submissionDeadline?: string;
    rfqUrl?: string;
    rfpUrl?: string;
    rfqId?: string;
    rfpId?: string;
    projectName?: string;
    comments?: string;
    requesterName?: string;
    requesterEmail?: string;
  }) {
    return this.sendApprovalDecisionEmail({
      buyerEmail: data.buyerEmail || data.vendorEmail || data.requesterEmail,
      rfqId: data.rfqId || data.rfpId,
      status: "Re-quote Requested",
      projectName: data.projectName,
      comments: data.comments || data.revisionComments,
      rfpUrl: data.rfpUrl || data.rfqUrl,
    });
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
