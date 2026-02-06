import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-utils";
import { container } from "@/infrastructure/di/container";
import { updateInvoiceAction } from "@/app/actions/invoice-actions";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { formatMonthYear } from "@/domain/value-objects/month-year";

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const user = await requireUser();
  const { id } = await params;
  const invoice = await container.getInvoice.byId(id, user.id);

  if (!invoice) notFound();

  const monthYear = formatMonthYear({ month: invoice.month, year: invoice.year });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Invoice - {monthYear}</h1>
      <InvoiceForm
        action={updateInvoiceAction}
        defaultValues={{
          id: invoice.id,
          month: invoice.month,
          year: invoice.year,
          formaPago: invoice.formaPago,
          metodoPago: invoice.metodoPago,
          moneda: invoice.moneda,
          tipoCambio: invoice.tipoCambio,
          lugarExpedicion: invoice.lugarExpedicion || undefined,
          receptorNombre: invoice.receptorNombre || undefined,
          receptorRfc: invoice.receptorRfc,
          receptorCp: invoice.receptorCp || undefined,
          residenciaFiscal: invoice.residenciaFiscal || undefined,
          numRegIdTrib: invoice.numRegIdTrib || undefined,
          regimenFiscalReceptor: invoice.regimenFiscalReceptor || undefined,
          usoCfdi: invoice.usoCfdi,
          billedToName: invoice.billedToName || undefined,
          billedToAddress: invoice.billedToAddress || undefined,
          billedToPhone: invoice.billedToPhone || undefined,
          paymentReference: invoice.paymentReference || undefined,
          items: invoice.items.map((item) => ({
            descripcion: item.descripcion,
            valorUnitario: item.valorUnitario,
            cantidad: item.cantidad,
            importe: item.importe,
            claveProdServ: item.claveProdServ,
            claveUnidad: item.claveUnidad,
            unidad: item.unidad,
          })),
        }}
      />
    </div>
  );
}
