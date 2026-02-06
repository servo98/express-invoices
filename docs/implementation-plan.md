# Express Invoices - Plan de Implementacion Completo

## Contexto

Sistema de gestion de facturas para agilizar la facturacion ante el SAT (Mexico). El usuario (Fernando Servin Victoria) factura mensualmente servicios de desarrollo de software a clientes extranjeros. El sistema automatizara la creacion de invoices comerciales (PDF), XML CFDI 4.0, y recordatorios via Discord con ASCII art memes.

**Estado actual:** Proyecto vacio - solo existen docs de referencia (invoice PDF, CFDI XML, plan.md).

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router, fullstack)
- **UI:** shadcn/ui + Tailwind CSS
- **Auth:** NextAuth v5 (Auth.js) con Google Provider
- **DB:** Prisma + SQLite (dev) / PostgreSQL (prod via Neon - free tier sin tarjeta)
- **PDF:** @react-pdf/renderer
- **XML:** xmlbuilder2
- **ZIP:** jszip
- **CFDI Timbrado:** Integracion con PAC (Finkok o SW Sapien)
- **Validacion:** Zod + React Hook Form
- **Deploy:** Vercel (con Cron Jobs para recordatorios)
- **Notificaciones:** Discord Webhooks
- **Email:** Nodemailer con SMTP/OAuth del usuario (envio desde su propia cuenta)
- **Tipo de cambio:** DOF (Diario Oficial de la Federacion) API

---

## Arquitectura: Hexagonal (Ports & Adapters)

La logica de negocio es 100% agnostica al framework. Estructura:

```
src/
  domain/           # Logica pura - CERO dependencias de Next.js/Prisma
    entities/       # Invoice, User, Settings, InvoiceItem
    value-objects/  # RFC, Money, MonthYear
    ports/          # Interfaces (repositories, services)
    use-cases/      # CreateInvoice, GeneratePDF, DownloadBundle, etc.

  infrastructure/   # Implementaciones concretas
    database/       # Prisma repositories
    services/       # PDF generator, XML generator, Discord, ASCII art
    di/             # Container de inyeccion de dependencias

  app/              # Next.js App Router (presentacion)
    (auth)/         # Login con Google
    (dashboard)/    # Dashboard, facturas, settings
    api/            # API routes + cron jobs
    actions/        # Server Actions

  components/       # UI Components (shadcn/ui + custom)
  lib/              # Utils, auth config, DB client, Zod schemas, hooks
```

---

## Esquema de Base de Datos

### Modelos principales:
- **User** - Datos de auth + perfil fiscal (RFC, razon social, regimen fiscal, CP, datos bancarios)
- **UserSettings** - Discord webhook, dia de recordatorio, datos default del receptor, tema
- **Invoice** - Factura mensual con todos los campos CFDI 4.0 (forma pago, metodo pago, moneda, tipo cambio, receptor, totales)
- **InvoiceItem** - Lineas de la factura (ClaveProdServ, ClaveUnidad, descripcion, importe)
- **InvoiceTax** - Impuestos (traslados/retenciones IVA/ISR)
- Constraint: `@@unique([userId, month, year])` - una factura por usuario por mes
- Tablas de NextAuth: Account, Session, VerificationToken

---

## Fases de Implementacion

### Fase 1: Setup del Proyecto (~15 archivos)
1. Inicializar Next.js con TypeScript, Tailwind, App Router, src dir
2. Configurar shadcn/ui (instalar: button, card, input, table, dialog, select, badge, skeleton, toast, dropdown-menu, avatar, sheet, tabs, separator)
3. Configurar Prisma con schema completo + push a SQLite
4. Configurar NextAuth v5 con Google provider + Prisma adapter
5. Middleware de proteccion de rutas
6. Sistema de temas (dark/pink/light) con CSS variables
7. Root layout con ThemeProvider y fuentes
8. `.env.example` con todas las variables necesarias

