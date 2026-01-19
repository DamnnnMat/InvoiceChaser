# Verify Your .env.local File

## Check if the file exists and has the right content:

Run this in your terminal:

```bash
cd /Users/mattbaby/InvoiceChaser
cat .env.local
```

You should see your Supabase credentials. If the file is empty or missing, create it manually:

## Manual Creation (Easiest Method)

1. **Open a text editor** (VS Code, TextEdit, or any editor)

2. **Create a new file** named `.env.local` in the `/Users/mattbaby/InvoiceChaser/` folder

3. **Paste this content** (with your actual Supabase values):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://qjzrifhbpoyrewilmwhl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqenJpZmhicG95cmV3aWxtd2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1ODUwNjUsImV4cCI6MjA4NDE2MTA2NX0.WDG1K8fZzJdip2Qro5DWPCpfwHkgYkWCpqQ8oN-eDfQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqenJpZmhicG95cmV3aWxtd2hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU4NTA2NSwiZXhwIjoyMDg0MTYxMDY1fQ.AZInBJ4OttD81DIWRletE8VxCM-buRU60L4rq5O9StM

# Stripe
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# Email (Resend)
RESEND_API_KEY=re_placeholder
EMAIL_FROM=noreply@example.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron
CRON_SECRET=local_dev_secret_key
```

4. **Save the file** as `.env.local` (make sure it starts with a dot!)

## Using VS Code (If you have it)

1. Open VS Code in the project folder:
   ```bash
   cd /Users/mattbaby/InvoiceChaser
   code .
   ```

2. Create a new file: `.env.local`

3. Paste the content above

4. Save (Cmd+S)

## Next Steps After Creating .env.local

1. **Set up the database** in Supabase (run the SQL migration)
2. **Restart your dev server**: `npm run dev`
3. **Test the app**: http://localhost:3000
