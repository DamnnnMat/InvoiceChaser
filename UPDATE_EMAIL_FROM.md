# Update EMAIL_FROM to Test Domain

## Quick Update

Open your `.env.local` file and change the `EMAIL_FROM` line to:

```env
EMAIL_FROM=onboarding@resend.dev
```

## Full Example .env.local

Make sure your `.env.local` has:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Email (Resend) - Using test domain
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron
CRON_SECRET=your_cron_secret
```

## After Updating

1. **Restart your dev server** (stop `npm run dev` and start it again)
2. **Send a test reminder** from the invoice detail page
3. **Check your email** - it should arrive (may be in spam folder)
4. **Check Resend dashboard** at https://resend.com/emails to see delivery status

## Notes

- `onboarding@resend.dev` is Resend's test domain - no verification needed
- Emails from test domains may go to spam
- For production, you'll need to verify your own domain in Resend
