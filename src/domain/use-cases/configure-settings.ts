import type { UserSettings, UpdateSettingsInput } from "@/domain/entities/settings";
import type { SettingsRepository } from "@/domain/ports/settings-repository";

export class ConfigureSettingsUseCase {
  constructor(private settingsRepo: SettingsRepository) {}

  async get(userId: string): Promise<UserSettings | null> {
    return this.settingsRepo.findByUserId(userId);
  }

  async update(input: UpdateSettingsInput): Promise<UserSettings> {
    return this.settingsRepo.upsert(input);
  }
}
