"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-utils";
import { container } from "@/infrastructure/di/container";
import { updateSettingsSchema, updateUserSchema } from "@/lib/schemas";
import { db } from "@/lib/db";

export async function updateSettingsAction(formData: FormData) {
  const user = await requireUser();
  const raw = Object.fromEntries(formData.entries());

  // Handle checkbox (reminderEnabled)
  const data = {
    ...raw,
    reminderEnabled: raw.reminderEnabled === "on" || raw.reminderEnabled === "true",
    discordWebhookUrl: raw.discordWebhookUrl || null,
  };

  const parsed = updateSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await container.configureSettings.update({
      userId: user.id,
      ...parsed.data,
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (e: any) {
    return { error: { _form: [e.message] } };
  }
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const raw = Object.fromEntries(formData.entries());

  const parsed = updateUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await db.user.update({
      where: { id: user.id },
      data: parsed.data,
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (e: any) {
    return { error: { _form: [e.message] } };
  }
}
