# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Invoice management system for Mexican freelancers billing foreign clients. Automates CFDI 4.0 XML generation, commercial invoice PDFs, ZIP bundles, and Discord reminders with ASCII art memes.

## Tech Stack

- **Framework:** Next.js 16 (App Router, fullstack)
- **UI:** shadcn/ui + Tailwind CSS v4
- **Auth:** NextAuth v5 (Auth.js) with Google Provider
- **DB:** Prisma + SQLite (dev) / PostgreSQL (prod via Neon)
- **PDF:** @react-pdf/renderer
- **XML:** xmlbuilder2
- **ZIP:** jszip
- **Validation:** Zod + React Hook Form
- **Email:** Nodemailer
- **Notifications:** Discord Webhooks

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
npx prisma db push   # Push schema changes to DB
npx prisma studio    # Open Prisma Studio
```

## Architecture (Hexagonal / Ports & Adapters)

```
src/
  domain/           # Pure business logic, ZERO framework dependencies
    entities/       # Invoice, User, Settings
    value-objects/  # RFC, Money, MonthYear
    ports/          # Interfaces (repositories, services)
    use-cases/      # All business operations
  infrastructure/   # Concrete implementations
    database/       # Prisma repositories
    services/       # PDF, XML, ZIP, Discord, PAC, Email, Exchange Rate
    di/             # DI Container (container.ts wires everything)
  app/              # Next.js App Router (presentation)
  components/       # UI Components
  lib/              # Utils, auth, DB client, Zod schemas
```

## Key Patterns

- Server Components by default, Client Components only for interactivity
- `React.cache()` on `getCurrentUser()` for request deduplication
- All Server Actions verify auth + ownership via `requireUser()`
- All inputs validated with Zod schemas (`src/lib/schemas.ts`)
- DI Container at `src/infrastructure/di/container.ts` connects all ports to adapters
