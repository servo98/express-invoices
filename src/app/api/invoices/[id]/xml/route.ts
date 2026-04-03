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

    // Accountant can access any invoice, freelancer only their own
    const invoice = user?.role === "accountant"
      ? await container.invoiceRepo.findByIdUnscoped(id)
      : await container.invoiceRepo.findById(id, session.user.id);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (!invoice.cfdiXml) {
      return NextResponse.json({ error: "No XML available" }, { status: 404 });
    }

    return new NextResponse(invoice.cfdiXml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `inline; filename="cfdi-${id}.xml"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
