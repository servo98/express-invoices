import type { Invoice } from "@/domain/entities/invoice";
import type { InvoiceRepository } from "@/domain/ports/invoice-repository";

export class ListInvoicesUseCase {
  constructor(private invoiceRepo: InvoiceRepository) {}

  async allByUser(userId: string): Promise<Invoice[]> {
    return this.invoiceRepo.findAllByUser(userId);
  }

  async byYear(userId: string, year: number): Promise<Invoice[]> {
    return this.invoiceRepo.findAllByYear(userId, year);
  }
}
