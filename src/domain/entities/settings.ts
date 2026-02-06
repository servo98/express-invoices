export interface UserSettings {
  id: string;
  userId: string;

  // Discord
  discordWebhookUrl: string | null;
  reminderEnabled: boolean;
  reminderDay: number;

  // Default receptor
  defaultReceptorName: string | null;
  defaultReceptorRfc: string | null;
  defaultReceptorCp: string | null;
  defaultResidenciaFiscal: string | null;
  defaultNumRegIdTrib: string | null;
  defaultRegimenFiscalReceptor: string | null;
  defaultUsoCfdi: string | null;

  // Default invoice
  defaultFormaPago: string | null;
  defaultMetodoPago: string | null;
  defaultMoneda: string | null;
  defaultClaveProdServ: string | null;
  defaultClaveUnidad: string | null;
  defaultUnidad: string | null;
  defaultDescription: string | null;
  defaultRate: number | null;

  // Theme
  theme: string;
}

export interface UpdateSettingsInput {
  userId: string;
  discordWebhookUrl?: string | null;
  reminderEnabled?: boolean;
  reminderDay?: number;
  defaultReceptorName?: string;
  defaultReceptorRfc?: string;
  defaultReceptorCp?: string;
  defaultResidenciaFiscal?: string;
  defaultNumRegIdTrib?: string;
  defaultRegimenFiscalReceptor?: string;
  defaultUsoCfdi?: string;
  defaultFormaPago?: string;
  defaultMetodoPago?: string;
  defaultMoneda?: string;
  defaultClaveProdServ?: string;
  defaultClaveUnidad?: string;
  defaultUnidad?: string;
  defaultDescription?: string;
  defaultRate?: number;
  theme?: string;
}
