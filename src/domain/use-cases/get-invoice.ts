import type { Invoice } from "@/domain/entities/invoice";
import type { InvoiceRepository } from "@/domain/ports/invoice-repository";
import type { MonthYear } from "@/domain/value-objects/month-year";

export class GetInvoiceUseCase {
  constructor(private invoiceRepo: InvoiceRepository) {}

  async byId(id: string, userId: string): Promise<Invoice | null> {
    return this.invoiceRepo.findById(id, userId);
  }

  async byMonthYear(userId: string, my: MonthYear): Promise<Invoice | null> {
    return this.invoiceRepo.findByMonthYear(userId, my);
  }
}
