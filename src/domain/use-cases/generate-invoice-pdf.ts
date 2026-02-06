import type { InvoiceRepository } from "@/domain/ports/invoice-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { PdfGenerator } from "@/domain/ports/services";

export class GenerateInvoicePdfUseCase {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private userRepo: UserRepository,
    private pdfGenerator: PdfGenerator,
  ) {}

  async execute(invoiceId: string, userId: string): Promise<Buffer> {
    const [invoice, user] = await Promise.all([
      this.invoiceRepo.findById(invoiceId, userId),
      this.userRepo.findById(userId),
    ]);

    if (!invoice) throw new Error("Invoice not found");
    if (!user) throw new Error("User not found");

    return this.pdfGenerator.generate(invoice, user);
  }
}
