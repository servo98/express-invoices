import { PrismaInvoiceRepository } from "@/infrastructure/database/prisma-invoice-repository";
import { PrismaUserRepository } from "@/infrastructure/database/prisma-user-repository";
import { PrismaSettingsRepository } from "@/infrastructure/database/prisma-settings-repository";
import { ReactPdfGenerator } from "@/infrastructure/services/react-pdf-generator";
import { CfdiXmlParserImpl } from "@/infrastructure/services/cfdi-xml-parser";
import { ZipPackagerImpl } from "@/infrastructure/services/zip-packager-impl";
import { DiscordNotificationService } from "@/infrastructure/services/discord-notification-service";
import { AsciiArtServiceImpl } from "@/infrastructure/services/ascii-art-service-impl";
import { DofExchangeRateService } from "@/infrastructure/services/exchange-rate-service-impl";
import { NodemailerEmailService } from "@/infrastructure/services/email-service-impl";

import { GetInvoiceUseCase } from "@/domain/use-cases/get-invoice";
import { ListInvoicesUseCase } from "@/domain/use-cases/list-invoices";
import { DeleteInvoiceUseCase } from "@/domain/use-cases/delete-invoice";
import { GenerateInvoicePdfUseCase } from "@/domain/use-cases/generate-invoice-pdf";
import { DownloadInvoiceBundleUseCase } from "@/domain/use-cases/download-invoice-bundle";
import { SendInvoiceReminderUseCase } from "@/domain/use-cases/send-invoice-reminder";
import { ConfigureSettingsUseCase } from "@/domain/use-cases/configure-settings";
import { UploadInvoiceUseCase } from "@/domain/use-cases/upload-invoice";

// Repositories (singletons)
const invoiceRepo = new PrismaInvoiceRepository();
const userRepo = new PrismaUserRepository();
const settingsRepo = new PrismaSettingsRepository();

// Services (singletons)
const pdfGenerator = new ReactPdfGenerator();
const xmlParser = new CfdiXmlParserImpl();
const zipPackager = new ZipPackagerImpl();
const notificationService = new DiscordNotificationService();
const asciiArtService = new AsciiArtServiceImpl();
const exchangeRateService = new DofExchangeRateService();
const emailService = new NodemailerEmailService();

// Use Cases (created on demand to keep them lightweight)
export const container = {
  // Repositories
  invoiceRepo,
  userRepo,
  settingsRepo,

  // Services
  pdfGenerator,
  xmlParser,
  zipPackager,
  notificationService,
  asciiArtService,
  exchangeRateService,
  emailService,

  // Use Cases
  get getInvoice() {
    return new GetInvoiceUseCase(invoiceRepo);
  },
  get listInvoices() {
    return new ListInvoicesUseCase(invoiceRepo);
  },
  get deleteInvoice() {
    return new DeleteInvoiceUseCase(invoiceRepo);
  },
  get generatePdf() {
    return new GenerateInvoicePdfUseCase(invoiceRepo, userRepo, pdfGenerator);
  },
  get downloadBundle() {
    return new DownloadInvoiceBundleUseCase(invoiceRepo, userRepo, pdfGenerator, zipPackager);
  },
  get sendReminder() {
    return new SendInvoiceReminderUseCase(invoiceRepo, userRepo, settingsRepo, notificationService, asciiArtService);
  },
  get configureSettings() {
    return new ConfigureSettingsUseCase(settingsRepo);
  },
  get uploadInvoice() {
    return new UploadInvoiceUseCase(invoiceRepo, userRepo, settingsRepo, xmlParser, notificationService);
  },
};
