import type { User, UpdateUserInput } from "@/domain/entities/user";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(input: UpdateUserInput): Promise<User>;
  findAllWithRemindersEnabled(): Promise<User[]>;
}
