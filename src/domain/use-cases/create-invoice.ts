import type { Invoice, CreateInvoiceInput, InvoiceTax } from "@/domain/entities/invoice";
import type { InvoiceRepository } from "@/domain/ports/invoice-repository";

export class CreateInvoiceUseCase {
  constructor(private invoiceRepo: InvoiceRepository) {}

  async execute(input: CreateInvoiceInput): Promise<Invoice> {
    // Check uniqueness constraint
    const existing = await this.invoiceRepo.findByMonthYear(input.userId, {
      month: input.month,
      year: input.year,
    });
    if (existing) {
      throw new Error(`Invoice already exists for ${input.month}/${input.year}`);
    }

    // Calculate totals from items
    const subtotal = input.items.reduce((sum, item) => sum + item.importe, 0);

    // Generate default taxes for foreign clients (IVA 0%, ISR 0%)
    const inputWithTotals: CreateInvoiceInput = {
      ...input,
      items: input.items.map((item) => ({
        ...item,
        importe: item.valorUnitario * item.cantidad,
      })),
    };

    return this.invoiceRepo.create(inputWithTotals);
  }
}
