import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { container } from "@/infrastructure/di/container";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const zip = user?.role === "accountant"
      ? await container.downloadBundle.executeUnscoped(id)
      : await container.downloadBundle.execute(id, session.user.id);

    return new NextResponse(new Uint8Array(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="invoice-${id}.zip"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
