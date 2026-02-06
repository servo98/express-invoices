import { db } from "@/lib/db";
import type { Invoice, CreateInvoiceInput, UpdateInvoiceInput } from "@/domain/entities/invoice";
import type { InvoiceRepository } from "@/domain/ports/invoice-repository";
import type { MonthYear } from "@/domain/value-objects/month-year";
import { v4 as uuidv4 } from "uuid";

function mapInvoice(raw: any): Invoice {
  return {
    ...raw,
    status: raw.status as Invoice["status"],
    items: raw.items || [],
    taxes: raw.taxes || [],
  };
}

const includeRelations = { items: true, taxes: true };

export class PrismaInvoiceRepository implements InvoiceRepository {
  async findById(id: string, userId: string): Promise<Invoice | null> {
    const result = await db.invoice.findFirst({
      where: { id, userId },
      include: includeRelations,
    });
    return result ? mapInvoice(result) : null;
  }

  async findByMonthYear(userId: string, my: MonthYear): Promise<Invoice | null> {
    const result = await db.invoice.findFirst({
      where: { userId, month: my.month, year: my.year },
      include: includeRelations,
    });
    return result ? mapInvoice(result) : null;
  }

  async findAllByUser(userId: string): Promise<Invoice[]> {
    const results = await db.invoice.findMany({
      where: { userId },
      include: includeRelations,
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    return results.map(mapInvoice);
  }

  async findAllByYear(userId: string, year: number): Promise<Invoice[]> {
    const results = await db.invoice.findMany({
      where: { userId, year },
      include: includeRelations,
      orderBy: { month: "desc" },
    });
    return results.map(mapInvoice);
  }

  async create(input: CreateInvoiceInput): Promise<Invoice> {
    const subtotal = input.items.reduce((sum, item) => sum + item.importe, 0);

    const result = await db.invoice.create({
      data: {
        uuid: uuidv4().toUpperCase(),
        userId: input.userId,
        month: input.month,
        year: input.year,
        fecha: input.fecha || new Date(),
        formaPago: input.formaPago || "99",
        metodoPago: input.metodoPago || "PPD",
        moneda: input.moneda || "USD",
        tipoCambio: input.tipoCambio,
        lugarExpedicion: input.lugarExpedicion,
        exportacion: input.exportacion || "01",
        receptorNombre: input.receptorNombre,
        receptorRfc: input.receptorRfc || "XEXX010101000",
        receptorCp: input.receptorCp,
        residenciaFiscal: input.residenciaFiscal || "USA",
        numRegIdTrib: input.numRegIdTrib,
        regimenFiscalReceptor: input.regimenFiscalReceptor || "616",
        usoCfdi: input.usoCfdi || "S01",
        billedToName: input.billedToName,
        billedToAddress: input.billedToAddress,
        billedToPhone: input.billedToPhone,
        subtotal,
        totalImpuestosTrasladados: 0,
        totalImpuestosRetenidos: 0,
        total: subtotal,
        paymentReference: input.paymentReference,
        items: {
          create: input.items,
        },
        taxes: {
          create: [
            {
              tipo: "traslado",
              impuesto: "002",
              base: subtotal,
              tipoFactor: "Tasa",
              tasaOCuota: 0,
              importe: 0,
            },
            {
              tipo: "retencion",
              impuesto: "001",
              base: subtotal,
              tipoFactor: "Tasa",
              tasaOCuota: 0,
              importe: 0,
            },
          ],
        },
      },
      include: includeRelations,
    });

    return mapInvoice(result);
  }

  async update(input: UpdateInvoiceInput): Promise<Invoice> {
    const { id, items, ...data } = input;

    // If items provided, recalculate totals
    let updateData: any = { ...data };
    if (items) {
      const subtotal = items.reduce((sum, item) => sum + item.importe, 0);
      updateData.subtotal = subtotal;
      updateData.total = subtotal;
    }

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    if (items) {
      // Delete existing items and taxes, recreate
      await db.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await db.invoiceTax.deleteMany({ where: { invoiceId: id } });

      const subtotal = items.reduce((sum, item) => sum + item.importe, 0);

      const result = await db.invoice.update({
        where: { id },
        data: {
          ...updateData,
          items: { create: items },
          taxes: {
            create: [
              {
                tipo: "traslado",
                impuesto: "002",
                base: subtotal,
                tipoFactor: "Tasa",
                tasaOCuota: 0,
                importe: 0,
              },
              {
                tipo: "retencion",
                impuesto: "001",
                base: subtotal,
                tipoFactor: "Tasa",
                tasaOCuota: 0,
                importe: 0,
              },
            ],
          },
        },
        include: includeRelations,
      });
      return mapInvoice(result);
    }

    const result = await db.invoice.update({
      where: { id },
      data: updateData,
      include: includeRelations,
    });
    return mapInvoice(result);
  }

  async delete(id: string, userId: string): Promise<void> {
    await db.invoice.delete({ where: { id } });
  }

  async getLatestByUser(userId: string): Promise<Invoice | null> {
    const result = await db.invoice.findFirst({
      where: { userId },
      include: includeRelations,
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    return result ? mapInvoice(result) : null;
  }
}
