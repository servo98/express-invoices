import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Pencil, FileText, FileCode, Download, Copy, Stamp,
  Mail, Trash2, CreditCard, Building2, Package,
  Receipt, ArrowLeft, MoreHorizontal,
} from "lucide-react";
import { requireUser } from "@/lib/auth-utils";
import { container } from "@/infrastructure/di/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/domain/value-objects/money";
import { formatMonthYear } from "@/domain/value-objects/month-year";
import { DeleteInvoiceButton } from "@/components/invoices/delete-invoice-button";
import { TimbrarButton } from "@/components/invoices/timbrar-button";
import { SendEmailButton } from "@/components/invoices/send-email-button";
import { cloneInvoiceAction } from "@/app/actions/invoice-actions";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  draft: "secondary",
  timbrado: "default",
  cancelled: "destructive",
};

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const invoice = await container.getInvoice.byId(id, user.id);

  if (!invoice) notFound();

  const monthYear = formatMonthYear({ month: invoice.month, year: invoice.year });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to invoices
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{monthYear}</h1>
          <p className="text-sm text-muted-foreground">UUID: {invoice.uuid}</p>
        </div>
        <Badge variant={statusVariant[invoice.status] || "secondary"}>
          {invoice.status}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/invoices/${id}/edit`}>
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
          <a href={`/api/invoices/${id}/pdf`} target="_blank" rel="noopener">
            <FileText className="h-4 w-4" /> View PDF
          </a>
        </Button>
        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
          <a href={`/api/invoices/${id}/xml`} target="_blank" rel="noopener">
            <FileCode className="h-4 w-4" /> View XML
          </a>
        </Button>
        <Button asChild size="sm">
          <a href={`/api/invoices/${id}/bundle`} download>
            <Download className="h-4 w-4" /> Download ZIP
          </a>
        </Button>
        <form className="hidden sm:block" action={async () => {
          "use server";
          await cloneInvoiceAction(id);
        }}>
          <Button type="submit" variant="outline" size="sm">
            <Copy className="h-4 w-4" /> Clone to Next Month
          </Button>
        </form>
        <TimbrarButton invoiceId={id} disabled={invoice.status === "timbrado"} />
        <SendEmailButton invoiceId={id} hasSmtp={!!user.smtpHost} />
        <DeleteInvoiceButton invoiceId={id} />

        {/* Mobile overflow menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="sm:hidden">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={`/api/invoices/${id}/pdf`} target="_blank" rel="noopener">
                <FileText className="mr-2 h-4 w-4" /> View PDF
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/api/invoices/${id}/xml`} target="_blank" rel="noopener">
                <FileCode className="mr-2 h-4 w-4" /> View XML
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <form action={async () => {
                "use server";
                await cloneInvoiceAction(id);
              }}>
                <button type="submit" className="flex w-full items-center">
                  <Copy className="mr-2 h-4 w-4" /> Clone to Next Month
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* CFDI Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            CFDI Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Forma de Pago</p>
            <p className="font-medium">{invoice.formaPago}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Metodo de Pago</p>
            <p className="font-medium">{invoice.metodoPago}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Moneda</p>
            <p className="font-medium">{invoice.moneda}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Tipo de Cambio</p>
            <p className="font-medium">{invoice.tipoCambio || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Lugar Expedicion</p>
            <p className="font-medium">{invoice.lugarExpedicion || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Exportacion</p>
            <p className="font-medium">{invoice.exportacion}</p>
          </div>
        </CardContent>
      </Card>

      {/* Billed To */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Billed To
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="font-medium">{invoice.billedToName || "—"}</p>
          <p className="text-muted-foreground">{invoice.billedToAddress || ""}</p>
          <p className="text-muted-foreground">{invoice.billedToPhone || ""}</p>
          <Separator className="my-3" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Receptor RFC</p>
              <p className="font-medium">{invoice.receptorRfc}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Receptor Nombre</p>
              <p className="font-medium">{invoice.receptorNombre || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Uso CFDI</p>
              <p className="font-medium">{invoice.usoCfdi}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Residencia Fiscal</p>
              <p className="font-medium">{invoice.residenciaFiscal || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Items
          </CardTitle>
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
            <CardTitle className="flex items-center gap-2">
              <Stamp className="h-5 w-5 text-primary" />
              Timbrado CFDI
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Fecha Timbrado</p>
              <p className="font-medium">{invoice.cfdiFechaTimbrado}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">No. Certificado SAT</p>
              <p className="font-medium">{invoice.cfdiNoCertificadoSat || "—"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Reference */}
      {invoice.paymentReference && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{invoice.paymentReference}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
