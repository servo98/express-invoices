import nodemailer from "nodemailer";
import type { EmailService } from "@/domain/ports/services";

export class NodemailerEmailService implements EmailService {
  async sendInvoice(params: {
    to: string;
    subject: string;
    body: string;
    attachments: { filename: string; content: Buffer }[];
    smtpConfig: {
      host: string;
      port: number;
      user: string;
      pass: string;
    };
  }): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: params.smtpConfig.host,
      port: params.smtpConfig.port,
      secure: params.smtpConfig.port === 465,
      auth: {
        user: params.smtpConfig.user,
        pass: params.smtpConfig.pass,
      },
    });

    await transporter.sendMail({
      from: params.smtpConfig.user,
      to: params.to,
      subject: params.subject,
      text: params.body,
      attachments: params.attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });
  }
}
