# Setting Up Resend for Email Sending

## The Problem

Your `.env.local` currently has:
```
RESEND_API_KEY=re_placeholder
```

This is a placeholder, not a real API key. Emails won't send without a valid Resend API key.

## Solution: Get a Real Resend API Key

### Step 1: Sign Up for Resend (Free)

1. Go to https://resend.com
2. Sign up for a free account (no credit card required)
3. Verify your email address

### Step 2: Get Your API Key

1. Once logged in, go to https://resend.com/api-keys
2. Click "Create API Key"
3. Give it a name (e.g., "Invoice Chaser Dev")
4. Copy the API key (it starts with `re_`)

### Step 3: Update Your .env.local

Open `.env.local` and replace:
```env
RESEND_API_KEY=re_placeholder
```

With your actual API key:
```env
RESEND_API_KEY=re_your_actual_api_key_here
```

### Step 4: Restart Your Dev Server

1. Stop `npm run dev` (Ctrl+C)
2. Start it again: `npm run dev`

### Step 5: Test

1. Go to an invoice detail page
2. Click "Resend Email"
3. Send a test reminder
4. Check your email inbox (and spam folder)

## Using Test Domain

You're already set up with:
```
EMAIL_FROM=onboarding@resend.dev
```

This is Resend's test domain - no domain verification needed. Emails from this address may go to spam, but they will be delivered.

## Check Email Status

After sending, you can check the Resend dashboard:
- Go to https://resend.com/emails
- You'll see all sent emails and their delivery status
- If there are errors, they'll be shown here

## Troubleshooting

**If emails still don't arrive:**
1. Check Resend dashboard for delivery status
2. Check spam/junk folder
3. Verify the `client_email` address in your invoice is correct
4. Check server logs (terminal where `npm run dev` is running) for errors
5. Check database for failed reminders:
   ```sql
   SELECT * FROM reminders 
   WHERE status = 'failed' 
   ORDER BY sent_at DESC 
   LIMIT 5;
   ```
