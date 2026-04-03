# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Invoice management system for Mexican freelancers billing foreign clients. The accountant (Germo) creates and timbra facturas CFDI externally, then uploads the timbrado PDF + XML to this system. The system parses the XML, generates a commercial invoice PDF (in English), bundles everything in a ZIP, and notifies the freelancer via Discord.

### Roles
- **Freelancer** (Fernando, Beto): Views own invoices, downloads ZIPs, configures settings, manages user roles
- **Accountant** (Germo): Uploads timbrado PDF+XML for any freelancer, views all invoices

## Tech Stack

- **Framework:** Next.js 16 (App Router, fullstack)
- **UI:** shadcn/ui (new-york style) + Tailwind CSS v4
- **Auth:** NextAuth v5 (Auth.js) with Discord Provider
- **DB:** Prisma + PostgreSQL (Neon)
- **PDF:** @react-pdf/renderer
- **XML:** xmlbuilder2 (for parsing CFDI XML)
- **Validation:** Zod + React Hook Form
- **Notifications:** Discord Webhooks, Nodemailer (SMTP)

## Development Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type-check without emitting
npx prisma db push   # Push schema changes to DB
npx prisma studio    # Open Prisma Studio GUI
```

No test framework is configured. Validate changes with `npx tsc --noEmit` and `npm run build`.

## Architecture (Hexagonal / Ports & Adapters)

```
src/
  domain/              # Pure business logic, ZERO framework dependencies
    entities/          # Invoice, User, Settings (TypeScript interfaces)
    value-objects/     # RFC, Money, MonthYear (pure functions)
    ports/             # Repository & service interfaces
    use-cases/         # One class per operation (VerbNounUseCase)
  infrastructure/      # Concrete implementations
    database/          # Prisma repositories (map Prisma→domain types)
    services/          # PDF, XML Parser, ZIP, Discord, Email, Exchange Rate
    di/container.ts    # Singleton DI container wiring all ports→adapters
  app/                 # Next.js App Router (presentation layer)
    (auth)/            # Unauthenticated routes (login)
    (dashboard)/       # Authenticated routes (dashboard, invoices, settings, admin)
    actions/           # Server actions (invoice-actions.ts, settings-actions.ts, admin-actions.ts)
    api/               # API routes (PDF/XML/bundle download, cron, exchange-rate)
  components/          # UI components (ui/, layout/, invoices/, settings/, admin/)
  lib/                 # auth.ts, auth-utils.ts, db.ts, schemas.ts, utils.ts
```

### Data Flow (Upload)

1. Accountant uploads PDF+XML → `uploadInvoiceAction(formData)`
2. Action calls `requireAccountant()` → reads files → calls `container.uploadInvoice.execute()`
3. Use case parses XML → creates Invoice record → sets status to "timbrado" → sends Discord notification
4. Freelancer views invoice → downloads ZIP (timbrado PDF + commercial PDF)

### DI Container (`src/infrastructure/di/container.ts`)

- Repositories and services are **singletons** (created once at module load)
- Use cases are created on-demand via **getters**: `get uploadInvoice() { return new UploadInvoiceUseCase(...); }`
- All use cases accessed as `container.uploadInvoice`, `container.listInvoices`, etc.

### Import Aliases

All imports use `@/*` mapped to `./src/*` (configured in tsconfig.json).

## Key Patterns

- **Server Components by default**, Client Components (`"use client"`) only for interactivity
- `getCurrentUser()` in `src/lib/auth-utils.ts` uses `React.cache()` for request deduplication — use in Server Components
- `requireUser()` for auth enforcement — use in Server Actions (redirects to `/login` if unauthenticated)
- `requireFreelancer()` / `requireAccountant()` for role enforcement — redirect to `/dashboard` if wrong role
- All inputs validated with Zod schemas in `src/lib/schemas.ts`
- Server actions return `{ error: string }` or `{ success: true }` — handle errors in UI via `useActionState()`
- `redirect()` in server actions must be wrapped — it throws `NEXT_REDIRECT` internally

### Role System

| Action | Freelancer | Accountant |
|--------|-----------|------------|
| View own invoices | Yes | No |
| View all invoices | No | Yes |
| Upload PDF+XML | No | Yes |
| Download PDF/XML/ZIP | Yes | Yes |
| Configure settings | Yes | No |
| Manage roles (admin) | Yes | No |

### Naming Conventions

- Use cases: `VerbNounUseCase` (e.g., `UploadInvoiceUseCase`)
- Server actions: `verbNounAction` (e.g., `uploadInvoiceAction`)
- Repositories: `PrismaEntityRepository` (e.g., `PrismaInvoiceRepository`)
- Services: `ToolNameImpl` or `ToolNameService` (e.g., `CfdiXmlParserImpl`)

## Next.js 16 Gotchas

- **Dynamic route params are Promises**: `params: Promise<{ id: string }>` — must `await params` in page/route components
- **searchParams are Promises too**: must `await searchParams`
- **`Buffer` not assignable to `BodyInit`**: wrap with `new Uint8Array(buffer)` in API route responses

## Prisma / Database

- PostgreSQL (Neon) for production
- Invoice has `@@unique([userId, month, year])` constraint (one invoice per month per user)
- Cascade deletes on all relations (InvoiceItem, InvoiceTax → Invoice)
- Repositories map Prisma results to domain entity interfaces (domain types are NOT Prisma types)
- `User.role` field: `"freelancer"` (default) or `"accountant"`
- `Invoice.timbradoPdf` (Bytes): stores the uploaded timbrado PDF
- `Invoice.uploadedBy`: tracks which user uploaded the files

## Adding New Features

**New entity**: domain entity → port interface → use case → Prisma repo → wire in container → `prisma db push` → server actions → UI

**New service**: define interface in `src/domain/ports/services.ts` → implement in `src/infrastructure/services/` → register in container → inject into use cases
