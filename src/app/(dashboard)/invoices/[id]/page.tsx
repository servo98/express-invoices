import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth-utils";
import { container } from "@/infrastructure/di/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/domain/value-objects/money";
import { formatMonthYear } from "@/domain/value-objects/month-year";
import { DeleteInvoiceButton } from "@/components/invoices/delete-invoice-button";
import { TimbrarButton } from "@/components/invoices/timbrar-button";
import { SendEmailButton } from "@/components/invoices/send-email-button";
import { cloneInvoiceAction } from "@/app/actions/invoice-actions";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const invoice = await container.getInvoice.byId(id, user.id);

  if (!invoice) notFound();

  const monthYear = formatMonthYear({ month: invoice.month, year: invoice.year });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{monthYear}</h1>
          <p className="text-sm text-muted-foreground">UUID: {invoice.uuid}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={invoice.status === "draft" ? "secondary" : "default"}>
            {invoice.status}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/invoices/${id}/edit`}>Edit</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={`/api/invoices/${id}/pdf`} target="_blank" rel="noopener">
            View PDF
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={`/api/invoices/${id}/xml`} target="_blank" rel="noopener">
            View XML
          </a>
        </Button>
        <Button asChild size="sm">
          <a href={`/api/invoices/${id}/bundle`} download>
            Download ZIP
          </a>
        </Button>
        <form action={async () => {
          "use server";
          await cloneInvoiceAction(id);
        }}>
          <Button type="submit" variant="outline" size="sm">
            Clone to Next Month
          </Button>
        </form>
        <TimbrarButton invoiceId={id} disabled={invoice.status === "timbrado"} />
        <SendEmailButton invoiceId={id} hasSmtp={!!user.smtpHost} />
        <DeleteInvoiceButton invoiceId={id} />
      </div>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>CFDI Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Forma de Pago:</span>{" "}
            {invoice.formaPago}
          </div>
          <div>
            <span className="text-muted-foreground">Metodo de Pago:</span>{" "}
            {invoice.metodoPago}
          </div>
          <div>
            <span className="text-muted-foreground">Moneda:</span>{" "}
            {invoice.moneda}
          </div>
          <div>
            <span className="text-muted-foreground">Tipo de Cambio:</span>{" "}
            {invoice.tipoCambio || "N/A"}
          </div>
          <div>
            <span className="text-muted-foreground">Lugar Expedicion:</span>{" "}
            {invoice.lugarExpedicion || "N/A"}
          </div>
          <div>
            <span className="text-muted-foreground">Exportacion:</span>{" "}
            {invoice.exportacion}
          </div>
        </CardContent>
      </Card>

      {/* Billed To */}
      <Card>
        <CardHeader>
          <CardTitle>Billed To</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="font-medium">{invoice.billedToName || "—"}</p>
          <p className="text-muted-foreground">{invoice.billedToAddress || ""}</p>
          <p className="text-muted-foreground">{invoice.billedToPhone || ""}</p>
          <Separator className="my-3" />
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Receptor RFC:</span>{" "}
              {invoice.receptorRfc}
            </div>
            <div>
              <span className="text-muted-foreground">Receptor Nombre:</span>{" "}
              {invoice.receptorNombre || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Uso CFDI:</span>{" "}
              {invoice.usoCfdi}
            </div>
            <div>
              <span className="text-muted-foreground">Residencia Fiscal:</span>{" "}
              {invoice.residenciaFiscal || "—"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoice.items.map((item, idx) => (
              <div key={idx} className="rounded-lg border p-3">
                <p className="font-medium">{item.descripcion}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>Qty: {item.cantidad}</span>
                  <span>Rate: {formatCurrency(item.valorUnitario, invoice.moneda)}</span>
                  <span className="font-medium text-foreground">
                    Total: {formatCurrency(item.importe, invoice.moneda)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total Due:</span>
            <span>{formatCurrency(invoice.total, invoice.moneda)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Timbrado Info */}
      {invoice.status === "timbrado" && invoice.cfdiFechaTimbrado && (
        <Card>
          <CardHeader>
            <CardTitle>Timbrado CFDI</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Fecha Timbrado:</span>{" "}
              {invoice.cfdiFechaTimbrado}
            </div>
            <div>
              <span className="text-muted-foreground">No. Certificado SAT:</span>{" "}
              {invoice.cfdiNoCertificadoSat || "—"}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Reference */}
      {invoice.paymentReference && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{invoice.paymentReference}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
