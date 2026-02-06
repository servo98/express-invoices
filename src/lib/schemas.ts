import { z } from "zod";

export const invoiceItemSchema = z.object({
  claveProdServ: z.string().default("81111810"),
  cantidad: z.coerce.number().min(0.01),
  claveUnidad: z.string().default("E48"),
  unidad: z.string().default("Unidad de servicio"),
  descripcion: z.string().min(1, "Description is required"),
  valorUnitario: z.coerce.number().min(0),
  importe: z.coerce.number().min(0),
  objetoImp: z.string().default("02"),
});

export const createInvoiceSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2100),
  formaPago: z.string().default("99"),
  metodoPago: z.string().default("PPD"),
  moneda: z.string().default("USD"),
  tipoCambio: z.coerce.number().nullable().optional(),
  lugarExpedicion: z.string().optional(),
  exportacion: z.string().default("01"),
  receptorNombre: z.string().optional(),
  receptorRfc: z.string().default("XEXX010101000"),
  receptorCp: z.string().optional(),
  residenciaFiscal: z.string().optional(),
  numRegIdTrib: z.string().optional(),
  regimenFiscalReceptor: z.string().optional(),
  usoCfdi: z.string().default("S01"),
  billedToName: z.string().optional(),
  billedToAddress: z.string().optional(),
  billedToPhone: z.string().optional(),
  paymentReference: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  id: z.string(),
  status: z.enum(["draft", "issued", "timbrado", "sent", "paid"]).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  rfc: z.string().optional(),
  razonSocial: z.string().optional(),
  regimenFiscal: z.string().optional(),
  codigoPostal: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  accountType: z.string().optional(),
  bankCurrency: z.string().optional(),
  beneficiary: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
});

export const updateSettingsSchema = z.object({
  discordWebhookUrl: z.string().url().nullable().optional(),
  reminderEnabled: z.boolean().optional(),
  reminderDay: z.coerce.number().min(1).max(28).optional(),
  defaultReceptorName: z.string().optional(),
  defaultReceptorRfc: z.string().optional(),
  defaultReceptorCp: z.string().optional(),
  defaultResidenciaFiscal: z.string().optional(),
  defaultNumRegIdTrib: z.string().optional(),
  defaultRegimenFiscalReceptor: z.string().optional(),
  defaultUsoCfdi: z.string().optional(),
  defaultFormaPago: z.string().optional(),
  defaultMetodoPago: z.string().optional(),
  defaultMoneda: z.string().optional(),
  defaultClaveProdServ: z.string().optional(),
  defaultClaveUnidad: z.string().optional(),
  defaultUnidad: z.string().optional(),
  defaultDescription: z.string().optional(),
  defaultRate: z.coerce.number().optional(),
  theme: z.enum(["light", "dark", "pink"]).optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
