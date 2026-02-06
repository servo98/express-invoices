import type { InvoiceRepository } from "@/domain/ports/invoice-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { CfdiXmlGenerator, PacService } from "@/domain/ports/services";
import type { Invoice } from "@/domain/entities/invoice";

export class TimbrarInvoiceUseCase {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private userRepo: UserRepository,
    private xmlGenerator: CfdiXmlGenerator,
    private pacService: PacService,
  ) {}

  async execute(invoiceId: string, userId: string): Promise<Invoice> {
    if (!this.pacService.isConfigured()) {
      throw new Error("PAC service is not configured. Set PAC environment variables in settings.");
    }

    const invoice = await this.invoiceRepo.findById(invoiceId, userId);
    if (!invoice) throw new Error("Invoice not found");

    if (invoice.status === "timbrado") {
      throw new Error("Invoice is already timbrado");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");
    if (!user.rfc) throw new Error("User RFC is required for timbrado. Configure it in Settings.");

    // Generate base XML
    const xmlBase = this.xmlGenerator.generate(invoice, user);

    // Send to PAC for timbrado
    const result = await this.pacService.timbrar(xmlBase);

    // Update invoice with timbrado data
    const updated = await this.invoiceRepo.update({
      id: invoiceId,
      userId,
      status: "timbrado",
      cfdiXml: result.xml,
      cfdiSelloCfd: result.selloCfd,
      cfdiSelloSat: result.selloSat,
      cfdiFechaTimbrado: result.fechaTimbrado,
      cfdiNoCertificadoSat: result.noCertificadoSat,
      cfdiCadenaOriginal: result.cadenaOriginal,
    });

    return updated;
  }
}