### Fase 2: Domain Layer (~25 archivos)
1. Entities: Invoice, InvoiceItem, User, Settings, CFDI types
2. Value Objects: RFC (validacion), Money (currency), MonthYear
3. Ports (interfaces): InvoiceRepository, UserRepository, SettingsRepository, PdfGenerator, CfdiXmlGenerator, ZipPackager, NotificationService, AsciiArtService
4. Use Cases: CreateInvoice, GetInvoice, ListInvoices, UpdateInvoice, DeleteInvoice, GenerateInvoicePdf, GenerateCfdiXml, DownloadInvoiceBundle, SendInvoiceReminder, ConfigureSettings

### Fase 3: Infrastructure Layer (~12 archivos)
1. Prisma repositories (Invoice, User, Settings)
2. PDF Generator con @react-pdf/renderer - replicando el layout exacto del invoice de referencia:
   - Header: "INVOICE" + UUID + fecha
   - Billed To: nombre empresa, direccion, telefono
   - Tabla: TASK | RATE | HOURS | TOTAL
   - Total Due
   - Payment Information (bank transfer details)
   - Footer: firma + nota
3. CFDI XML Generator con xmlbuilder2 - CFDI 4.0 con namespaces SAT:
   - Emisor (RFC, Nombre, RegimenFiscal: 626)
   - Receptor (RFC generico extranjero, ResidenciaFiscal, NumRegIdTrib)
   - Conceptos con ClaveProdServ: 81111810, ClaveUnidad: E48
   - Impuestos (IVA 0%, ISR 0% para clientes extranjeros)
4. JSZip packager
5. Discord webhook service
6. ASCII art fetcher (coleccion curada de 50+ memes, rotacion aleatoria mensual)
7. DI Container que conecta todo
8. Zod schemas para validacion

### Fase 4: UI - Auth y Dashboard (~20 archivos)
1. **Login page** - Google sign-in con branding de la app
2. **Dashboard layout** - Sidebar (desktop) + bottom nav (mobile)
3. **Dashboard home** - Stats cards + facturas recientes con Suspense boundaries
4. **Lista de facturas** - Vista mensual con MonthPicker, cards de resumen
5. **Nueva factura** - Formulario con pre-llenado desde settings
6. **Detalle de factura** - Vista completa con acciones (editar, descargar, preview)
7. **Preview PDF** - Visor de PDF con next/dynamic (lazy load)
8. **Settings** - Config de Discord, info fiscal, datos bancarios, tema

### Fase 5: API Routes + Server Actions + PAC Integration (~12 archivos)
1. NextAuth route handler
2. Server Actions: createInvoice, updateInvoice, deleteInvoice, updateSettings
3. API routes: GET /api/invoices/[id]/pdf, /xml, /bundle
4. `getCurrentUser()` con React.cache() para deduplicacion
5. PAC integration service (Finkok/SW Sapien) para timbrado CFDI real
6. DOF exchange rate fetcher (tipo de cambio oficial)
7. Email service con Nodemailer (SMTP/OAuth config por usuario)
8. Quick Clone server action

### Fase 6: Discord + Cron (~3 archivos)
1. Cron route: `/api/cron/send-reminders` (Vercel Cron, 1ro de cada mes 9AM UTC)
2. Logica: buscar usuarios con reminders habilitados, verificar si ya tienen factura del mes, enviar mensaje con ASCII art meme
3. `vercel.json` con config de cron

### Fase 7: Polish (~5 archivos)
1. Loading skeletons para Suspense fallbacks
2. Empty states
3. Error boundaries
4. loading.tsx para cada seccion

### Fase 8: Deploy
1. Configurar Vercel project
2. Configurar Neon PostgreSQL (free tier)
3. Migrar schema de SQLite a PostgreSQL
4. Configurar env vars en Vercel (Google OAuth, Neon DB URL, PAC credentials, CRON_SECRET)
5. Deploy y verificar cron jobs
6. Configurar dominio (opcional)

---

