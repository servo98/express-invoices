import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { container } from "@/infrastructure/di/container";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await container.exchangeRateService.getUsdToMxn();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
