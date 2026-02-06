import type { Invoice, CreateInvoiceInput } from "@/domain/entities/invoice";
import type { InvoiceRepository } from "@/domain/ports/invoice-repository";
import { getNextMonthYear, formatMonthYear } from "@/domain/value-objects/month-year";

export class CloneInvoiceUseCase {
  constructor(private invoiceRepo: InvoiceRepository) {}

  async execute(sourceInvoiceId: string, userId: string): Promise<Invoice> {
    const source = await this.invoiceRepo.findById(sourceInvoiceId, userId);
    if (!source) throw new Error("Source invoice not found");

    const nextMonth = getNextMonthYear({ month: source.month, year: source.year });
    const monthLabel = formatMonthYear(nextMonth);

    const input: CreateInvoiceInput = {
      userId,
      month: nextMonth.month,
      year: nextMonth.year,
      formaPago: source.formaPago,
      metodoPago: source.metodoPago,
      moneda: source.moneda,
      lugarExpedicion: source.lugarExpedicion || undefined,
      exportacion: source.exportacion,
      receptorNombre: source.receptorNombre || undefined,
      receptorRfc: source.receptorRfc,
      receptorCp: source.receptorCp || undefined,
      residenciaFiscal: source.residenciaFiscal || undefined,
      numRegIdTrib: source.numRegIdTrib || undefined,
      regimenFiscalReceptor: source.regimenFiscalReceptor || undefined,
      usoCfdi: source.usoCfdi,
      billedToName: source.billedToName || undefined,
      billedToAddress: source.billedToAddress || undefined,
      billedToPhone: source.billedToPhone || undefined,
      paymentReference: source.paymentReference
        ? source.paymentReference.replace(
            formatMonthYear({ month: source.month, year: source.year }),
            monthLabel,
          )
        : undefined,
      items: source.items.map((item) => ({
        claveProdServ: item.claveProdServ,
        cantidad: item.cantidad,
        claveUnidad: item.claveUnidad,
        unidad: item.unidad,
        descripcion: item.descripcion.replace(
          formatMonthYear({ month: source.month, year: source.year }),
          monthLabel,
        ),
        valorUnitario: item.valorUnitario,
        importe: item.importe,
        objetoImp: item.objetoImp,
      })),
    };

    return this.invoiceRepo.create(input);
  }

  async cloneLatest(userId: string): Promise<Invoice> {
    const latest = await this.invoiceRepo.getLatestByUser(userId);
    if (!latest) throw new Error("No previous invoice found to clone");
    return this.execute(latest.id, userId);
  }
}
