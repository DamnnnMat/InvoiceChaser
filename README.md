# Invoice Chaser

Automated invoice reminder micro-SaaS MVP built with Next.js, Supabase, and Stripe.

## 🚀 Quick Start

### Option 1: Use the Start Script (Easiest)

```bash
./start.sh
```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local`** (see `.env.local.example` or `QUICKSTART.md`)

3. **Run dev server:**
   ```bash
   npm run dev
   ```

4. **Open** http://localhost:3000

## 📚 Documentation

- **QUICKSTART.md** - Get running in 2 minutes
- **SETUP_LOCAL.md** - Detailed local development setup
- **IMPLEMENTATION.md** - Architecture and implementation details

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (Auth + PostgreSQL)
- **Stripe** (Subscriptions)
- **Resend** (Email delivery)
- **Vercel Cron** (Scheduled reminders)

## Features

- ✅ Landing page with hero, how it works, pricing
- ✅ Email + password authentication
- ✅ Stripe subscription billing (£9/month)
- ✅ Invoice management (CRUD, mark as paid)
- ✅ Automated email reminders (before/on/after due date)
- ✅ Customizable email templates (3 templates)
- ✅ Reminder history tracking
- ✅ Account settings with delete account

## Setup Requirements

### Minimum (UI Only)
- Node.js 18+
- No additional setup needed - you can see the landing page!

### Full Setup
1. **Supabase** - Free tier works fine
   - Create project
   - Run migration from `supabase/migrations/001_initial_schema.sql`
   - Get URL and keys

2. **Stripe** - Test mode works
   - Create account
   - Get test API keys
   - Set up webhook (for production)

3. **Resend** - For email delivery
   - Create account
   - Get API key
   - Verify domain (for production)

## What Works Without Setup

- ✅ Landing page (fully functional)
- ✅ Login/Signup pages (UI only, auth won't work)
- ⚠️ App pages (will show but API calls fail)

## What Works With Supabase Only

- ✅ Full authentication
- ✅ All database operations
- ✅ Invoice CRUD
- ✅ Templates
- ✅ Settings
- ⚠️ Billing (needs Stripe)
- ⚠️ Email reminders (needs Resend)

## Project Structure

```
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   ├── app/         # Protected app pages
│   └── page.tsx     # Landing page
├── components/       # React components
├── lib/             # Utilities
│   └── supabase/    # Supabase clients
└── supabase/        # Database migrations
```

## Troubleshooting

### npm install fails
- Try: `sudo npm install`
- Or use: `nvm use 18 && npm install`
- Or use: `yarn install`

### Port 3000 in use
```bash
lsof -ti:3000 | xargs kill -9
```

### Module not found
```bash
rm -rf node_modules .next
npm install
```

## Next Steps

1. ✅ Run locally to see the UI
2. Set up Supabase for authentication
3. Set up Stripe for billing
4. Set up Resend for email
5. Deploy to Vercel

See `QUICKSTART.md` for step-by-step instructions!
