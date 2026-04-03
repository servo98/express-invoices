"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, requireAccountant } from "@/lib/auth-utils";
import { container } from "@/infrastructure/di/container";

export async function deleteInvoiceAction(invoiceId: string) {
  const user = await requireUser();

  try {
    await container.deleteInvoice.execute(invoiceId, user.id);
    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function uploadInvoiceAction(formData: FormData) {
  const user = await requireAccountant();

  const freelancerId = formData.get("freelancerId") as string;
  const xmlFile = formData.get("xmlFile") as File | null;
  const pdfFile = formData.get("pdfFile") as File | null;

  if (!freelancerId) {
    return { error: "Please select a freelancer" };
  }

  if (!xmlFile || xmlFile.size === 0) {
    return { error: "XML file is required" };
  }

  if (!pdfFile || pdfFile.size === 0) {
    return { error: "PDF file is required" };
  }

  if (!xmlFile.name.endsWith(".xml")) {
    return { error: "XML file must have .xml extension" };
  }

  if (!pdfFile.name.endsWith(".pdf")) {
    return { error: "PDF file must have .pdf extension" };
  }

  try {
    const xmlContent = await xmlFile.text();
    const pdfArrayBuffer = await pdfFile.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    const invoice = await container.uploadInvoice.execute(
      freelancerId,
      xmlContent,
      pdfBuffer,
      user.id,
    );

    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    redirect(`/invoices/${invoice.id}`);
  } catch (e: any) {
    if (e.message === "NEXT_REDIRECT") throw e;
    return { error: e.message };
  }
}

export async function sendInvoiceEmailAction(formData: FormData) {
  const user = await requireUser();

  const invoiceId = formData.get("invoiceId") as string;
  const to = formData.get("to") as string;
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;

  if (!invoiceId || !to || !subject) {
    return { error: "Missing required fields" };
  }

  if (!user.smtpHost || !user.smtpUser || !user.smtpPass) {
    return { error: "SMTP not configured. Go to Settings to configure email." };
  }

  try {
    const zip = await container.downloadBundle.execute(invoiceId, user.id);

    await container.emailService.sendInvoice({
      to,
      subject,
      body: body || `Please find attached the invoice for your records.`,
      attachments: [{ filename: `invoice-${invoiceId}.zip`, content: Buffer.from(zip) }],
      smtpConfig: {
        host: user.smtpHost,
        port: user.smtpPort || 587,
        user: user.smtpUser,
        pass: user.smtpPass,
      },
    });

    revalidatePath(`/invoices/${invoiceId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
