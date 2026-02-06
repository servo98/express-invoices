import type { Invoice } from "@/domain/entities/invoice";
import type { User } from "@/domain/entities/user";

export interface PdfGenerator {
  generate(invoice: Invoice, user: User): Promise<Buffer>;
}

export interface CfdiXmlGenerator {
  generate(invoice: Invoice, user: User): string;
}

export interface ZipPackager {
  createBundle(files: { name: string; data: Buffer | string }[]): Promise<Buffer>;
}

export interface NotificationService {
  sendReminder(webhookUrl: string, message: string): Promise<void>;
}

export interface AsciiArtService {
  getRandomArt(): string;
}

export interface ExchangeRateService {
  getUsdToMxn(): Promise<{ rate: number; date: string }>;
}

export interface EmailService {
  sendInvoice(params: {
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
  }): Promise<void>;
}

export interface PacTimbradoResult {
  xml: string;
  uuid: string;
  fechaTimbrado: string;
  selloCfd: string;
  selloSat: string;
  noCertificadoSat: string;
  cadenaOriginal: string;
}

export interface PacService {
  timbrar(xmlBase: string): Promise<PacTimbradoResult>;
  cancelar(uuid: string, rfcEmisor: string, motivo: string): Promise<{ success: boolean; message: string }>;
  isConfigured(): boolean;
}
