# Email Open Tracking Implementation

## Overview
This document describes the email open tracking feature that allows users to see if their reminder emails have been opened by clients.

## Files Changed/Added

### Database Migration
- **`supabase/migrations/002_add_email_tracking.sql`** (NEW)
  - Adds `tracking_id UUID` (unique, non-null)
  - Adds `opened_at TIMESTAMP WITH TIME ZONE` (nullable)
  - Adds `open_count INTEGER` (default 0)
  - Creates index on `tracking_id` for fast lookups

### Backend API Routes
- **`app/api/track/open/route.ts`** (NEW)
  - GET endpoint that handles email open tracking
  - Returns 1x1 transparent PNG pixel
  - Updates `opened_at` (first open) and increments `open_count`
  - Always returns pixel even if tracking_id invalid (security)

- **`app/api/cron/reminders/route.ts`** (MODIFIED)
  - Generates `tracking_id` before sending emails
  - Embeds tracking pixel in HTML email body
  - Stores `tracking_id` when logging reminders

- **`app/api/invoices/resend-email/route.ts`** (MODIFIED)
  - Generates `tracking_id` before sending emails
  - Embeds tracking pixel in HTML email body
  - Stores `tracking_id` when logging reminders

### Frontend Components
- **`components/invoices/InvoiceDetailClient.tsx`** (MODIFIED)
  - Updated `Reminder` interface to include `opened_at` and `open_count`
  - Added "Open Status" column to reminder history table
  - Shows "Opened" badge with relative time and open count
  - Shows "Not opened" badge for unopened emails
  - Uses Eye/EyeOff icons for visual indication

## Database Schema Changes

```sql
ALTER TABLE reminders
  ADD COLUMN tracking_id UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  ADD COLUMN opened_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN open_count INTEGER DEFAULT 0 NOT NULL;

CREATE INDEX idx_reminders_tracking_id ON reminders(tracking_id);
```

## How It Works

1. **Email Sending**: When a reminder email is sent (via cron or manual resend):
   - A unique `tracking_id` (UUID) is generated
   - An invisible 1x1 pixel image is embedded in the HTML email:
     ```html
     <img src="${NEXT_PUBLIC_APP_URL}/api/track/open?rid=${tracking_id}" 
          width="1" height="1" style="display:none;" alt="" />
     ```
   - The reminder is logged with the `tracking_id`

2. **Email Opening**: When the client opens the email:
   - The email client loads the tracking pixel
   - A GET request is made to `/api/track/open?rid=<tracking_id>`
   - The endpoint:
     - Validates the tracking_id format
     - Looks up the reminder
     - If found and `opened_at` is null, sets it to current time
     - Increments `open_count`
     - Returns a 1x1 transparent PNG

3. **UI Display**: In the Invoice Detail page:
   - Reminder history shows open status for each reminder
   - "Opened" badge (green) with relative time (e.g., "2 hours ago")
   - Shows open count if > 1 (e.g., "Opened 3 times")
   - "Not opened" badge (gray outline) for unopened emails

## Security Considerations

- **Service Role Key**: Only used in server-side API routes, never in client code
- **No Data Leakage**: Tracking endpoint always returns pixel, even for invalid IDs
- **UUID Validation**: Only processes valid UUID format tracking IDs
- **Error Handling**: Errors are logged but don't expose sensitive information

## Testing Locally

### 1. Run the Migration
```sql
-- In Supabase SQL Editor, run:
-- supabase/migrations/002_add_email_tracking.sql
```

### 2. Send a Test Reminder
- Create an invoice with a due date
- Either wait for cron job or manually resend an email via the UI
- Check the database to get the `tracking_id`:
  ```sql
  SELECT tracking_id, opened_at, open_count 
  FROM reminders 
  ORDER BY sent_at DESC 
  LIMIT 1;
  ```

### 3. Test the Tracking Pixel
- Open the tracking URL in a browser:
  ```
  http://localhost:3000/api/track/open?rid=<tracking_id>
  ```
- You should see a 1x1 transparent pixel
- Check the database again - `opened_at` should be set and `open_count` should be 1

### 4. Verify in UI
- Navigate to the invoice detail page
- Check the "Reminder History" section
- You should see "Opened" badge with relative time

### 5. Test Multiple Opens
- Open the tracking URL multiple times
- `open_count` should increment each time
- `opened_at` should remain the same (first open time)
- UI should show "Opened X times" if count > 1

## Environment Variables Required

- `NEXT_PUBLIC_APP_URL` - Must be set to your app URL (e.g., `http://localhost:3000` for local dev)
- `SUPABASE_SERVICE_ROLE_KEY` - Already required for admin operations

## Notes

- Tracking only works for HTML emails (not plain text)
- Some email clients block images by default, so opens may not be tracked
- Privacy-conscious clients may disable image loading
- The tracking pixel is invisible and doesn't affect email appearance
