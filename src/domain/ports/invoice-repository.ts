import type { Invoice, CreateInvoiceInput, UpdateInvoiceInput } from "@/domain/entities/invoice";
import type { MonthYear } from "@/domain/value-objects/month-year";

export interface InvoiceRepository {
  findById(id: string, userId: string): Promise<Invoice | null>;
  findByMonthYear(userId: string, my: MonthYear): Promise<Invoice | null>;
  findAllByUser(userId: string): Promise<Invoice[]>;
  findAllByYear(userId: string, year: number): Promise<Invoice[]>;
  create(input: CreateInvoiceInput): Promise<Invoice>;
  update(input: UpdateInvoiceInput): Promise<Invoice>;
  delete(id: string, userId: string): Promise<void>;
  getLatestByUser(userId: string): Promise<Invoice | null>;
}
