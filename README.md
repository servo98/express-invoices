# Express Invoices

Sistema de facturacion para freelancers mexicanos que facturan a clientes extranjeros. Genera CFDI 4.0 XML, invoices comerciales en PDF, bundles ZIP, y manda recordatorios por Discord con ASCII art.

## Requisitos

- Node.js 18+
- npm

## Setup rapido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus valores (ver seccion abajo).

### 3. Crear la base de datos

```bash
npx prisma db push
```

### 4. Levantar el servidor

```bash
npm run dev
```

Abre http://localhost:3000 - te redirige al login con Google.

---

## Variables de entorno

### Obligatorias para desarrollo

| Variable | Que es | Como obtenerla |
|----------|--------|----------------|
| `DATABASE_URL` | Conexion a la BD | Ya viene como `file:./dev.db` (SQLite local), no tocar para dev |
| `AUTH_SECRET` | Secret para NextAuth | Ejecuta `npx auth secret` y copia el valor generado |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | Ver seccion "Google OAuth" abajo |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | Ver seccion "Google OAuth" abajo |

### Opcionales

| Variable | Que es | Cuando la necesitas |
|----------|--------|---------------------|
| `CRON_SECRET` | Token para proteger el cron endpoint | Solo en produccion (Vercel) |
| `NEXT_PUBLIC_APP_URL` | URL de la app | Default: `http://localhost:3000` |
| `PAC_PROVIDER` | `finkok` o `swsapien` | Solo si quieres timbrar CFDIs reales |
| `PAC_USERNAME` | Usuario del PAC | Solo si quieres timbrar CFDIs reales |
| `PAC_PASSWORD` | Password del PAC | Solo si quieres timbrar CFDIs reales |
| `PAC_ENVIRONMENT` | `sandbox` o `production` | Solo si quieres timbrar CFDIs reales |

---

## Como obtener los tokens

### Google OAuth (obligatorio)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo (o usa uno existente)
3. Ve a **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Tipo: **Web application**
6. En **Authorized redirect URIs** agrega:
   - `http://localhost:3000/api/auth/callback/google`
7. Copia el **Client ID** → `AUTH_GOOGLE_ID`
8. Copia el **Client Secret** → `AUTH_GOOGLE_SECRET`

> Nota: La primera vez te puede pedir configurar la "OAuth consent screen". Ponla en modo "External" y agrega tu email como test user.

### Discord Webhook (para recordatorios mensuales)

Los recordatorios se mandan el 1ro de cada mes con un ASCII art meme aleatorio al canal que configures.

1. Abre Discord y ve al **servidor** donde quieres los recordatorios
2. Click derecho en el **canal** > **Edit Channel** (o el engranaje)
3. Ve a **Integrations** en el menu de la izquierda
4. Click **Webhooks**
5. Click **New Webhook**
6. Ponle nombre (ej: `Invoice Bot`) y selecciona el canal
7. Click **Copy Webhook URL** - se ve algo asi:
   ```
   https://discord.com/api/webhooks/123456789/abcdefg...
   ```
8. Ahora en la app, ve a **Settings** (desde el dashboard)
9. En la seccion **Discord**, pega la Webhook URL
10. Activa **Reminder Enabled**
11. Guarda

Para probar que funciona, puedes hacer un GET manual al endpoint del cron:
```bash
curl http://localhost:3000/api/cron/send-reminders
```
Si todo esta bien, te llega un mensaje a Discord con un ASCII art.

### PAC para timbrado CFDI (opcional)

Sin PAC la app funciona normal: genera XML y PDF sin timbrar. El timbrado es lo que hace que tu factura sea **valida ante el SAT** (le agrega sello digital, UUID fiscal, y cadena original).

La app soporta 2 PACs: **Finkok** y **SW Sapien**.

---

#### Opcion A: Finkok (recomendado)

Tiene sandbox gratuito, no pide tarjeta.

1. Ve a [https://www.finkok.com/](https://www.finkok.com/)
2. Click en **"Registro"** o **"Crear cuenta"**
3. Llena el formulario con tus datos
4. Te llega un correo con tus credenciales de **sandbox** (ambiente de pruebas)
5. Guarda el **usuario** (email) y **password** que te dan

Agrega esto a tu `.env`:
```
PAC_PROVIDER="finkok"
PAC_USERNAME="tu-email@ejemplo.com"
PAC_PASSWORD="tu-password-de-finkok"
PAC_ENVIRONMENT="sandbox"
```

> Para timbrar facturas **reales** (produccion), necesitas contratar un paquete de timbres con Finkok y cambiar `PAC_ENVIRONMENT="production"`.

#### Opcion B: SW Sapien

1. Ve a [https://sw.com.mx/](https://sw.com.mx/)
2. Registrate y solicita acceso al sandbox
3. Te dan credenciales de prueba por email

Agrega esto a tu `.env`:
```
PAC_PROVIDER="swsapien"
PAC_USERNAME="tu-usuario-sw"
PAC_PASSWORD="tu-password-sw"
PAC_ENVIRONMENT="sandbox"
```

---

#### Requisitos para timbrar

Antes de timbrar una factura, necesitas tener configurado en **Settings** de la app:

| Campo | Ejemplo | Donde |
|-------|---------|-------|
| RFC del emisor | `SEVF990101ABC` | Settings > Profile > RFC |
| Razon social | `FERNANDO SERVIN VICTORIA` | Settings > Profile > Razon Social |
| Regimen fiscal | `626` (RESICO) | Settings > Profile > Regimen Fiscal |
| Codigo postal | `76100` | Settings > Profile > Codigo Postal |

#### Como timbrar una factura

1. Crea una factura normalmente desde **New Invoice**
2. Llena todos los campos (receptor, items, moneda, etc.)
3. Ve al detalle de la factura
4. Click en el boton **"Timbrar CFDI"**
5. Si todo sale bien:
   - El status cambia a **timbrado**
   - Se guarda el XML timbrado con sello del SAT
   - Aparece la seccion "Timbrado CFDI" con la fecha y certificado

#### Errores comunes de timbrado

| Error | Solucion |
|-------|----------|
| "PAC service is not configured" | Falta agregar las variables `PAC_*` en `.env` y reiniciar |
| "User RFC is required" | Ve a Settings y configura tu RFC |
| Error de estructura XML | Verifica que todos los campos CFDI esten llenos (moneda, forma pago, uso CFDI, etc.) |
| "Comprobante duplicado" | Ya existe una factura timbrada para ese mes/receptor |

#### Sandbox vs Produccion

| | Sandbox | Produccion |
|--|---------|------------|
| Costo | Gratis | Pagas por timbre |
| XML valido ante SAT | No | Si |
| Necesitas CSD (.cer/.key) | No | Si |
| Para que sirve | Probar que todo funciona | Facturar de verdad |

### SMTP para envio de emails (opcional)

Se configura desde **Settings** dentro de la app (no en .env). Ejemplo para Gmail:

| Campo | Valor |
|-------|-------|
| SMTP Host | `smtp.gmail.com` |
| SMTP Port | `587` |
| SMTP User | tu correo Gmail |
| SMTP Pass | un [App Password](https://myaccount.google.com/apppasswords) (no tu password normal) |

---

## Comandos utiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de produccion
npm run lint         # Linter
npx prisma studio    # Explorar la BD en el navegador
npx prisma db push   # Aplicar cambios al schema
```

## Stack

Next.js 16 · Prisma · shadcn/ui · Tailwind CSS · NextAuth v5 · @react-pdf/renderer · xmlbuilder2 · jszip · Nodemailer · Zod
