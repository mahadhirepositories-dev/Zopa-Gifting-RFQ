// // src/lib/email/nodemailer.ts
import nodemailer from "nodemailer";
import { EmailPayload } from "@/lib/types";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },

  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendEmail(payload: EmailPayload) {
  const { to, subject, html, companyName, buyerEmail } = payload;

  try {
    return await transporter.sendMail({
      from: `"${companyName}" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
      replyTo: buyerEmail,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

export async function verifySMTP() {
  try {
    const success = await transporter.verify();
    console.log("Server is ready to take our messages");
    return success;
  } catch (error) {
    console.error("SMTP verification failed:", error);
    throw error;
  }
}
