import type { InvoiceRepository } from "@/domain/ports/invoice-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { PdfGenerator, CfdiXmlGenerator, ZipPackager } from "@/domain/ports/services";

export class DownloadInvoiceBundleUseCase {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private userRepo: UserRepository,
    private pdfGenerator: PdfGenerator,
    private xmlGenerator: CfdiXmlGenerator,
    private zipPackager: ZipPackager,
  ) {}

  async execute(invoiceId: string, userId: string): Promise<Buffer> {
    const [invoice, user] = await Promise.all([
      this.invoiceRepo.findById(invoiceId, userId),
      this.userRepo.findById(userId),
    ]);

    if (!invoice) throw new Error("Invoice not found");
    if (!user) throw new Error("User not found");

    const [pdf, xml] = await Promise.all([
      this.pdfGenerator.generate(invoice, user),
      Promise.resolve(this.xmlGenerator.generate(invoice, user)),
    ]);

    const baseName = `${invoice.uuid}`;

    return this.zipPackager.createBundle([
      { name: `${baseName}.pdf`, data: pdf },
      { name: `${baseName}.xml`, data: xml },
    ]);
  }
}
