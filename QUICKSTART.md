# Quick Start - Run Locally

## Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

**If you get permission errors**, try one of these:

```bash
# Option 1: Use sudo (macOS/Linux)
sudo npm install

# Option 2: Use a node version manager (recommended)
# Install nvm if you don't have it: https://github.com/nvm-sh/nvm
nvm install 18
nvm use 18
npm install

# Option 3: Use yarn instead
yarn install
```

## Step 2: Create Environment File

Create a file named `.env.local` in the root directory:

```bash
touch .env.local
```

Then add these placeholder values (we'll update with real values later):

```env
# Supabase - Placeholder values for now
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_anon_key
SUPABASE_SERVICE_ROLE_KEY=placeholder_service_role_key

# Stripe - Placeholder values
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# Email - Placeholder values
RESEND_API_KEY=re_placeholder
EMAIL_FROM=noreply@example.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron
CRON_SECRET=local_dev_secret
```

## Step 3: Run the Development Server

```bash
npm run dev
```

The app should start at `http://localhost:3000`

## What You'll See

### ✅ Works Immediately (No Setup Needed)
- **Landing Page** - Full landing page with hero, how it works, pricing
- **Login/Signup Pages** - UI works, but authentication won't work without Supabase

### ⚠️ Requires Supabase Setup
- Authentication (signup/login)
- All app pages (invoices, templates, settings, billing)
- Database operations

### ⚠️ Requires Full Setup
- Stripe checkout (billing)
- Email sending (reminders)
- Cron jobs

## Testing the UI

Even without Supabase, you can:

1. **View Landing Page**: `http://localhost:3000`
2. **View Login Page**: `http://localhost:3000/login`
3. **View Signup Page**: `http://localhost:3000/signup`

The app pages will show but API calls will fail until Supabase is configured.

## Next: Set Up Supabase (5 minutes)

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to SQL Editor
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste and run it
6. Go to Settings → API
7. Copy your URL and keys to `.env.local`
8. Restart the dev server: `npm run dev`

Now authentication and all app features will work!

## Troubleshooting

### Port 3000 Already in Use
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
```

### Module Not Found
```bash
# Clear and reinstall
rm -rf node_modules .next
npm install
```

### TypeScript Errors
The app should compile. If you see errors, they're likely from missing environment variables, which is expected until you set up Supabase.

## Need Help?

Check `SETUP_LOCAL.md` for detailed setup instructions.
