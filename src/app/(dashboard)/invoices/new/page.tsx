import { requireUser } from "@/lib/auth-utils";
import { createInvoiceAction } from "@/app/actions/invoice-actions";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { db } from "@/lib/db";

interface NewInvoicePageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function NewInvoicePage({ searchParams }: NewInvoicePageProps) {
  const user = await requireUser();
  const params = await searchParams;

  // Load user settings for defaults
  const settings = await db.userSettings.findUnique({
    where: { userId: user.id },
  });

  const now = new Date();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const year = params.year ? parseInt(params.year) : now.getFullYear();

  const defaultValues = {
    month,
    year,
    formaPago: settings?.defaultFormaPago || "99",
    metodoPago: settings?.defaultMetodoPago || "PPD",
    moneda: settings?.defaultMoneda || "USD",
    lugarExpedicion: user.codigoPostal || "",
    receptorNombre: settings?.defaultReceptorName || "Rfc generico extranjero",
    receptorRfc: settings?.defaultReceptorRfc || "XEXX010101000",
    receptorCp: settings?.defaultReceptorCp || user.codigoPostal || "",
    residenciaFiscal: settings?.defaultResidenciaFiscal || "USA",
    numRegIdTrib: settings?.defaultNumRegIdTrib || "",
    regimenFiscalReceptor: settings?.defaultRegimenFiscalReceptor || "616",
    usoCfdi: settings?.defaultUsoCfdi || "S01",
    billedToName: settings?.defaultReceptorName || "",
    items: [
      {
        descripcion: `${settings?.defaultDescription || "Professional software development services"} (${getMonthName(month)} ${year})`,
        valorUnitario: settings?.defaultRate || 3500,
        cantidad: 1,
        importe: settings?.defaultRate || 3500,
        claveProdServ: settings?.defaultClaveProdServ || "81111810",
        claveUnidad: settings?.defaultClaveUnidad || "E48",
        unidad: settings?.defaultUnidad || "Unidad de servicio",
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">New Invoice</h1>
      <InvoiceForm action={createInvoiceAction} defaultValues={defaultValues} />
    </div>
  );
}

function getMonthName(month: number): string {
  const names = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return names[month - 1] || "";
}
