import nodemailer from "nodemailer";
import { ENV } from "./env";

/**
 * Creates and reuses a Nodemailer SMTP transporter based on .env configuration.
 */
const transporter = nodemailer.createTransport({
  host: ENV.smtpHost,
  port: Number(ENV.smtpPort),
  secure: Number(ENV.smtpPort) === 465, // true for 465, false for other ports
  auth: {
    user: ENV.smtpUser,
    pass: ENV.smtpPass,
  },
});

/**
 * Sends a newsletter email via SMTP.
 * @param to Recipient email address
 * @param subject Email subject
 * @param html HTML content of the newsletter
 */
export async function sendNewsletterEmail(to: string, subject: string, html: string): Promise<void> {
  await transporter.sendMail({
    from: ENV.smtpUser,
    to,
    subject,
    html,
  });
}