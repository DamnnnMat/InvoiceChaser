# Check Email Status

## Database shows 'sent' but no email received

### Step 1: Check Tracking ID

Run this SQL to get the tracking ID:

```sql
SELECT 
  tracking_id,
  sent_at,
  status,
  invoice_id
FROM reminders 
WHERE status = 'sent'
ORDER BY sent_at DESC 
LIMIT 1;
```

### Step 2: Test Tracking Pixel

If you have a `tracking_id`, open this URL:
```
https://invoiceseen.com/api/track/open?rid=<tracking_id>
```

This will:
- Verify the tracking endpoint works
- Update `opened_at` in database
- Confirm the email was actually sent

### Step 3: Check Resend Dashboard More Carefully

1. Go to https://resend.com/emails
2. Check the **date filter** - make sure it's set to "Today" or "Last 7 days"
3. Look for emails sent to your test email address
4. Check the status column:
   - ✅ Delivered
   - ⏳ Pending
   - ❌ Failed

### Step 4: Verify Email Address

Check what email address the reminder was sent to:

```sql
SELECT 
  r.tracking_id,
  r.sent_at,
  i.client_email,
  i.client_name
FROM reminders r
JOIN invoices i ON r.invoice_id = i.id
WHERE r.status = 'sent'
ORDER BY r.sent_at DESC 
LIMIT 1;
```

**Important:**
- Is `client_email` correct?
- Can you receive emails at that address?
- Check spam/junk folder

### Step 5: Check Resend API Response

The code logs the Resend response. Check Vercel function logs for:
```
Email sent successfully: { to: '...', trackingId: '...', resendId: '...' }
```

If you see `resendId`, that means Resend accepted the email.

### Step 6: Check Email Deliverability

Even if Resend accepts the email, delivery can fail due to:
- Spam filters
- Email provider blocking
- Invalid email address
- Domain reputation issues

### Step 7: Test with Different Email

Try sending to a different email address (Gmail, Outlook, etc.) to see if it's email-provider specific.
