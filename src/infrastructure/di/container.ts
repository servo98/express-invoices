import { PrismaInvoiceRepository } from "@/infrastructure/database/prisma-invoice-repository";
import { PrismaUserRepository } from "@/infrastructure/database/prisma-user-repository";
import { PrismaSettingsRepository } from "@/infrastructure/database/prisma-settings-repository";
import { ReactPdfGenerator } from "@/infrastructure/services/react-pdf-generator";
import { CfdiXmlGeneratorImpl } from "@/infrastructure/services/cfdi-xml-generator-impl";
import { ZipPackagerImpl } from "@/infrastructure/services/zip-packager-impl";
import { DiscordNotificationService } from "@/infrastructure/services/discord-notification-service";
import { AsciiArtServiceImpl } from "@/infrastructure/services/ascii-art-service-impl";
import { DofExchangeRateService } from "@/infrastructure/services/exchange-rate-service-impl";
import { NodemailerEmailService } from "@/infrastructure/services/email-service-impl";
import { PacServiceImpl } from "@/infrastructure/services/pac-service-impl";

import { CreateInvoiceUseCase } from "@/domain/use-cases/create-invoice";
import { GetInvoiceUseCase } from "@/domain/use-cases/get-invoice";
import { ListInvoicesUseCase } from "@/domain/use-cases/list-invoices";
import { UpdateInvoiceUseCase } from "@/domain/use-cases/update-invoice";
import { DeleteInvoiceUseCase } from "@/domain/use-cases/delete-invoice";
import { GenerateInvoicePdfUseCase } from "@/domain/use-cases/generate-invoice-pdf";
import { GenerateCfdiXmlUseCase } from "@/domain/use-cases/generate-cfdi-xml";
import { DownloadInvoiceBundleUseCase } from "@/domain/use-cases/download-invoice-bundle";
import { SendInvoiceReminderUseCase } from "@/domain/use-cases/send-invoice-reminder";
import { ConfigureSettingsUseCase } from "@/domain/use-cases/configure-settings";
import { CloneInvoiceUseCase } from "@/domain/use-cases/clone-invoice";
import { TimbrarInvoiceUseCase } from "@/domain/use-cases/timbrar-invoice";

// Repositories (singletons)
const invoiceRepo = new PrismaInvoiceRepository();
const userRepo = new PrismaUserRepository();
const settingsRepo = new PrismaSettingsRepository();

// Services (singletons)
const pdfGenerator = new ReactPdfGenerator();
const xmlGenerator = new CfdiXmlGeneratorImpl();
const zipPackager = new ZipPackagerImpl();
const notificationService = new DiscordNotificationService();
const asciiArtService = new AsciiArtServiceImpl();
const exchangeRateService = new DofExchangeRateService();
const emailService = new NodemailerEmailService();
const pacService = new PacServiceImpl();

// Use Cases (created on demand to keep them lightweight)
export const container = {
  // Repositories
  invoiceRepo,
  userRepo,
  settingsRepo,

  // Services
  pdfGenerator,
  xmlGenerator,
  zipPackager,
  notificationService,
  asciiArtService,
  exchangeRateService,
  emailService,
  pacService,

  // Use Cases
  get createInvoice() {
    return new CreateInvoiceUseCase(invoiceRepo);
  },
  get getInvoice() {
    return new GetInvoiceUseCase(invoiceRepo);
  },
  get listInvoices() {
    return new ListInvoicesUseCase(invoiceRepo);
  },
  get updateInvoice() {
    return new UpdateInvoiceUseCase(invoiceRepo);
  },
  get deleteInvoice() {
    return new DeleteInvoiceUseCase(invoiceRepo);
  },
  get generatePdf() {
    return new GenerateInvoicePdfUseCase(invoiceRepo, userRepo, pdfGenerator);
  },
  get generateXml() {
    return new GenerateCfdiXmlUseCase(invoiceRepo, userRepo, xmlGenerator);
  },
  get downloadBundle() {
    return new DownloadInvoiceBundleUseCase(invoiceRepo, userRepo, pdfGenerator, xmlGenerator, zipPackager);
  },
  get sendReminder() {
    return new SendInvoiceReminderUseCase(invoiceRepo, userRepo, settingsRepo, notificationService, asciiArtService);
  },
  get configureSettings() {
    return new ConfigureSettingsUseCase(settingsRepo);
  },
  get cloneInvoice() {
    return new CloneInvoiceUseCase(invoiceRepo);
  },
  get timbrarInvoice() {
    return new TimbrarInvoiceUseCase(invoiceRepo, userRepo, xmlGenerator, pacService);
  },
};
