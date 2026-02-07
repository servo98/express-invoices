# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Invoice management system for Mexican freelancers billing foreign clients. Automates CFDI 4.0 XML generation, commercial invoice PDFs, ZIP bundles, and Discord reminders with ASCII art memes.

## Tech Stack

- **Framework:** Next.js 16 (App Router, fullstack)
- **UI:** shadcn/ui (new-york style) + Tailwind CSS v4
- **Auth:** NextAuth v5 (Auth.js) with Google Provider
- **DB:** Prisma + SQLite (dev) / PostgreSQL (prod via Neon)
- **PDF:** @react-pdf/renderer
- **XML:** xmlbuilder2
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
    services/          # PDF, XML, ZIP, Discord, PAC, Email, Exchange Rate
    di/container.ts    # Singleton DI container wiring all ports→adapters
  app/                 # Next.js App Router (presentation layer)
    (auth)/            # Unauthenticated routes (login)
    (dashboard)/       # Authenticated routes (dashboard, invoices, settings)
    actions/           # Server actions (invoice-actions.ts, settings-actions.ts)
    api/               # API routes (PDF/XML/bundle download, cron, exchange-rate)
  components/          # UI components (ui/, layout/, invoices/, settings/)
  lib/                 # auth.ts, auth-utils.ts, db.ts, schemas.ts, utils.ts
```

### Data Flow

1. Form submission → Server action in `src/app/actions/`
2. Action calls `requireUser()` → validates with Zod → calls use case via `container`
3. Use case operates on domain ports (repository/service interfaces)
4. Infrastructure implements ports (Prisma repos, service impls)
5. Action calls `revalidatePath()` → returns result or `redirect()`

### DI Container (`src/infrastructure/di/container.ts`)

- Repositories and services are **singletons** (created once at module load)
- Use cases are created on-demand via **getters**: `get createInvoice() { return new CreateInvoiceUseCase(repo); }`
- All use cases accessed as `container.createInvoice`, `container.listInvoices`, etc.

### Import Aliases

All imports use `@/*` mapped to `./src/*` (configured in tsconfig.json).

## Key Patterns

- **Server Components by default**, Client Components (`"use client"`) only for interactivity
- `getCurrentUser()` in `src/lib/auth-utils.ts` uses `React.cache()` for request deduplication — use in Server Components
- `requireUser()` for auth enforcement — use in Server Actions (redirects to `/login` if unauthenticated)
- All inputs validated with Zod schemas in `src/lib/schemas.ts`
- Server actions return `{ error: string }` or `{ success: true }` — handle errors in UI via `useActionState()`
- FormData arrays serialized as `items.0.descripcion`, `items.1.descripcion`, etc. (manual parsing, no library)
- `redirect()` in server actions must be wrapped — it throws `NEXT_REDIRECT` internally

### Naming Conventions

- Use cases: `VerbNounUseCase` (e.g., `CreateInvoiceUseCase`)
- Server actions: `verbNounAction` (e.g., `createInvoiceAction`)
- Repositories: `PrismaEntityRepository` (e.g., `PrismaInvoiceRepository`)
- Services: `ToolNameImpl` or `ToolNameService` (e.g., `CfdiXmlGeneratorImpl`)

## Next.js 16 Gotchas

- **Dynamic route params are Promises**: `params: Promise<{ id: string }>` — must `await params` in page/route components
- **searchParams are Promises too**: must `await searchParams`
- **`Buffer` not assignable to `BodyInit`**: wrap with `new Uint8Array(buffer)` in API route responses
- **`cloneInvoiceAction(id?: string)`** can't be used directly as form `action` prop — wrap in an inline server action

## Prisma / Database

- SQLite for dev (`file:./dev.db`), PostgreSQL (Neon) for prod
- **SQLite doesn't support enums** — use `String` fields with TypeScript union types
- Invoice has `@@unique([userId, month, year])` constraint (one invoice per month per user)
- Cascade deletes on all relations (InvoiceItem, InvoiceTax → Invoice)
- Repositories map Prisma results to domain entity interfaces (domain types are NOT Prisma types)
- Default invoice values assume foreign clients: generic RFC `XEXX010101000`, residencia `USA`, moneda `USD`

## PAC Integration (CFDI Timbrado)

- Supports **Finkok** (SOAP) and **SW Sapien** (REST) — configured via env vars
- PAC is optional — app works without it, generating unsigned XML
- Config: `PAC_PROVIDER`, `PAC_USERNAME`, `PAC_PASSWORD`, `PAC_ENVIRONMENT` (sandbox/production)

## Adding New Features

**New entity**: domain entity → port interface → use case → Prisma repo → wire in container → `prisma db push` → server actions → UI

**New service**: define interface in `src/domain/ports/services.ts` → implement in `src/infrastructure/services/` → register in container → inject into use cases
