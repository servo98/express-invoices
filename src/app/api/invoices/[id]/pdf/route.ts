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

    // Accountant can access any invoice
    if (user?.role === "accountant") {
      const invoice = await container.invoiceRepo.findByIdUnscoped(id);
      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }
      const owner = await container.userRepo.findById(invoice.userId);
      if (!owner) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const pdf = await container.pdfGenerator.generate(invoice, owner);
      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="invoice-${id}.pdf"`,
        },
      });
    }

    const pdf = await container.generatePdf.execute(id, session.user.id);

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${id}.pdf"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
