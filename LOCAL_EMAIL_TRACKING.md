# Email Tracking in Local Development

## The Problem

Email tracking pixels use `NEXT_PUBLIC_APP_URL` to construct the tracking URL. When this is set to `http://localhost:3000`, email clients can't access it because:
- Email clients run on different devices/networks
- `localhost` only works on your local machine
- The tracking pixel needs to be publicly accessible

## Solution: Use ngrok (Recommended for Local Testing)

### Step 1: Install ngrok

```bash
# macOS (using Homebrew)
brew install ngrok

# Or download from https://ngrok.com/download
```

### Step 2: Start Your Dev Server

```bash
npm run dev
```

### Step 3: Start ngrok Tunnel

In a new terminal window:

```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### Step 4: Update .env.local

Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`) and update:

```env
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

### Step 5: Restart Dev Server

Stop and restart `npm run dev` to pick up the new environment variable.

### Step 6: Test

1. Send a new test email
2. Open the email
3. Check the invoice detail page - tracking should now work!

## Important Notes

- **ngrok URL changes**: Free ngrok URLs change each time you restart ngrok. You'll need to update `NEXT_PUBLIC_APP_URL` each time.
- **For production**: When you deploy (e.g., to Vercel), set `NEXT_PUBLIC_APP_URL` to your production domain (e.g., `https://yourdomain.com`)
- **Old emails won't track**: Emails sent before updating the URL will still have the old localhost URL and won't track.

## Alternative: Test in Production/Staging

If you have a deployed version:
1. Set `NEXT_PUBLIC_APP_URL` to your production/staging URL
2. Send test emails from that environment
3. Tracking will work immediately

## Quick Test Without ngrok

You can still manually test tracking by:
1. Getting the `tracking_id` from the database
2. Opening: `http://localhost:3000/api/track/open?rid=<tracking_id>` in your browser
3. This will update the database and UI

But this won't work automatically when clients open emails.
