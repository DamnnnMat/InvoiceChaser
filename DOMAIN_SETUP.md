# Setting Up invoiceseen.com Domain

## Overview

You'll need to:
1. Verify your domain in Resend (for sending emails)
2. Deploy your app (recommended: Vercel)
3. Point your domain to your deployment
4. Update environment variables

## Step 1: Verify Domain in Resend

### 1.1 Add Domain to Resend

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter: `invoiceseen.com`
4. Click "Add"

### 1.2 Add DNS Records in Cloudflare

Resend will show you DNS records to add. Go to Cloudflare:

1. Log in to Cloudflare Dashboard
2. Select your `invoiceseen.com` domain
3. Go to DNS → Records
4. Add the records Resend provides:

**Typically you'll need:**
- **SPF Record** (TXT):
  ```
  Type: TXT
  Name: @ (or invoiceseen.com)
  Content: v=spf1 include:resend.com ~all
  TTL: Auto
  ```

- **DKIM Records** (CNAME):
  Resend will provide 2-3 CNAME records like:
  ```
  Type: CNAME
  Name: resend._domainkey
  Target: [provided by Resend]
  TTL: Auto
  ```

- **DMARC Record** (TXT) - Optional but recommended:
  ```
  Type: TXT
  Name: _dmarc
  Content: v=DMARC1; p=none;
  TTL: Auto
  ```

### 1.3 Wait for Verification

- DNS propagation can take a few minutes to 24 hours
- Check status in Resend dashboard
- Once verified, you can use `noreply@invoiceseen.com` or `hello@invoiceseen.com`

## Step 2: Deploy to Vercel (Recommended)

### 2.1 Prepare for Deployment

1. Push your code to GitHub (if not already):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. Go to https://vercel.com
3. Sign up/Login with GitHub
4. Click "Add New Project"
5. Import your GitHub repository

### 2.2 Configure Environment Variables in Vercel

In Vercel project settings → Environment Variables, add:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Email (Resend)
RESEND_API_KEY=re_2wHwLA3V_6WHAD783qpV6VRSq2dNN1epb
EMAIL_FROM=noreply@invoiceseen.com

# App - IMPORTANT: Update after domain setup
NEXT_PUBLIC_APP_URL=https://invoiceseen.com

# Cron
CRON_SECRET=your_secure_random_string
```

### 2.3 Deploy

- Vercel will automatically deploy
- You'll get a URL like: `your-project.vercel.app`

## Step 3: Point Domain to Vercel

### 3.1 In Vercel Dashboard

1. Go to your project → Settings → Domains
2. Add `invoiceseen.com` and `www.invoiceseen.com`
3. Vercel will show you DNS records to add

### 3.2 In Cloudflare

Add these DNS records:

**For Root Domain (invoiceseen.com):**
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy: Proxied (orange cloud ON)
TTL: Auto
```

**For WWW (www.invoiceseen.com):**
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy: Proxied (orange cloud ON)
TTL: Auto
```

**Note:** If Cloudflare doesn't allow CNAME on root (@), use A record:
```
Type: A
Name: @
Content: 76.76.21.21 (Vercel's IP - check Vercel docs for current IP)
Proxy: Proxied
TTL: Auto
```

### 3.3 Wait for DNS Propagation

- Can take a few minutes to 24 hours
- Check with: `nslookup invoiceseen.com` or `dig invoiceseen.com`

## Step 4: Update Environment Variables

Once domain is live:

1. In Vercel → Project Settings → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to: `https://invoiceseen.com`
3. Update `EMAIL_FROM` to: `noreply@invoiceseen.com` (or your preferred address)
4. Redeploy (or wait for auto-deploy)

## Step 5: Test

1. Visit https://invoiceseen.com
2. Send a test email reminder
3. Check that email comes from `noreply@invoiceseen.com`
4. Open the email - tracking should work!

## Step 6: Set Up Vercel Cron (Optional)

For automated reminders, set up Vercel Cron:

1. In Vercel → Project Settings → Cron Jobs
2. Add new cron job:
   - Path: `/api/cron/reminders`
   - Schedule: `0 * * * *` (every hour)
   - Headers: `Authorization: Bearer your_cron_secret`

Or add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "0 * * * *"
  }]
}
```

## Troubleshooting

**Domain not resolving:**
- Wait for DNS propagation (can take up to 24 hours)
- Check DNS records in Cloudflare
- Verify domain in Vercel dashboard

**Emails not sending:**
- Verify domain is verified in Resend
- Check `EMAIL_FROM` matches verified domain
- Check Resend dashboard for errors

**Tracking not working:**
- Ensure `NEXT_PUBLIC_APP_URL` is set to `https://invoiceseen.com`
- Check that domain is accessible
- Verify tracking endpoint: `https://invoiceseen.com/api/track/open?rid=test`

## Next Steps

1. ✅ Verify domain in Resend
2. ✅ Deploy to Vercel
3. ✅ Point domain to Vercel
4. ✅ Update environment variables
5. ✅ Test email sending and tracking
