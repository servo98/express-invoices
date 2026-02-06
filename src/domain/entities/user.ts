export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;

  // Fiscal data (Emisor)
  rfc: string | null;
  razonSocial: string | null;
  regimenFiscal: string | null;
  codigoPostal: string | null;

  // Bank details
  bankName: string | null;
  accountNumber: string | null;
  routingNumber: string | null;
  accountType: string | null;
  bankCurrency: string | null;
  beneficiary: string | null;

  // Email config
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPass: string | null;
}

export interface UpdateUserInput {
  id: string;
  name?: string;
  rfc?: string;
  razonSocial?: string;
  regimenFiscal?: string;
  codigoPostal?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountType?: string;
  bankCurrency?: string;
  beneficiary?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}
