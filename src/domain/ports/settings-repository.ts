import type { UserSettings, UpdateSettingsInput } from "@/domain/entities/settings";

export interface SettingsRepository {
  findByUserId(userId: string): Promise<UserSettings | null>;
  upsert(input: UpdateSettingsInput): Promise<UserSettings>;
}
