import type { InvoiceRepository } from "@/domain/ports/invoice-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { SettingsRepository } from "@/domain/ports/settings-repository";
import type { CfdiXmlParser, NotificationService } from "@/domain/ports/services";
import type { Invoice } from "@/domain/entities/invoice";
import { formatMonthYear } from "@/domain/value-objects/month-year";

export class UploadInvoiceUseCase {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private userRepo: UserRepository,
    private settingsRepo: SettingsRepository,
    private xmlParser: CfdiXmlParser,
    private notificationService: NotificationService,
  ) {}

  async execute(
    freelancerId: string,
    xmlContent: string,
    pdfBuffer: Buffer,
    uploadedByUserId: string,
  ): Promise<Invoice> {
    // 1. Parse XML to extract CFDI data
    const cfdi = this.xmlParser.parse(xmlContent);

    // 2. Determine month/year from Fecha
    const fecha = new Date(cfdi.fecha);
    const month = fecha.getMonth() + 1;
    const year = fecha.getFullYear();

    // 3. Fetch freelancer and settings
    const [freelancer, settings] = await Promise.all([
      this.userRepo.findById(freelancerId),
      this.settingsRepo.findByUserId(freelancerId),
    ]);

    if (!freelancer) throw new Error("Freelancer not found");

    // 4. Create Invoice with CFDI data + freelancer defaults
    const invoice = await this.invoiceRepo.create({
      userId: freelancerId,
      month,
      year,
      fecha,
      formaPago: cfdi.formaPago,
      metodoPago: cfdi.metodoPago,
      moneda: cfdi.moneda,
      tipoCambio: cfdi.tipoCambio,
      lugarExpedicion: cfdi.lugarExpedicion || freelancer.codigoPostal || undefined,
      exportacion: cfdi.exportacion,
      receptorNombre: cfdi.receptorNombre,
      receptorRfc: cfdi.receptorRfc,
      receptorCp: undefined,
      residenciaFiscal: cfdi.receptorResidenciaFiscal || undefined,
      numRegIdTrib: cfdi.receptorNumRegIdTrib || undefined,
      regimenFiscalReceptor: cfdi.receptorRegimenFiscalReceptor || undefined,
      usoCfdi: cfdi.receptorUsoCfdi,
      billedToName: settings?.defaultBilledToName || undefined,
      billedToAddress: settings?.defaultBilledToAddress || undefined,
      billedToPhone: settings?.defaultBilledToPhone || undefined,
      paymentReference: undefined,
      timbradoPdf: pdfBuffer,
      uploadedBy: uploadedByUserId,
      items: cfdi.items,
    });

    // 5. Update with timbrado data and status
    const updatedInvoice = await this.invoiceRepo.update({
      id: invoice.id,
      status: "timbrado",
      cfdiXml: cfdi.xmlContent,
      cfdiSelloCfd: cfdi.selloCfd,
      cfdiSelloSat: cfdi.selloSat,
      cfdiFechaTimbrado: cfdi.fechaTimbrado,
      cfdiNoCertificadoSat: cfdi.noCertificadoSat,
      cfdiCadenaOriginal: cfdi.cadenaOriginal,
    });

    // Update the uuid to match the CFDI UUID
    await this.invoiceRepo.update({
      id: invoice.id,
      uuid: cfdi.uuid,
    } as any);

    // 6. Send Discord notification
    if (settings?.discordWebhookUrl) {
      const monthLabel = formatMonthYear({ month, year });
      const clientName = settings.defaultBilledToName || cfdi.receptorNombre || "N/A";
      const clientEmail = settings.clientEmail || "N/A";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const message = [
        `**Germo subio tu factura de ${monthLabel}**`,
        `Total: $${cfdi.total.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${cfdi.moneda}`,
        `Enviar a: ${clientName} (${clientEmail})`,
        `ZIP listo para descargar: ${appUrl}/invoices/${invoice.id}`,
      ].join("\n");

      try {
        await this.notificationService.sendReminder(settings.discordWebhookUrl, message);
      } catch {
        // Non-critical: don't fail upload if notification fails
      }
    }

    return updatedInvoice;
  }
}
