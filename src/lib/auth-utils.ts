import { cache } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { settings: true },
  });

  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireFreelancer() {
  const user = await requireUser();
  if (user.role !== "freelancer") redirect("/dashboard");
  return user;
}

export async function requireAccountant() {
  const user = await requireUser();
  if (user.role !== "accountant") redirect("/dashboard");
  return user;
}
