"use server";

import { revalidatePath } from "next/cache";
import { requireFreelancer } from "@/lib/auth-utils";
import { container } from "@/infrastructure/di/container";

export async function updateUserRoleAction(userId: string, role: string) {
  await requireFreelancer();

  if (role !== "freelancer" && role !== "accountant") {
    return { error: "Invalid role" };
  }

  try {
    await container.userRepo.updateRole(userId, role);
    revalidatePath("/admin");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
