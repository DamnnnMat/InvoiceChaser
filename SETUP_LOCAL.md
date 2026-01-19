# Local Development Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

If you encounter permission errors, try:
```bash
sudo npm install
```

Or use a node version manager:
```bash
# Using nvm
nvm use 18  # or 20
npm install
```

### 2. Create Environment File

Create `.env.local` in the root directory:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your actual values. For local development, you can use placeholder values to at least see the UI:

```env
# Supabase - Get these from your Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe - Get these from Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Email (Resend) - Get from Resend dashboard
RESEND_API_KEY=re_your_key
EMAIL_FROM=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron
CRON_SECRET=any_random_string_for_local_dev
```

### 3. Set Up Supabase

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the migration
5. Copy your project URL and keys to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## What Works Without Full Setup

### UI Only (No Backend)
- Landing page ✅
- Login/Signup pages ✅ (UI only, won't actually authenticate)
- All app pages will show but API calls will fail

### With Supabase Only
- Authentication ✅
- Database operations ✅
- Invoice CRUD ✅
- Templates ✅
- Settings ✅

### With Supabase + Stripe
- Everything above ✅
- Billing page ✅
- Subscription management ✅

### With Full Setup (Supabase + Stripe + Resend)
- Everything above ✅
- Email sending ✅
- Reminder cron job ✅

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### TypeScript Errors
```bash
# Check for type errors
npm run build
```

### Supabase Connection Issues
- Verify your Supabase URL and keys are correct
- Check that RLS policies are enabled
- Ensure the migration ran successfully

## Testing the App

1. **Landing Page**: Visit `http://localhost:3000` - should show landing page
2. **Sign Up**: Click "Sign Up" - creates account in Supabase
3. **Billing**: After signup, redirected to billing page
4. **Invoices**: After subscribing (or with active subscription), can create invoices
5. **Templates**: Edit email templates
6. **Settings**: View account, delete account

## Next Steps

Once running locally:
1. Test authentication flow
2. Create a test invoice
3. Test email template editing
4. Set up Stripe test mode for billing
5. Test reminder cron job (manually call `/api/cron/reminders`)
