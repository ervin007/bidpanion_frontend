# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zero To Shipped - A full-stack Next.js SaaS starter template.

- **Docs**: https://documents.zerotoshipped.com
- **Demo**: https://demo.zerotoshipped.com/
- **ENV Generator**: https://env.zerotoshipped.com/

## Development Commands

```bash
bun run dev          # Start dev server (assumes server is always running)
bun run check        # Lint + TypeScript check
bun run lint         # ESLint only
bun run lint:fix     # ESLint with auto-fix
bun run typecheck    # TypeScript only
bun run typewatch    # TypeScript in watch mode
bun run format:write # Prettier formatting
bun run build        # Production build with Prisma migrations

# Database (PostgreSQL + Prisma)
bun run db:migrate   # Run migrations (ALWAYS use this, never db:push)
bun run db:studio    # Prisma Studio GUI
bun run db:seed      # Seed database
bun run db:generate  # Generate Prisma client

# Other
bun run email        # Preview email templates
bun run tunnel       # LocalTunnel for external access
```

## Tech Stack

- **Frontend**: React 19, Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **Backend**: tRPC 11, Better-Auth, Prisma 6, PostgreSQL
- **Forms**: React Hook Form + Zod
- **UI**: Radix UI components, Framer Motion, Lucide icons
- **Optional**: Redis/BullMQ (background jobs), Resend (email), Stripe (payments), UploadThing (file uploads)

## Architecture

### Directory Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (landing)/       # Public pages (home, blog, pricing)
│   ├── (app)/           # Authenticated user pages
│   ├── (auth)/          # Auth pages (signup/signin)
│   └── api/             # API routes (trpc, auth, uploadthing)
├── server/              # Server-only code
│   ├── api/routers/     # tRPC routers (user, auth, admin, stripe, utImage)
│   ├── auth/            # Better-Auth configuration
│   ├── db/              # Prisma client & extensions
│   └── email/           # Email sending logic
├── components/          # React components
│   └── ui/              # Shadcn/Radix base components
├── hooks/               # Custom React hooks
├── schemas/             # Zod validation schemas
├── config/              # App configuration (plans, links, hotkeys)
├── trpc/                # Client-side tRPC setup
└── env/                 # Environment variable validation (Zod)
```

### tRPC

Three procedure types defined in `src/server/api/trpc.ts`:
- `publicProcedure` - No auth required
- `protectedProcedure` - Requires authenticated user
- `adminProcedure` - Requires admin role

### Authentication (Better-Auth)

Session-based auth with Prisma adapter. Supports email/password and OAuth. Routes protected via `src/middleware.ts`.

### Environment Variables

Feature flags control optional functionality:
- `NEXT_PUBLIC_ENABLE_STRIPE` - Payment processing
- `NEXT_PUBLIC_ENABLE_BACKGROUND_JOBS` - Redis/BullMQ jobs
- `NEXT_PUBLIC_ENABLE_UPLOADTHING` - File uploads
- `NEXT_PUBLIC_ENABLE_BLOG_PAGE`, `NEXT_PUBLIC_ENABLE_PRICING_PAGE`, etc.

## Development Guidelines

### Styling

- **Always use `gap` for spacing**, never margin
- Use `horizontal` and `vertical` CSS classes from globals.css instead of raw flex
- Tailwind CSS v4 with custom theme variables

### Components to Use

- **Loading**: `Spinner` from `@/components/Spinner`
- **Buttons**: `CustomButton` from `@/components/CustomButton` (supports `leftIcon`, `loading`)
- **Dialogs**: `useDialog()` from `@/components/DialogManager`
- **Confirmations**: `useConfirm()`, `useConfirmDelete()` from `@/components/AlertContext`
- **Segmented Control**: `SegmentedControl` from `@/components/SegmentedControl`
- **Icons**: Always use `lucide-react`

### Forms

Use React Hook Form with the provided FormField wrappers:
- `FormFieldInput`, `FormFieldTextarea`, `FormFieldCheckbox`, `FormFieldSwitch`, `FormFieldAdvancedSelect`

The `onSubmit` logic should come from outside the form component. See `src/schemas/` for schema examples.

### Mobile Responsiveness

For conditional desktop/mobile logic beyond Tailwind media queries:
```tsx
const { isMobile } = useKitzeUI();
```

### Database

**Always use `db:migrate`** for schema changes, never `db:push`.

### Assumed Dependencies

These are already installed - don't reinstall:
- lodash, date-fns, lucide-react, framer-motion
