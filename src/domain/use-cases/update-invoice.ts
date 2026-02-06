import type { Invoice, UpdateInvoiceInput } from "@/domain/entities/invoice";
import type { InvoiceRepository } from "@/domain/ports/invoice-repository";

export class UpdateInvoiceUseCase {
  constructor(private invoiceRepo: InvoiceRepository) {}

  async execute(input: UpdateInvoiceInput, userId: string): Promise<Invoice> {
    const existing = await this.invoiceRepo.findById(input.id, userId);
    if (!existing) {
      throw new Error("Invoice not found");
    }
    if (existing.status === "timbrado") {
      throw new Error("Cannot edit a timbrado invoice");
    }
    return this.invoiceRepo.update(input);
  }
}
