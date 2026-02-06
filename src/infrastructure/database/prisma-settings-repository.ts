import { db } from "@/lib/db";
import type { UserSettings, UpdateSettingsInput } from "@/domain/entities/settings";
import type { SettingsRepository } from "@/domain/ports/settings-repository";

export class PrismaSettingsRepository implements SettingsRepository {
  async findByUserId(userId: string): Promise<UserSettings | null> {
    return db.userSettings.findUnique({ where: { userId } });
  }

  async upsert(input: UpdateSettingsInput): Promise<UserSettings> {
    const { userId, ...data } = input;
    return db.userSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
