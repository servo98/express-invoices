"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-utils";
import { container } from "@/infrastructure/di/container";
import { createInvoiceSchema, updateInvoiceSchema } from "@/lib/schemas";

export async function createInvoiceAction(formData: FormData) {
  const user = await requireUser();

  const raw = Object.fromEntries(formData.entries());

  // Parse items from form data
  const items: any[] = [];
  let i = 0;
  while (raw[`items.${i}.descripcion`]) {
    items.push({
      claveProdServ: raw[`items.${i}.claveProdServ`] || "81111810",
      cantidad: Number(raw[`items.${i}.cantidad`]) || 1,
      claveUnidad: raw[`items.${i}.claveUnidad`] || "E48",
      unidad: raw[`items.${i}.unidad`] || "Unidad de servicio",
      descripcion: raw[`items.${i}.descripcion`],
      valorUnitario: Number(raw[`items.${i}.valorUnitario`]) || 0,
      importe: Number(raw[`items.${i}.importe`]) || 0,
      objetoImp: raw[`items.${i}.objetoImp`] || "02",
    });
    i++;
  }

  const parsed = createInvoiceSchema.safeParse({
    ...raw,
    items,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const invoice = await container.createInvoice.execute({
      ...parsed.data,
      userId: user.id,
      lugarExpedicion: parsed.data.lugarExpedicion || user.codigoPostal || undefined,
    });

    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    redirect(`/invoices/${invoice.id}`);
  } catch (e: any) {
    if (e.message === "NEXT_REDIRECT") throw e;
    return { error: { _form: [e.message] } };
  }
}

export async function updateInvoiceAction(formData: FormData) {
  const user = await requireUser();

  const raw = Object.fromEntries(formData.entries());

  const items: any[] = [];
  let i = 0;
  while (raw[`items.${i}.descripcion`]) {
    items.push({
      claveProdServ: raw[`items.${i}.claveProdServ`] || "81111810",
      cantidad: Number(raw[`items.${i}.cantidad`]) || 1,
      claveUnidad: raw[`items.${i}.claveUnidad`] || "E48",
      unidad: raw[`items.${i}.unidad`] || "Unidad de servicio",
      descripcion: raw[`items.${i}.descripcion`],
      valorUnitario: Number(raw[`items.${i}.valorUnitario`]) || 0,
      importe: Number(raw[`items.${i}.importe`]) || 0,
      objetoImp: raw[`items.${i}.objetoImp`] || "02",
    });
    i++;
  }

  const parsed = updateInvoiceSchema.safeParse({
    ...raw,
    items: items.length > 0 ? items : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await container.updateInvoice.execute(
      { ...parsed.data, userId: user.id },
      user.id,
    );

    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${parsed.data.id}`);
    return { success: true };
  } catch (e: any) {
    return { error: { _form: [e.message] } };
  }
}

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

export async function timbrarInvoiceAction(invoiceId: string) {
  const user = await requireUser();

  try {
    await container.timbrarInvoice.execute(invoiceId, user.id);

    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);
    return { success: true };
  } catch (e: any) {
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

export async function cloneInvoiceAction(invoiceId?: string) {
  const user = await requireUser();

  try {
    let invoice;
    if (invoiceId) {
      invoice = await container.cloneInvoice.execute(invoiceId, user.id);
    } else {
      invoice = await container.cloneInvoice.cloneLatest(user.id);
    }

    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    redirect(`/invoices/${invoice.id}`);
  } catch (e: any) {
    if (e.message === "NEXT_REDIRECT") throw e;
    return { error: e.message };
  }
}
