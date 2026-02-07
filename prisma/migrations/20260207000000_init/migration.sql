-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "rfc" TEXT,
    "razonSocial" TEXT,
    "regimenFiscal" TEXT DEFAULT '626',
    "codigoPostal" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "routingNumber" TEXT,
    "accountType" TEXT DEFAULT 'Checking',
    "bankCurrency" TEXT DEFAULT 'USD',
    "beneficiary" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUser" TEXT,
    "smtpPass" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "discordWebhookUrl" TEXT,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reminderDay" INTEGER NOT NULL DEFAULT 1,
    "defaultReceptorName" TEXT,
    "defaultReceptorRfc" TEXT DEFAULT 'XEXX010101000',
    "defaultReceptorCp" TEXT,
    "defaultResidenciaFiscal" TEXT DEFAULT 'USA',
    "defaultNumRegIdTrib" TEXT,
    "defaultRegimenFiscalReceptor" TEXT DEFAULT '616',
    "defaultUsoCfdi" TEXT DEFAULT 'S01',
    "defaultFormaPago" TEXT DEFAULT '99',
    "defaultMetodoPago" TEXT DEFAULT 'PPD',
    "defaultMoneda" TEXT DEFAULT 'USD',
    "defaultClaveProdServ" TEXT DEFAULT '81111810',
    "defaultClaveUnidad" TEXT DEFAULT 'E48',
    "defaultUnidad" TEXT DEFAULT 'Unidad de servicio',
    "defaultDescription" TEXT DEFAULT 'Professional software development services',
    "defaultRate" DOUBLE PRECISION DEFAULT 3500,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formaPago" TEXT NOT NULL DEFAULT '99',
    "metodoPago" TEXT NOT NULL DEFAULT 'PPD',
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "tipoCambio" DOUBLE PRECISION,
    "lugarExpedicion" TEXT,
    "exportacion" TEXT NOT NULL DEFAULT '01',
    "tipoComprobante" TEXT NOT NULL DEFAULT 'I',
    "receptorNombre" TEXT,
    "receptorRfc" TEXT NOT NULL DEFAULT 'XEXX010101000',
    "receptorCp" TEXT,
    "residenciaFiscal" TEXT DEFAULT 'USA',
    "numRegIdTrib" TEXT,
    "regimenFiscalReceptor" TEXT DEFAULT '616',
    "usoCfdi" TEXT NOT NULL DEFAULT 'S01',
    "billedToName" TEXT,
    "billedToAddress" TEXT,
    "billedToPhone" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalImpuestosTrasladados" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalImpuestosRetenidos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "cfdiXml" TEXT,
    "cfdiSelloCfd" TEXT,
    "cfdiSelloSat" TEXT,
    "cfdiFechaTimbrado" TEXT,
    "cfdiNoCertificadoSat" TEXT,
    "cfdiCadenaOriginal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "claveProdServ" TEXT NOT NULL DEFAULT '81111810',
    "cantidad" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "claveUnidad" TEXT NOT NULL DEFAULT 'E48',
    "unidad" TEXT NOT NULL DEFAULT 'Unidad de servicio',
    "descripcion" TEXT NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "importe" DOUBLE PRECISION NOT NULL,
    "objetoImp" TEXT NOT NULL DEFAULT '02',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceTax" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "impuesto" TEXT NOT NULL,
    "base" DOUBLE PRECISION NOT NULL,
    "tipoFactor" TEXT NOT NULL DEFAULT 'Tasa',
    "tasaOCuota" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "importe" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "InvoiceTax_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_uuid_key" ON "Invoice"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_userId_month_year_key" ON "Invoice"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceTax" ADD CONSTRAINT "InvoiceTax_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

