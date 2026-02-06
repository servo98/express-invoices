import { db } from "@/lib/db";
import type { User, UpdateUserInput } from "@/domain/entities/user";
import type { UserRepository } from "@/domain/ports/user-repository";

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    return db.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({ where: { email } });
  }

  async update(input: UpdateUserInput): Promise<User> {
    const { id, ...data } = input;
    return db.user.update({ where: { id }, data });
  }

  async findAllWithRemindersEnabled(): Promise<User[]> {
    return db.user.findMany({
      where: {
        settings: {
          reminderEnabled: true,
          discordWebhookUrl: { not: null },
        },
      },
    });
  }
}
