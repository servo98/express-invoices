import type { InvoiceRepository } from "@/domain/ports/invoice-repository";

export class DeleteInvoiceUseCase {
  constructor(private invoiceRepo: InvoiceRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const existing = await this.invoiceRepo.findById(id, userId);
    if (!existing) {
      throw new Error("Invoice not found");
    }
    if (existing.status === "timbrado") {
      throw new Error("Cannot delete a timbrado invoice");
    }
    return this.invoiceRepo.delete(id, userId);
  }
}
