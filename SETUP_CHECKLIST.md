# Setup Checklist - Get Running in 5 Minutes

## ✅ Step 1: Create .env.local File

You've already got the command ready! Run it in your terminal:

```bash
cd /Users/mattbaby/InvoiceChaser
cat > .env.local << 'EOF'
# Supabase - Replace with your actual values when ready
NEXT_PUBLIC_SUPABASE_URL=https://qjzrifhbpoyrewilmwhl.supabase.co 
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqenJpZmhicG95cmV3aWxtd2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1ODUwNjUsImV4cCI6MjA4NDE2MTA2NX0.WDG1K8fZzJdip2Qro5DWPCpfwHkgYkWCpqQ8oN-eDfQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqenJpZmhicG95cmV3aWxtd2hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU4NTA2NSwiZXhwIjoyMDg0MTYxMDY1fQ.AZInBJ4OttD81DIWRletE8VxCM-buRU60L4rq5O9StM
# Stripe - Replace with your actual values when ready
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# Email (Resend) - Replace with your actual values when ready
RESEND_API_KEY=re_placeholder
EMAIL_FROM=noreply@example.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron (for reminder scheduler)
CRON_SECRET=local_dev_secret_key
EOF
```

## ✅ Step 2: Set Up Database in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard/project/qjzrifhbpoyrewilmwhl
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the **entire contents** of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press Cmd+Enter)

This will create all the tables, indexes, and security policies you need.

## ✅ Step 3: Restart Your Dev Server

Stop your current dev server (Ctrl+C) and restart it:

```bash
npm run dev
```

## ✅ Step 4: Test It Out!

1. **Landing Page**: http://localhost:3000 - Should work perfectly!
2. **Sign Up**: http://localhost:3000/signup - Create an account
3. **After Signup**: You'll be redirected to the billing page
4. **Invoices**: Once you have a subscription (or skip for now), you can create invoices

## 🎉 What Should Work Now

- ✅ Landing page
- ✅ Authentication (signup/login)
- ✅ All app pages (invoices, templates, settings, billing)
- ✅ Database operations (creating invoices, templates, etc.)
- ⚠️ Billing (needs Stripe keys - but you can see the UI)
- ⚠️ Email reminders (needs Resend - but you can see the UI)

## 🔍 Verify Database Setup

After running the migration, you should see these tables in Supabase:
- `profiles`
- `invoices`
- `email_templates`
- `reminders`
- `subscriptions`

Check in Supabase Dashboard → Table Editor to confirm.

## 🐛 Troubleshooting

### "Table doesn't exist" errors
- Make sure you ran the SQL migration in Step 2
- Check that all tables were created in Supabase Dashboard

### Authentication not working
- Verify your Supabase URL and keys in `.env.local`
- Make sure the migration ran successfully (especially the trigger for creating profiles)

### Still seeing Supabase errors
- Restart the dev server after creating `.env.local`
- Check that `.env.local` is in the root directory (same level as `package.json`)

## Next Steps (Optional)

1. **Set up Stripe** for billing (get test keys from Stripe Dashboard)
2. **Set up Resend** for email delivery (get API key from Resend)
3. **Test the full flow**: Sign up → Create invoice → See reminders

You're almost there! 🚀
