export type InvoiceStatus = "draft" | "issued" | "timbrado" | "sent" | "paid";

export interface InvoiceItem {
  id?: string;
  claveProdServ: string;
  cantidad: number;
  claveUnidad: string;
  unidad: string;
  descripcion: string;
  valorUnitario: number;
  importe: number;
  objetoImp: string;
}

export interface InvoiceTax {
  id?: string;
  tipo: "traslado" | "retencion";
  impuesto: string; // "002" IVA, "001" ISR
  base: number;
  tipoFactor: string;
  tasaOCuota: number;
  importe: number;
}

export interface Invoice {
  id: string;
  uuid: string;
  userId: string;
  month: number;
  year: number;
  fecha: Date;

  // CFDI
  formaPago: string;
  metodoPago: string;
  moneda: string;
  tipoCambio: number | null;
  lugarExpedicion: string | null;
  exportacion: string;
  tipoComprobante: string;

  // Receptor
  receptorNombre: string | null;
  receptorRfc: string;
  receptorCp: string | null;
  residenciaFiscal: string | null;
  numRegIdTrib: string | null;
  regimenFiscalReceptor: string | null;
  usoCfdi: string;

  // Commercial invoice (Billed To)
  billedToName: string | null;
  billedToAddress: string | null;
  billedToPhone: string | null;

  // Totals
  subtotal: number;
  totalImpuestosTrasladados: number;
  totalImpuestosRetenidos: number;
  total: number;

  // Payment
  paymentReference: string | null;

  // Status
  status: InvoiceStatus;

  // Timbrado
  cfdiXml: string | null;
  cfdiSelloCfd: string | null;
  cfdiSelloSat: string | null;
  cfdiFechaTimbrado: string | null;
  cfdiNoCertificadoSat: string | null;
  cfdiCadenaOriginal: string | null;

  // Relations
  items: InvoiceItem[];
  taxes: InvoiceTax[];

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceInput {
  userId: string;
  month: number;
  year: number;
  fecha?: Date;
  formaPago?: string;
  metodoPago?: string;
  moneda?: string;
  tipoCambio?: number | null;
  lugarExpedicion?: string;
  exportacion?: string;
  receptorNombre?: string;
  receptorRfc?: string;
  receptorCp?: string;
  residenciaFiscal?: string;
  numRegIdTrib?: string;
  regimenFiscalReceptor?: string;
  usoCfdi?: string;
  billedToName?: string;
  billedToAddress?: string;
  billedToPhone?: string;
  paymentReference?: string;
  items: Omit<InvoiceItem, "id">[];
}

export interface UpdateInvoiceInput extends Partial<CreateInvoiceInput> {
  id: string;
  status?: InvoiceStatus;
  cfdiXml?: string | null;
  cfdiSelloCfd?: string | null;
  cfdiSelloSat?: string | null;
  cfdiFechaTimbrado?: string | null;
  cfdiNoCertificadoSat?: string | null;
  cfdiCadenaOriginal?: string | null;
}
