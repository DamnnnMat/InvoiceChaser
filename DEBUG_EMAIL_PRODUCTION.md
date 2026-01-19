# Debugging Email Sending in Production

## Issue: Email not sending and not appearing in Resend logs

### Step 1: Check What Happened in the UI

When you clicked "Send Email", did you see:
- ✅ Success message? (If yes, check database)
- ❌ Error message? (What was the exact error?)

### Step 2: Check Database for Reminder Log

Run this SQL in Supabase:

```sql
SELECT 
  id,
  invoice_id,
  reminder_type,
  status,
  sent_at,
  error_message,
  tracking_id
FROM reminders 
ORDER BY sent_at DESC 
LIMIT 5;
```

**What to look for:**
- If `status = 'sent'` → Email was sent (check spam, verify email address)
- If `status = 'failed'` → Check `error_message` for the reason
- If no row exists → Email sending didn't complete (API error)

### Step 3: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click "Functions" tab
3. Find `/api/invoices/resend-email`
4. Check the logs for errors

Look for:
- `Email send error:` - This will show the actual Resend error
- Any console.error messages

### Step 4: Verify Environment Variables in Vercel

Go to Vercel → Project Settings → Environment Variables and verify:

```env
RESEND_API_KEY=re_2wHwLA3V_6WHAD783qpV6VRSq2dNN1epb
EMAIL_FROM=noreply@invoiceseen.com
NEXT_PUBLIC_APP_URL=https://invoiceseen.com
```

**Important checks:**
- ✅ `RESEND_API_KEY` is set (not placeholder)
- ✅ `EMAIL_FROM` matches your verified domain in Resend
- ✅ No extra spaces or quotes around values

### Step 5: Test Resend API Key

1. Go to https://resend.com/api-keys
2. Verify your API key `re_2wHwLA3V_6WHAD783qpV6VRSq2dNN1epb` is active
3. Check if it has the right permissions

### Step 6: Test Email Address

Verify the `client_email` in your invoice:
- Is it a valid email format?
- Can you receive emails at that address?
- Check for typos

### Step 7: Check Resend Domain Status

1. Go to https://resend.com/domains
2. Check `invoiceseen.com` status
3. Should show "Verified" (green checkmark)
4. If not verified, add missing DNS records

### Common Issues

**Issue: "Invalid API key"**
- Check `RESEND_API_KEY` in Vercel matches your Resend dashboard
- Verify key is active (not revoked)

**Issue: "Domain not verified"**
- Check Resend domains dashboard
- Verify all DNS records are added in Cloudflare
- Wait for DNS propagation (can take up to 24 hours)

**Issue: "Invalid from address"**
- `EMAIL_FROM` must match verified domain
- Format: `something@invoiceseen.com`
- Cannot use unverified domains

**Issue: Silent failure (no error, no email)**
- Check Vercel function logs
- Check database for failed reminders
- Verify all environment variables are set

### Quick Test

Try sending a test email directly from Resend dashboard:
1. Go to https://resend.com/emails
2. Click "Send Email"
3. From: `noreply@invoiceseen.com`
4. To: Your test email
5. Send

If this works → Issue is in your code/API
If this fails → Issue is with Resend configuration
