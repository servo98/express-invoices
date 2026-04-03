import type { InvoiceRepository } from "@/domain/ports/invoice-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { PdfGenerator, ZipPackager } from "@/domain/ports/services";

export class DownloadInvoiceBundleUseCase {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private userRepo: UserRepository,
    private pdfGenerator: PdfGenerator,
    private zipPackager: ZipPackager,
  ) {}

  async execute(invoiceId: string, userId: string): Promise<Buffer> {
    const [invoice, user] = await Promise.all([
      this.invoiceRepo.findById(invoiceId, userId),
      this.userRepo.findById(userId),
    ]);

    if (!invoice) throw new Error("Invoice not found");
    if (!user) throw new Error("User not found");

    // Generate commercial PDF
    const commercialPdf = await this.pdfGenerator.generate(invoice, user);
    const baseName = invoice.uuid;

    const files: { name: string; data: Buffer | string }[] = [];

    // Include timbrado PDF if available (uploaded by accountant)
    if (invoice.timbradoPdf) {
      files.push({ name: `${baseName}_timbrado.pdf`, data: invoice.timbradoPdf });
    }

    // Always include commercial PDF
    files.push({ name: `${baseName}_commercial.pdf`, data: commercialPdf });

    return this.zipPackager.createBundle(files);
  }

  async executeUnscoped(invoiceId: string): Promise<Buffer> {
    const invoice = await this.invoiceRepo.findByIdUnscoped(invoiceId);
    if (!invoice) throw new Error("Invoice not found");

    const user = await this.userRepo.findById(invoice.userId);
    if (!user) throw new Error("User not found");

    const commercialPdf = await this.pdfGenerator.generate(invoice, user);
    const baseName = invoice.uuid;

    const files: { name: string; data: Buffer | string }[] = [];

    if (invoice.timbradoPdf) {
      files.push({ name: `${baseName}_timbrado.pdf`, data: invoice.timbradoPdf });
    }

    files.push({ name: `${baseName}_commercial.pdf`, data: commercialPdf });

    return this.zipPackager.createBundle(files);
  }
}
