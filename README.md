# SaaS Starter Template

A production-ready, full-stack Next.js SaaS starter template with Stripe payments, authentication, and a beautiful collapsible sidebar.

Based on [Zero To Shipped](https://zerotoshipped.com), customized with Stripe integration and a minimal, professional design.

## Features

- **Authentication** - Email/password & OAuth with [Better-Auth](https://better-auth.com)
- **Payments** - Stripe subscriptions, one-time payments, and customer portal
- **Database** - PostgreSQL with Prisma ORM
- **API** - Type-safe APIs with tRPC
- **Email** - Transactional emails with Resend
- **UI** - Tailwind CSS v4, Radix UI, Framer Motion
- **Collapsible Sidebar** - Desktop sidebar with mobile drawer
- **Dark Mode** - Full dark mode support

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + Prisma 6 |
| Auth | Better-Auth |
| Payments | Stripe |
| API | tRPC 11 |
| UI Components | Radix UI, shadcn/ui |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Email | Resend |

## Getting Started

### Prerequisites

- Node.js 18+
- [Bun](https://bun.sh) (recommended) or npm/pnpm
- PostgreSQL database
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/metinferatii/starter-repo.git
   cd starter-repo
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file** with the following required variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

   # Auth
   BETTER_AUTH_SECRET="your-secret-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Stripe (when enabled)
   NEXT_PUBLIC_ENABLE_STRIPE=true
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   STRIPE_PRICE_ID_PRO_MONTHLY="price_..."
   STRIPE_PRICE_ID_PRO_ANNUAL="price_..."
   STRIPE_PRICE_ID_LIFETIME="price_..."
   ```

5. **Run database migrations**
   ```bash
   bun run db:migrate
   ```

6. **Start the development server**
   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (landing)/          # Public pages (home, pricing)
│   ├── (app)/              # Authenticated user pages
│   ├── (auth)/             # Auth pages (signup/signin)
│   └── api/                # API routes
├── components/
│   ├── sidebar/            # Collapsible sidebar components
│   ├── settings/           # Settings modal & tabs
│   ├── pricing/            # Pricing components
│   └── ui/                 # Base UI components
├── server/
│   ├── api/routers/        # tRPC routers
│   ├── auth/               # Better-Auth config
│   └── db/                 # Prisma client
├── hooks/                  # Custom React hooks
├── config/                 # App configuration
└── env/                    # Environment validation
```

## Development Commands

```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run check        # Lint + TypeScript check
bun run lint:fix     # ESLint with auto-fix
bun run typecheck    # TypeScript only
bun run format:write # Prettier formatting

# Database
bun run db:migrate   # Run migrations
bun run db:studio    # Prisma Studio GUI
bun run db:seed      # Seed database
```

## Stripe Setup

1. Create products in your [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Create prices for each product (monthly, annual, lifetime)
3. Copy the price IDs to your `.env` file
4. Set up webhooks pointing to `/api/auth/stripe/webhook`

## Customization

### Payment Plans

Edit `src/config/payment-plans.ts` to customize pricing:

```typescript
export const basePlans: BasePlanInfo[] = [
  {
    slug: "pro-monthly",
    name: "Pro Monthly",
    price: "$19",
    priceAmount: 19,
    // ...
  },
];
```

### Sidebar Navigation

Edit `src/components/sidebar/SidebarNav.tsx` to add or remove navigation items.

### Landing Page

The landing page uses minimal components in `src/app/(landing)/home/_components/`:
- `LandingHeroMinimal.tsx`
- `LandingFeaturesMinimal.tsx`
- `LandingPricingMinimal.tsx`
- `LandingFooterMinimal.tsx`

## Feature Flags

Control features via environment variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_ENABLE_STRIPE` | Enable Stripe payments |
| `NEXT_PUBLIC_ENABLE_BLOG_PAGE` | Enable blog page |
| `NEXT_PUBLIC_ENABLE_CHAT_PAGE` | Enable chat page |
| `NEXT_PUBLIC_ENABLE_PRICING_PAGE` | Enable pricing page |
| `NEXT_PUBLIC_ENABLE_BACKGROUND_JOBS` | Enable Redis/BullMQ |
| `NEXT_PUBLIC_ENABLE_UPLOADTHING` | Enable file uploads |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Railway
- Render
- DigitalOcean App Platform
- Self-hosted with Docker

## License

MIT

## Credits

Built on top of [Zero To Shipped](https://zerotoshipped.com) by Kitze.