## Funcionalidades Adicionales (confirmadas)

### Incluidas desde el inicio:

1. **Quick Clone Invoice** - Un clic para duplicar la factura del mes anterior al mes actual, actualizando solo fechas y descripcion del periodo. Boton prominente en el dashboard y lista de facturas.

2. **Email desde cuenta propia del usuario** - El usuario configura su SMTP o token OAuth (Gmail, Outlook) en Settings. El correo se envia DESDE su propia cuenta como si el lo hubiera redactado. Adjunta el bundle ZIP. Usa Nodemailer con configuracion SMTP o Google OAuth2 para Gmail.

3. **Tipo de cambio del DOF** - Obtener el tipo de cambio oficial USD/MXN del Diario Oficial de la Federacion (no Banxico). Auto-fill del campo tipoCambio al crear factura. Mostrar fecha de publicacion del tipo de cambio.

4. **Integracion con PAC para timbrado CFDI** - Conectar con un PAC (Finkok o SW Sapien) para timbrar facturas CFDI reales ante el SAT. Requiere certificados CSD (.cer y .key) del usuario. Flujo: generar XML base -> enviar a PAC -> recibir XML timbrado con sello y UUID fiscal.

### Considerar para futuro:

5. **Dashboard Analytics con graficas** - Tendencias de facturacion mensual.
6. **Templates de factura** - Templates reutilizables por tipo de servicio.
7. **Timeline de status** - Auditoria visual del ciclo de vida.
8. **Atajos de teclado** - Ctrl+N, Ctrl+D, Ctrl+P.
9. **PWA** - Instalar en mobile con cache offline.

---

## Best Practices de Vercel Aplicadas

| Practica | Donde se aplica |
|----------|----------------|
| Server Components por default | Todas las paginas de listado, detalle, stats, layouts |
| Client Components solo cuando es necesario | Forms, theme toggle, month picker, mobile nav |
| `React.cache()` | `getCurrentUser()` - llamado en multiples Server Components por request |
| `Promise.all()` | Download bundle (PDF + XML en paralelo), dashboard (stats + invoices) |
| `next/dynamic` | PDF viewer (pesado, solo cliente) |
| Suspense boundaries | Dashboard (stats, recent invoices), lista de facturas |
| Imports directos (no barrel files) | Todos los imports de componentes son directos |
| `after()` | Confirmacion Discord despues de crear factura |
| Mobile-first | Todos los estilos Tailwind empiezan mobile, luego `sm:`, `md:`, `lg:` |
| Server Actions con auth | Cada Server Action verifica sesion + ownership |
| Zod en Server Actions | Todos los inputs validados con Zod |

---

## Archivos Criticos

- `prisma/schema.prisma` - Schema completo, todo depende de esto
- `src/infrastructure/di/container.ts` - Conecta ports con adapters
- `src/infrastructure/services/react-pdf-generator.ts` - Replica exacta del invoice PDF de referencia
- `src/infrastructure/services/cfdi-xml-generator-impl.ts` - CFDI 4.0 con namespaces SAT correctos
- `src/domain/use-cases/download-invoice-bundle.ts` - Orquesta el workflow principal

---

## Verificacion

1. **Auth:** Login con Google -> redireccion a dashboard -> logout funciona
2. **CRUD:** Crear factura -> aparece en lista -> editar -> eliminar
3. **PDF:** Generar PDF -> comparar visualmente con `docs/january-2026.pdf`
4. **XML:** Generar XML -> validar estructura contra `docs/384123a7-...xml`
5. **ZIP:** Descargar bundle -> verificar que contiene PDF + XML
6. **Discord:** Configurar webhook -> trigger manual del cron -> verificar mensaje con ASCII art en canal
7. **Temas:** Cambiar entre dark/pink/light -> todos los componentes respetan el tema
8. **Mobile:** Probar en viewport movil -> navegacion bottom tab, formularios responsive
9. **Deploy:** `vercel deploy` -> verificar que todo funciona en produccion
