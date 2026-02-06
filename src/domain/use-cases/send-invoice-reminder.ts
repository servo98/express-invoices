import type { InvoiceRepository } from "@/domain/ports/invoice-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { SettingsRepository } from "@/domain/ports/settings-repository";
import type { NotificationService, AsciiArtService } from "@/domain/ports/services";
import { getCurrentMonthYear, formatMonthYear } from "@/domain/value-objects/month-year";

export class SendInvoiceReminderUseCase {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private userRepo: UserRepository,
    private settingsRepo: SettingsRepository,
    private notificationService: NotificationService,
    private asciiArtService: AsciiArtService,
  ) {}

  async executeForAllUsers(): Promise<{ sent: number; skipped: number }> {
    const users = await this.userRepo.findAllWithRemindersEnabled();
    const currentMonth = getCurrentMonthYear();
    let sent = 0;
    let skipped = 0;

    for (const user of users) {
      const settings = await this.settingsRepo.findByUserId(user.id);
      if (!settings?.discordWebhookUrl) {
        skipped++;
        continue;
      }

      // Check if invoice already exists for current month
      const existing = await this.invoiceRepo.findByMonthYear(user.id, currentMonth);
      if (existing) {
        skipped++;
        continue;
      }

      const asciiArt = this.asciiArtService.getRandomArt();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const monthName = formatMonthYear(currentMonth);

      const message = [
        "```",
        asciiArt,
        "```",
        `**Hey ${user.name || "there"}! Time to create your invoice for ${monthName}**`,
        "",
        `Click here to create it: ${appUrl}/invoices/new?month=${currentMonth.month}&year=${currentMonth.year}`,
      ].join("\n");

      await this.notificationService.sendReminder(settings.discordWebhookUrl, message);
      sent++;
    }

    return { sent, skipped };
  }
}
