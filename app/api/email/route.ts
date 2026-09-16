// app/api/email/route.ts
import { NextResponse } from "next/server";
import { EmailService } from "@/lib/email/email-service";
import { db } from "@/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type = "magic-link", data } = body;

    switch (type) {
   
      case "magic-link":
        await EmailService.sendMagicLinkEmail(data);
        break;
      case "buyer-thank-you":
        await EmailService.sendBuyerThankYouEmail(data);
        break;
      case "express-interest":
        await EmailService.sendExpressInterestEmail(data);
        break;
      case "rfp-magic-link":
        if (!data.rfpId) {
          return NextResponse.json(
            { error: "rfpId is required" },
            { status: 400 },
          );
        }

        const magicLinkResult = await EmailService.sendRfpMagicLinkEmail({
          email: data.email,
          url: data.url,
          rfpName: data.rfpName,
          companyName: data.companyName,
          expiredata: data.expiredata,
          contactName: data.contactName,
          rfpId: data.rfpId,
          buyerEmail: data.buyerEmail,
          vendorResponseId: data.vendorResponseId,
        });

        return NextResponse.json({
          success: true,
          message: "RFP email sent successfully",
          data: magicLinkResult,
        });

        case "rfp-cc-notification":
        if (!data.ccEmails || !Array.isArray(data.ccEmails)) {
          return NextResponse.json(
            { error: "ccEmails array is required" },
            { status: 400 }
          );
        }

        if (!data.rfpName || !data.companyName || !data.rfpId) {
          return NextResponse.json(
            { error: "rfpName, companyName, and rfpId are required" },
            { status: 400 }
          );
        }

        await EmailService.sendRfpCCNotification({
          ccEmails: data.ccEmails,
          rfpName: data.rfpName,
          companyName: data.companyName,
          contactName: data.contactName,
          expiredata: data.expiredata,
          rfpId: data.rfpId,
          buyerEmail: data.buyerEmail,
          vendors: data.vendors || [],
        });
        break;

      case "vendor-submission":
        await EmailService.sendVendorSubmissionEmail(data);
        break;

         case "vendor-submission-cc":
        if (!data.ccEmails || !Array.isArray(data.ccEmails)) {
          return NextResponse.json(
            { error: "ccEmails array is required" },
            { status: 400 }
          );
        }

        if (
          !data.companyName ||
          !data.projectName ||
          !data.vendorEmail ||
          !data.vendorCompanyName
        ) {
          return NextResponse.json(
            {
              error:
                "companyName, projectName, vendorEmail, and vendorCompanyName are required",
            },
            { status: 400 }
          );
        }

        await EmailService.sendVendorSubmissionCCNotification({
          ccEmails: data.ccEmails,
          companyName: data.companyName,
          projectName: data.projectName,
          vendorEmail: data.vendorEmail,
          vendorCompanyName: data.vendorCompanyName,
          buyerEmail: data.buyerEmail,
          url: data.url,
        });
        break;

      case "vendor-preview-submission":
        await EmailService.sendVendorPreviewSubmission(data);
        break;

      case "approval-request":
        if (!data.approverEmail || !data.approverName || !data.rfpId) {
          return NextResponse.json(
            { error: "approverEmail, approverName, and rfpId are required" },
            { status: 400 }
          );
        }

        await EmailService.sendApprovalRequestEmail({
          approverName: data.approverName,
          approverEmail: data.approverEmail,
          requesterName: data.requesterName,
          rfpId: data.rfpId,
          projectName: data.projectName,
          comments: data.comments,
          approvalUrl: data.approvalUrl,
          buyerEmail: data.buyerEmail,
        });
        break;

      case "approval-decision":
        if (
          !data.requesterEmail ||
          !data.approverName ||
          !data.rfpId ||
          !data.status
        ) {
          return NextResponse.json(
            {
              error:
                "requesterEmail, approverName, rfpId, and status are required",
            },
            { status: 400 }
          );
        }

        await EmailService.sendApprovalDecisionEmail({
          requesterName: data.requesterName,
          requesterEmail: data.requesterEmail,
          approverName: data.approverName,
          rfpId: data.rfpId,
          projectName: data.projectName,
          status: data.status,
          comments: data.comments,
          rfpUrl: data.rfpUrl,
          buyerEmail: data.buyerEmail,
        });
        break;

      case "revision-request":
        if (
          !data.vendorEmail ||
          !data.vendorCompanyName ||
          !data.projectName ||
          !data.buyerCompanyName ||
          !data.approverName ||
          !data.revisionComments ||
          !data.rfpUrl ||
          !data.submissionDeadline
        ) {
          return NextResponse.json(
            {
              error:
                "vendorEmail, vendorCompanyName, projectName, buyerCompanyName, approverName, revisionComments, rfpUrl, and submissionDeadline are required",
            },
            { status: 400 }
          );
        }

        await EmailService.sendRevisionRequestEmail({
          vendorEmail: data.vendorEmail,
          vendorCompanyName: data.vendorCompanyName,
          projectName: data.projectName,
          buyerCompanyName: data.buyerCompanyName,
          approverName: data.approverName,
          revisionComments: data.revisionComments,
          rfpUrl: data.rfpUrl,
          submissionDeadline: data.submissionDeadline,
          buyerEmail: data.buyerEmail,
        });
        break;

      case "vendor-proposal-selected":
        if (!data.vendorEmail || !data.vendorCompanyName || !data.projectName) {
          return NextResponse.json(
            {
              error:
                "vendorEmail, vendorCompanyName, and projectName are required",
            },
            { status: 400 }
          );
        }

        await EmailService.sendVendorApprovalNotificationEmail({
          vendorEmail: data.vendorEmail,
          vendorCompanyName: data.vendorCompanyName,
          projectName: data.projectName,
          buyerCompanyName: data.buyerCompanyName,
          approverName: data.approverName,
          approverComments: data.approverComments,
          contactEmail: data.contactEmail,
          rfpUrl: data.rfpUrl,
          buyerEmail: data.buyerEmail,
        });
        break;

      case "vendor-proposal-not-selected":
        if (!data.vendorEmail || !data.vendorCompanyName || !data.projectName) {
          return NextResponse.json(
            {
              error:
                "vendorEmail, vendorCompanyName, and projectName are required",
            },
            { status: 400 }
          );
        }

        await EmailService.sendVendorProposalNotSelectedEmail({
          vendorEmail: data.vendorEmail,
          vendorCompanyName: data.vendorCompanyName,
          projectName: data.projectName,
          buyerCompanyName: data.buyerCompanyName,
          approverName: data.approverName,
          contactEmail: data.contactEmail,
          rfpUrl: data.rfpUrl,
          buyerEmail: data.buyerEmail,
          feedbackMessage: data.feedbackMessage,
        });
        break;

      case "rfp-limit-request":
        // Validate required fields
        if (!data.organizationName || !data.requesterEmail || !data.requestId) {
          return NextResponse.json(
            {
              error:
                "organizationName, requesterEmail, and requestId are required",
            },
            { status: 400 }
          );
        }

        await EmailService.sendRfpLimitRequestEmail({
          organizationName: data.organizationName,
          requesterEmail: data.requesterEmail,
          rfpLimit: data.rfpLimit,
          buyerLimit: data.buyerLimit,
          maxVendorsPerRfp: data.maxVendorsPerRfp,
          creditExpiresAt: data.creditExpiresAt,
          notes: data.notes,
          requestId: data.requestId,
        });
        break;

      case "all-vendors-completed":
        if (!data.buyerEmail || !data.projectName || !data.vendors) {
          return NextResponse.json(
            { error: "buyerEmail, projectName, and vendors are required" },
            { status: 400 }
          );
        }

        await EmailService.sendAllVendorsCompletedEmail({
          companyName: data.companyName,
          projectName: data.projectName,
          buyerEmail: data.buyerEmail,
          vendorCount: data.vendorCount || data.vendors.length,
          vendors: data.vendors,
          url: data.url,
        });
        break;
        
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}