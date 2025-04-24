# Zero To Shipped

## 🚀 Quick Start

0. **Use this repository as a template**: Click the "Use this template" button above. Using it as a template allows you to create multiple copies under your account, whereas GitHub only allows one fork per account.

1. **Install Dependencies**:

   - We recommend using **Bun** for the fastest installation:
     ```bash
     bun install
     ```
   - _Why not pnpm/npm/yarn?_ Newer pnpm versions require an extra [`approve-builds`](https://pnpm.io/cli/approve-builds) step which can be cumbersome. `npm` and `yarn` work but are generally slower and less efficient.

2. **Configure Environment**: The easiest way to generate your environment variables is to visit [zts-env.vercel.app](https://zts-env.vercel.app). Alternatively, you can copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   The two most crucial variables you need to set are:

   - **`DATABASE_URL`**: Set this to your local PostgreSQL connection string (e.g., `postgresql://postgres@localhost:5432/my_app_db`). You'll need a local PostgreSQL server running - we recommend [DBngin](https://dbngin.com/) for macOS/Windows. See [Database Docs](./docs/database.mdx) for details.
   - **`BETTER_AUTH_SECRET`**: Generate a strong random secret (e.g., run `bunx --bun openssl rand -base64 32` or use a password manager).

   Other variables like `NEXT_PUBLIC_APP_NAME` and `NEXT_PUBLIC_APP_DESCRIPTION` can be customized optionally.

3. **Migrate Database**: Apply the schema to your database:

   ```bash
   bun run db:migrate
   ```

4. **Run Dev Server**:
   ```bash
   bun run dev
   ```

Your app should now be running locally (usually `http://localhost:3000`). Explore the other docs below for details on specific features.

## Project Structure

- [Folder Structure](./docs/folder-structure.mdx): Explanation of the Next.js App Router setup, route groups, and layouts.

## Authentication

- [Better Auth Integration](./docs/better-auth.mdx): Core authentication setup and configuration.
- [Middleware & Route Protection](./docs/middleware.mdx): How routes are protected based on auth status.
- [User Roles](./docs/roles.mdx): Information about user/admin roles and administrative capabilities including user impersonation and banning.

## Database

- [Database (Prisma)](./docs/database.mdx): Information about the database setup, schema, migrations, and usage.

## Background & Cron Jobs

- [Background Jobs](./docs/background-jobs.mdx): How background jobs are handled (e.g., using BullMQ).
- [Cron Jobs](./docs/cron-jobs.mdx): How scheduled tasks are managed.

## Integrations

- [Payments (Polar Integration)](./docs/payments.mdx): How payments, subscriptions, and the Polar integration work.
- [UploadThing Integration](./docs/uploadthing.mdx): Details on handling file uploads.

### Email

- [Resend Integration](./docs/resend.mdx): Details on using Resend for sending emails.
- [Plunk Integration](./docs/plunk.mdx): Details on using Plunk for sending emails.
- [SMTP Integration](./docs/smtp.mdx): Details on using a standard SMTP server for sending emails.
- [Nodemailer Local Development](./docs/nodemailer.mdx): Details on the setup for catching emails locally during development.

## Development

- [tRPC Artificial Delay](./docs/trpc-delay.mdx): Information about the simulated latency added to API calls in development.
- [Environment Variables](./docs/env.mdx): Explanation of the environment variable setup and validation.

## Deployment

- [Deployment Guide](./docs/deployment.mdx): Steps and considerations for deploying the application.

## UI & Components

- [Kitze UI Components](./docs/kitze-ui.mdx): Information about the custom UI components used.

---

## Getting Updates

This project is under active development. We'll be continuously pushing updates to enhance features and address issues. We are also exploring ways to help you easily incorporate these updates into the repositories you've created from this template.

One solution might be to get snippets with git patches that you paste into Cursor/Windsurf/Cline/Copilot and they execute the patch. This is the safest way because you might deccide to move files, directories, etc. so classic merging won't work.
