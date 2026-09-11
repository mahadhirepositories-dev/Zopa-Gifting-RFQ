/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from "@react-email/render";
import { createElement } from "react";
import { sendEmail } from "./nodemailer";
import MagicLinkEmail from "@/emails/templates/MagicLinkEmail";
import BuyerThankYouEmail from "@/emails/templates/BuyerThankYouEmail";
import RfpMagicLinkEmail from "@/emails/templates/RfpMagicLinkEmail";

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

  static async sendRfpCCNotification({
    ccEmails,
    rfpName,
    companyName,
    contactName,
    expiredata,
    rfpId,
    buyerEmail,
    vendors,
  }: {
    ccEmails: string[];
    rfpName: string;
    companyName: string;
    contactName?: string;
    expiredata?: string;
    rfpId: string;
    buyerEmail?: string;
    vendors?: any[];
  }) {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    for (const email of ccEmails) {
      if (email && email.trim()) {
        await this.renderAndSend({
          template: RfpMagicLinkEmail,
          props: {
            url: `${baseURL}/rfq/${rfpId}`,
            rfpName,
            companyName,
            expiryHours: expiredata || "7 days",
          },
          email: email.trim(),
          subject: `[CC Notification] RFQ: ${rfpName}`,
          companyName,
          buyerEmail,
        });
      }
    }
    return { success: true };
  }

  static async sendVendorSubmissionCCNotification(data: any) {
    if (data.ccEmails && Array.isArray(data.ccEmails)) {
      for (const email of data.ccEmails) {
        if (email && email.trim()) {
          await this.renderAndSend({
            template: MagicLinkEmail,
            props: { url: data.url || "#" },
            email: email.trim(),
            subject: `[CC] Vendor Submission for ${data.projectName} from ${data.vendorCompanyName}`,
            companyName: data.companyName || "ZOPA",
            buyerEmail: data.buyerEmail,
          });
        }
      }
    }
    return { success: true };
  }

  static async sendVendorPreviewSubmission(data: any) {
    if (data.buyerEmail) {
      await this.renderAndSend({
        template: MagicLinkEmail,
        props: { url: data.url || "#" },
        email: data.buyerEmail,
        subject: `Vendor Preview Submission: ${data.projectName || "RFQ"}`,
        companyName: data.companyName || "ZOPA",
        buyerEmail: data.buyerEmail,
      });
    }
    return { success: true };
  }

  static async sendApprovalRequestEmail(data: any) {
    if (data.approverEmail) {
      await this.renderAndSend({
        template: MagicLinkEmail,
        props: { url: data.approvalUrl || "#" },
        email: data.approverEmail,
        subject: `Approval Request: RFQ ${data.projectName || ""}`,
        companyName: "ZOPA",
        buyerEmail: data.buyerEmail,
      });
    }
    return { success: true };
  }

  static async sendApprovalDecisionEmail(data: any) {
    if (data.requesterEmail) {
      await this.renderAndSend({
        template: MagicLinkEmail,
        props: { url: data.rfpUrl || "#" },
        email: data.requesterEmail,
        subject: `Approval Decision: RFQ ${data.projectName || ""} (${data.status})`,
        companyName: "ZOPA",
        buyerEmail: data.buyerEmail,
      });
    }
    return { success: true };
  }

  static async sendRevisionRequestEmail(data: any) {
    if (data.vendorEmail) {
      await this.renderAndSend({
        template: MagicLinkEmail,
        props: { url: data.rfpUrl || "#" },
        email: data.vendorEmail,
        subject: `Revision Requested for ${data.projectName || "RFQ"}`,
        companyName: data.buyerCompanyName || "ZOPA",
        buyerEmail: data.buyerEmail,
      });
    }
    return { success: true };
  }

  static async sendVendorApprovalNotificationEmail(data: any) {
    if (data.vendorEmail) {
      await this.renderAndSend({
        template: MagicLinkEmail,
        props: { url: data.rfpUrl || "#" },
        email: data.vendorEmail,
        subject: `Proposal Selected: ${data.projectName || "RFQ"}`,
        companyName: data.buyerCompanyName || "ZOPA",
        buyerEmail: data.buyerEmail,
      });
    }
    return { success: true };
  }

  static async sendVendorProposalNotSelectedEmail(data: any) {
    if (data.vendorEmail) {
      await this.renderAndSend({
        template: MagicLinkEmail,
        props: { url: data.rfpUrl || "#" },
        email: data.vendorEmail,
        subject: `Proposal Status Update: ${data.projectName || "RFQ"}`,
        companyName: data.buyerCompanyName || "ZOPA",
        buyerEmail: data.buyerEmail,
      });
    }
    return { success: true };
  }

  static async sendRfpLimitRequestEmail(data: any) {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@zopapro.com";
    await this.renderAndSend({
      template: MagicLinkEmail,
      props: { url: "#" },
      email: adminEmail,
      subject: `RFP Limit Request for ${data.organizationName}`,
      companyName: "ZOPA",
      buyerEmail: data.requesterEmail,
    });
    return { success: true };
  }

  static async sendAllVendorsCompletedEmail(data: any) {
    if (data.buyerEmail) {
      await this.renderAndSend({
        template: BuyerThankYouEmail,
        props: {
          companyName: data.companyName || "ZOPA",
          projectName: data.projectName,
          vendors: data.vendors || [],
          buyerEmail: data.buyerEmail,
          url: data.url || "#",
        },
        email: data.buyerEmail,
        subject: `All Vendors Completed Submissions for ${data.projectName}`,
        companyName: data.companyName || "ZOPA",
        buyerEmail: data.buyerEmail,
      });
    }
    return { success: true };
  }

  static async sendExpressInterestEmail(data: any) {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fullUrl = data.url?.startsWith("http") ? data.url : `${baseURL}${data.url || ""}`;
    if (data.buyerEmail) {
      await this.renderAndSend({
        template: MagicLinkEmail,
        props: { url: fullUrl },
        email: data.buyerEmail,
        subject: `Express Interest: ${data.projectName || "RFQ"}`,
        companyName: data.companyName || "ZOPA Gifting RFQ",
        buyerEmail: data.buyerEmail,
      });
    }
    return { success: true };
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
    await this.renderAndSend({
      template: BuyerThankYouEmail,
      props: { companyName, projectName, vendorEmail, buyerEmail, url },
      email: buyerEmail,
      subject: `New Vendor Submission for ${projectName} from ${companyName}`,
      companyName: companyName,
      buyerEmail,
    });
  }
}
