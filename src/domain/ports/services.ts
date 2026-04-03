import type { Invoice } from "@/domain/entities/invoice";
import type { User } from "@/domain/entities/user";

export interface PdfGenerator {
  generate(invoice: Invoice, user: User): Promise<Buffer>;
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

export interface ParsedCfdiItem {
  claveProdServ: string;
  cantidad: number;
  claveUnidad: string;
  unidad: string;
  descripcion: string;
  valorUnitario: number;
  importe: number;
  objetoImp: string;
}

export interface ParsedCfdiTax {
  tipo: "traslado" | "retencion";
  impuesto: string;
  base: number;
  tipoFactor: string;
  tasaOCuota: number;
  importe: number;
}

export interface ParsedCfdi {
  // Comprobante
  fecha: string;
  folio: string | null;
  serie: string | null;
  subtotal: number;
  total: number;
  moneda: string;
  tipoCambio: number | null;
  formaPago: string;
  metodoPago: string;
  lugarExpedicion: string | null;
  tipoComprobante: string;
  exportacion: string;

  // Emisor
  emisorRfc: string;
  emisorNombre: string;
  emisorRegimenFiscal: string;

  // Receptor
  receptorRfc: string;
  receptorNombre: string;
  receptorResidenciaFiscal: string | null;
  receptorNumRegIdTrib: string | null;
  receptorRegimenFiscalReceptor: string | null;
  receptorUsoCfdi: string;

  // Items
  items: ParsedCfdiItem[];

  // Taxes
  totalImpuestosTrasladados: number;
  totalImpuestosRetenidos: number;
  taxes: ParsedCfdiTax[];

  // Timbre Fiscal Digital
  uuid: string;
  fechaTimbrado: string;
  selloCfd: string;
  selloSat: string;
  noCertificadoSat: string;
  cadenaOriginal: string;

  // Full XML
  xmlContent: string;
}

export interface CfdiXmlParser {
  parse(xmlContent: string): ParsedCfdi;
}
