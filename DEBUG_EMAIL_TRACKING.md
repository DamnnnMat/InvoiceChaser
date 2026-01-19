# Debugging Email Tracking

## Issue: Email Not Received

If you sent a reminder but didn't receive the email, follow these steps:

### 1. Check Database Status

Run this SQL query in Supabase to see if the reminder was logged:

```sql
SELECT 
  id,
  invoice_id,
  reminder_type,
  status,
  sent_at,
  tracking_id,
  opened_at,
  open_count,
  error_message
FROM reminders 
ORDER BY sent_at DESC 
LIMIT 5;
```

**What to look for:**
- If `status = 'sent'` → Email was sent successfully (check spam folder)
- If `status = 'failed'` → Email failed to send (check `error_message`)
- If no row exists → Email sending didn't complete

### 2. Check Resend Configuration

Verify your `.env.local` has:
```env
RESEND_API_KEY=re_your_actual_key_here
EMAIL_FROM=noreply@yourdomain.com  # Must be verified in Resend
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:**
- `EMAIL_FROM` must be a verified domain in Resend
- For testing, you can use Resend's test domain: `onboarding@resend.dev`
- But you need to verify your own domain for production

### 3. Check Browser Console

When you click "Send Email", check the browser console (F12) for any errors.

### 4. Check Server Logs

Check your terminal where `npm run dev` is running for any error messages.

### 5. Test Tracking Manually

Even if you didn't receive the email, you can test the tracking:

1. Get the `tracking_id` from the database query above
2. Open this URL in your browser:
   ```
   http://localhost:3000/api/track/open?rid=<tracking_id>
   ```
3. You should see a small green dot (1x1 pixel)
4. Check the database again - `opened_at` should now be set and `open_count` should be 1
5. Refresh the invoice detail page - it should now show "Opened"

### 6. Common Issues

**Issue: "Email sent successfully" but no email received**
- ✅ Check spam/junk folder
- ✅ Verify `EMAIL_FROM` domain is verified in Resend
- ✅ Check Resend dashboard for delivery status
- ✅ Verify `client_email` is correct in the invoice

**Issue: Error message when sending**
- Check `error_message` in database
- Common errors:
  - `Invalid API key` → Check `RESEND_API_KEY` in `.env.local`
  - `Domain not verified` → Verify domain in Resend dashboard
  - `Invalid email address` → Check `client_email` format

**Issue: Tracking shows "Not opened"**
- This is correct if you didn't actually open the email
- To test tracking, manually open the tracking URL (see step 5 above)
- Note: Some email clients block images by default, so opens may not be tracked

### 7. Quick Test Checklist

- [ ] Reminder logged in database with `status = 'sent'`
- [ ] `tracking_id` exists and is a valid UUID
- [ ] `RESEND_API_KEY` is set correctly
- [ ] `EMAIL_FROM` is verified in Resend
- [ ] Checked spam folder
- [ ] Browser console shows no errors
- [ ] Server logs show no errors
- [ ] Can manually open tracking URL and see green dot
- [ ] Database updates `opened_at` when tracking URL is opened

### 8. Testing Without Real Email

If you want to test tracking without sending real emails:

1. Manually insert a test reminder in the database:
```sql
INSERT INTO reminders (invoice_id, reminder_type, status, tracking_id)
VALUES (
  '<your_invoice_id>',
  'before_due',
  'sent',
  gen_random_uuid()
);
```

2. Get the `tracking_id` from the insert
3. Open the tracking URL to test
4. Check the UI to see the status update
