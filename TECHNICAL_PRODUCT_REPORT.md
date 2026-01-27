# InvoiceSeen - Technical Product Report

**Version:** 1.0  
**Date:** January 2024  
**Platform:** Next.js 14 (App Router) + Supabase + Stripe + Resend

---

## Executive Summary

InvoiceSeen is a micro-SaaS platform designed to automate invoice chasing and payment reminders. The platform eliminates manual follow-up work by sending automated, trackable email reminders to clients based on invoice due dates, while providing comprehensive tracking and management tools for businesses.

---

## Platform Architecture

### Technology Stack

**Frontend:**
- Next.js 14 (App Router) with React 18
- TypeScript
- Tailwind CSS + shadcn/ui components
- Server Components & Client Components pattern

**Backend:**
- Supabase (PostgreSQL + Auth + RLS)
- Next.js API Routes
- Vercel Serverless Functions

**Third-Party Services:**
- **Stripe** - Subscription billing (£9/month)
- **Resend** - Transactional email delivery
- **Vercel Cron** - Scheduled reminder jobs

**Infrastructure:**
- Hosted on Vercel
- Custom domain support (invoiceseen.com)
- Environment-based configuration

---

## Core Features

### 1. Authentication & User Management

**What it does:**
- Email + password authentication via Supabase Auth
- Secure session management
- User profile creation on signup
- Protected routes with middleware

**Key Functions:**
- Sign up / Login / Logout
- Password reset (via Supabase)
- Session persistence
- Automatic profile creation

**Pain Points Solved:**
- ✅ No need to build custom auth system
- ✅ Secure, production-ready authentication
- ✅ Automatic user profile management

---

### 2. Invoice Management

**What it does:**
Complete CRUD operations for invoices with advanced tracking and payment management.

**Key Functions:**

#### Invoice CRUD
- Create new invoices with client details
- View all invoices in a table/list view
- Edit invoice details
- Delete invoices
- Search and filter by status (all, upcoming, overdue, paid)

#### Payment Tracking
- Record partial payments
- Track full payments
- Automatic outstanding balance calculation
- Payment history with notes and dates
- Delete payment records

#### Status Management
- Automatic status calculation:
  - **Paid** - Outstanding balance = 0
  - **Partially Paid** - Payments made but balance > 0
  - **Overdue** - Past due date and not paid
  - **Upcoming** - Future due date
- Manual "Mark as Paid" option

#### CSV Bulk Import
- Upload CSV files to import multiple invoices
- Preview and validate before import
- Duplicate detection (via `invoice_ref` unique constraint)
- Error reporting for invalid rows
- Sample CSV download

**Data Model:**
```sql
invoices:
  - id (UUID)
  - user_id (FK)
  - invoice_ref (TEXT, unique per user)
  - client_name (TEXT)
  - client_email (TEXT, nullable)
  - amount (DECIMAL 10,2)
  - due_date (TIMESTAMP)
  - is_paid (BOOLEAN)
  - status (TEXT: unpaid|overdue|paid|partially_paid)
  - notes (TEXT, nullable)
  - reminder_schedule (TEXT)
  - created_at, updated_at
```

**Pain Points Solved:**
- ✅ Manual invoice entry is time-consuming → **CSV bulk import**
- ✅ Hard to track payment status → **Automatic status calculation**
- ✅ Partial payments are confusing → **Payment tracking with outstanding balance**
- ✅ No audit trail → **Activity timeline with full history**
- ✅ Duplicate invoices → **Unique constraint on invoice_ref**

---

### 3. Automated Email Reminders

**What it does:**
Automatically sends email reminders to clients based on invoice due dates using a scheduled cron job.

**Reminder Schedule:**
- **Before Due Date** - 3-5 days before due date (friendly tone)
- **On Due Date** - Exact due date (neutral tone)
- **After Due Date** - Weekly after overdue (escalating tone: polite → firm → final)

**Key Functions:**
- Vercel Cron job runs daily (`/api/cron/reminders`)
- Checks all unpaid invoices
- Calculates days until/after due date
- Sends appropriate reminder based on schedule
- Prevents duplicate sends (one per type per day)
- Logs all sent reminders with status

**Technical Implementation:**
- Serverless cron endpoint (Vercel Cron)
- Secure with `CRON_SECRET` authentication
- Batch processing of invoices
- Error handling and logging
- Integration with template system

**Pain Points Solved:**
- ✅ Manual follow-up is repetitive → **Fully automated**
- ✅ Easy to forget to follow up → **Never miss a reminder**
- ✅ Time-consuming to send emails → **Zero manual effort**
- ✅ No tracking of what was sent → **Complete audit trail**

---

### 4. Email Templates System

**What it does:**
Professional email template management with versioning, workflow configuration, and customization.

**Key Functions:**

#### System Templates (6 Pre-built)
1. **Friendly Nudge (Pre-Due)** - Gentle reminder before due date
2. **Due-Today Reminder** - Neutral reminder on due date
3. **Polite Overdue Reminder** - Courteous follow-up after overdue
4. **Firm Follow-Up** - Stronger nudge for persistent overdue
5. **Final Notice** - Final warning for 2+ weeks overdue
6. **Partial Payment Acknowledgement** - Confirms partial payment received

#### Template Management
- **View** - Preview system templates without cloning
- **Clone** - Copy system templates to customize
- **Create** - Build new templates from scratch
- **Edit** - Modify template content
- **Versioning** - Save changes as new versions
- **Rollback** - Activate previous versions
- **Delete** - Remove custom templates

#### Template Editor
- Template name and description
- Tone selector (friendly, neutral, polite, firm, final, partial)
- Subject line editor
- Body text editor with variable insertion
- Live preview with sample data
- Variable dropdown for easy insertion:
  - `{client_name}`, `{client_email}`
  - `{invoice_number}`, `{amount}`
  - `{due_date}`, `{outstanding_amount}`
  - `{paid_amount}`, `{sender_name}`

#### Workflow Configuration
- Set which template is used for each reminder type:
  - Before Due Date
  - On Due Date
  - After Due Date
  - Partial Payment
- Visual distinction of active templates
- Clear workflow management UI

**Data Model:**
```sql
templates:
  - id (UUID)
  - user_id (UUID, nullable for system templates)
  - slug (TEXT, for system templates)
  - name (TEXT)
  - tone (TEXT: friendly|neutral|polite|firm|final|partial)
  - description (TEXT)
  - is_system (BOOLEAN)
  - reminder_type (TEXT, nullable: before_due|on_due|after_due|partial_payment)
  - workflow_order (INTEGER, nullable)

template_versions:
  - id (UUID)
  - template_id (FK)
  - name (TEXT, nullable)
  - subject (TEXT)
  - body (TEXT)
  - is_active (BOOLEAN)
  - created_at, updated_at
```

**Pain Points Solved:**
- ✅ Generic emails don't reflect brand → **Fully customizable templates**
- ✅ Hard to test email changes → **Versioning with rollback**
- ✅ Unclear which templates are active → **Workflow configuration**
- ✅ No professional templates to start → **6 pre-built system templates**

---

### 5. Email Open Tracking

**What it does:**
Tracks when reminder emails are opened by clients using a pixel-based tracking system.

**Key Functions:**
- 1x1 transparent GIF pixel embedded in emails
- Unique tracking ID per reminder
- Records first open timestamp (`opened_at`)
- Tracks open count (multiple opens)
- Secure tracking endpoint (`/api/track/open`)
- Privacy-focused (always returns pixel, even on error)

**Display in UI:**
- "Opened" / "Not opened yet" status badges
- First opened timestamp
- Open count (if > 1, shows "Opened X times")
- Visible in invoice activity timeline
- Detailed view in invoice history page

**Data Model:**
```sql
reminders:
  - tracking_id (UUID, unique)
  - opened_at (TIMESTAMP, nullable)
  - open_count (INTEGER, default 0)
```

**Pain Points Solved:**
- ✅ Don't know if clients saw the email → **Open tracking**
- ✅ No visibility into engagement → **Open count and timestamps**
- ✅ Can't prove email was delivered → **Delivery confirmation**

---

### 6. Activity Timeline

**What it does:**
Unified timeline view showing all invoice-related events in chronological order.

**Event Types:**
1. **Invoice Created** - When invoice was added
2. **Reminder Sent** - Email reminder dispatched
3. **Reminder Opened** - Client opened the email
4. **Reminder Failed** - Email delivery failed
5. **Payment Received** - Partial or full payment recorded
6. **Marked Paid** - Invoice marked as paid

**Key Functions:**
- Chronological event list (newest first)
- Visual icons for each event type
- Color-coded status indicators
- Summary strip showing:
  - Outstanding balance
  - Last seen (latest open timestamp)
  - Overdue badge (if applicable)
- Detailed event metadata:
  - Template used (for reminders)
  - Manual vs Automated badge
  - Payment amounts and notes
  - Error messages (for failures)

**Pain Points Solved:**
- ✅ Hard to see invoice history → **Complete timeline view**
- ✅ Unclear what happened when → **Chronological event list**
- ✅ No visibility into client engagement → **Last seen tracking**

---

### 7. Invoice History & Audit Trail

**What it does:**
Detailed audit trail page showing complete information about all reminders sent for an invoice.

**Key Functions:**
- Full reminder history with all details
- Template information (name, tone, subject, body)
- Manual vs Automated indicator
- Open status and timestamps
- Error messages (full details)
- Expandable error messages for long content
- Link from main invoice page

**Pain Points Solved:**
- ✅ Need detailed audit trail → **Complete history page**
- ✅ Hard to debug email issues → **Full error messages**
- ✅ Unclear which template was used → **Template details in history**

---

### 8. Dashboard

**What it does:**
Overview page showing key metrics and recent activity after login.

**Key Metrics:**
- Total Invoices
- Unpaid Invoices
- Overdue Invoices
- Total Outstanding

**Recent Activity:**
- Recent invoices list
- Recent reminders sent
- Quick access to key actions

**Pain Points Solved:**
- ✅ Need quick overview → **Dashboard with key metrics**
- ✅ Hard to see what's happening → **Recent activity feed**

---

### 9. Subscription Billing

**What it does:**
Stripe-powered subscription management with access control.

**Key Functions:**
- Single plan: £9/month
- Stripe Checkout integration
- Webhook handling for subscription updates
- Access gating (block features if not subscribed)
- Subscription status display
- Billing management page

**Technical Implementation:**
- Stripe Checkout Sessions
- Webhook signature verification
- Subscription status sync
- RLS policies for access control

**Pain Points Solved:**
- ✅ Need recurring revenue → **Subscription model**
- ✅ Payment processing complexity → **Stripe integration**
- ✅ Access control → **Subscription gating**

---

### 10. CSV Bulk Import

**What it does:**
Import multiple invoices at once from a CSV file.

**Key Functions:**
- CSV file upload
- Client-side parsing and validation
- Preview first 20 rows
- Error highlighting per row
- Duplicate detection (via `invoice_ref`)
- Batch import with summary
- Sample CSV download

**CSV Format:**
- Required: `invoice_ref`, `client_name`, `amount`, `due_date`
- Optional: `client_email`, `status`, `notes`

**Validation:**
- Required fields check
- Amount must be positive number
- Due date must be valid (YYYY-MM-DD)
- Email format validation (if provided)
- Status must be valid enum value

**Pain Points Solved:**
- ✅ Manual entry is slow → **Bulk import**
- ✅ Data entry errors → **Validation before import**
- ✅ Duplicate invoices → **Unique constraint**
- ✅ Unclear format → **Sample CSV download**

---

## Key Technical Features

### Security

**Row Level Security (RLS):**
- All tables have RLS enabled
- Users can only access their own data
- Policies enforced at database level
- No client-side security bypass possible

**Authentication:**
- Supabase Auth with secure sessions
- Middleware protection for routes
- API route authentication checks
- Service role key for admin operations

**Data Protection:**
- Environment variables for secrets
- No sensitive data in client code
- Secure API endpoints
- Webhook signature verification

### Performance

**Optimizations:**
- Server Components for data fetching
- Client Components only when needed
- Efficient database queries with indexes
- Batch operations for imports
- Lazy loading where appropriate

**Database Indexes:**
- `idx_invoices_user_id` - Fast user invoice queries
- `idx_invoices_due_date` - Efficient date filtering
- `idx_invoices_user_invoice_ref` - Duplicate prevention
- `idx_reminders_tracking_id` - Fast tracking lookups
- `idx_template_versions_is_active` - Active version queries

### Scalability

**Architecture:**
- Serverless functions (Vercel)
- Stateless API routes
- Database connection pooling (Supabase)
- Cron jobs for background processing
- No server management required

---

## Pain Points Solved - Summary

| Pain Point | Solution | Feature |
|------------|----------|---------|
| Manual invoice entry is slow | CSV bulk import | Import multiple invoices at once |
| Hard to track payment status | Automatic status calculation | Real-time outstanding balance |
| Partial payments are confusing | Payment tracking system | Record and track partial payments |
| Manual follow-up is repetitive | Automated reminders | Cron-based email automation |
| Easy to forget to follow up | Scheduled reminders | Never miss a reminder |
| Generic emails don't reflect brand | Custom templates | Fully customizable email templates |
| Hard to test email changes | Template versioning | Save versions and rollback |
| Unclear which templates are active | Workflow configuration | Visual workflow management |
| Don't know if clients saw email | Open tracking | Pixel-based email tracking |
| Hard to see invoice history | Activity timeline | Complete chronological event list |
| No visibility into engagement | Last seen tracking | Track when clients last opened email |
| Need detailed audit trail | Invoice history page | Complete reminder audit trail |
| Hard to debug email issues | Full error messages | Detailed error logging |
| Duplicate invoices | Unique constraint | Prevent duplicates on import |
| No professional templates | System templates | 6 pre-built templates |

---

## Database Schema Overview

### Core Tables

1. **profiles** - User profiles (extends Supabase auth.users)
2. **invoices** - Invoice records with payment tracking
3. **invoice_payments** - Payment history (partial/full payments)
4. **reminders** - Sent reminder emails with tracking
5. **templates** - Email templates (system + user)
6. **template_versions** - Template version history
7. **subscriptions** - Stripe subscription records

### Key Relationships

- `invoices.user_id` → `profiles.id`
- `invoice_payments.invoice_id` → `invoices.id`
- `reminders.invoice_id` → `invoices.id`
- `reminders.template_id` → `templates.id`
- `template_versions.template_id` → `templates.id`

### Constraints

- Unique: `(user_id, invoice_ref)` - Prevents duplicate invoices
- Unique: `(template_id, is_active)` - One active version per template
- Check: `status IN ('unpaid', 'overdue', 'paid', 'partially_paid')`
- Check: `tone IN ('friendly', 'neutral', 'polite', 'firm', 'final', 'partial')`

---

## API Endpoints

### Authentication
- `POST /api/auth/*` - Handled by Supabase

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice
- `PATCH /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `POST /api/invoices/import` - Bulk import from CSV
- `POST /api/invoices/[id]/payments` - Add payment
- `DELETE /api/invoices/[id]/payments` - Delete payment
- `POST /api/invoices/[id]/resend-email` - Manually resend reminder

### Templates
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `PUT /api/templates/[id]` - Update template
- `DELETE /api/templates/[id]` - Delete template
- `POST /api/templates/[id]/clone` - Clone template
- `PATCH /api/templates/[id]/workflow` - Set workflow config
- `POST /api/templates/[id]/versions/[versionId]/activate` - Activate version

### Billing
- `POST /api/billing/create-checkout-session` - Create Stripe checkout
- `POST /api/billing/webhook` - Handle Stripe webhooks

### Tracking
- `GET /api/track/open?rid=[tracking_id]` - Email open tracking pixel

### Cron
- `GET /api/cron/reminders` - Automated reminder job (Vercel Cron)

---

## Deployment & Infrastructure

### Hosting
- **Platform:** Vercel
- **Domain:** invoiceseen.com
- **SSL:** Automatic (Vercel)
- **CDN:** Global edge network

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `RESEND_API_KEY` - Resend API key
- `EMAIL_FROM` - Sender email address
- `NEXT_PUBLIC_APP_URL` - App URL for tracking pixels
- `CRON_SECRET` - Secret for cron job authentication

### Scheduled Jobs
- **Reminder Cron:** Daily at configured time (Vercel Cron)
- **Endpoint:** `/api/cron/reminders`
- **Authentication:** Bearer token with `CRON_SECRET`

---

## User Workflows

### 1. New User Onboarding
1. Sign up with email + password
2. Redirected to dashboard
3. Prompted to subscribe (if not subscribed)
4. Can start creating invoices or importing CSV

### 2. Invoice Creation Flow
1. Click "Add Invoice" or "Import CSV"
2. Fill in invoice details (or upload CSV)
3. Invoice created with status "unpaid"
4. Appears in invoices list
5. Automated reminders start based on due date

### 3. Reminder Automation Flow
1. Cron job runs daily
2. Checks all unpaid invoices
3. Calculates days until/after due date
4. Sends appropriate reminder (if not sent today)
5. Logs reminder with tracking ID
6. Client receives email with tracking pixel
7. When opened, tracking pixel fires
8. UI updates to show "Opened" status

### 4. Payment Tracking Flow
1. User clicks "Add Payment" on invoice
2. Enters amount, date, optional note
3. Payment recorded in `invoice_payments` table
4. Outstanding balance recalculated
5. Status updates (Partially Paid / Paid)
6. Timeline shows "Payment Received" event

### 5. Template Customization Flow
1. View system templates
2. Clone desired template
3. Edit in template editor
4. Preview with sample data
5. Save as new version (or replace active)
6. Set as active for workflow (optional)
7. Future reminders use new template

---

## Future Enhancements (Not Implemented)

### Potential Additions
- Multi-currency support
- Recurring invoices
- Client portal
- Advanced reporting/analytics
- Email scheduling customization
- SMS reminders
- Integration with accounting software
- Team/collaboration features
- Custom domains for emails
- A/B testing for templates

---

## Technical Debt & Considerations

### Current Limitations
- Single currency (GBP/£)
- No recurring invoice support
- No client self-service portal
- Limited reporting/analytics
- Email-only reminders (no SMS)
- No mobile app

### Known Issues
- None currently identified

### Performance Considerations
- Cron job processes all invoices (may need batching for large datasets)
- No pagination on invoices list (may need for 1000+ invoices)
- Template preview uses sample data (not real invoice data)

---

## Conclusion

InvoiceSeen is a production-ready micro-SaaS platform that successfully automates invoice chasing workflows. The platform addresses key pain points in invoice management through automation, tracking, and user-friendly interfaces. With a solid technical foundation built on modern technologies, the platform is scalable, secure, and maintainable.

**Key Strengths:**
- ✅ Complete automation of reminder emails
- ✅ Comprehensive tracking and visibility
- ✅ Flexible template system
- ✅ Bulk import capabilities
- ✅ Secure and scalable architecture
- ✅ Professional UI/UX

**Ready for:**
- Production deployment
- User onboarding
- Scaling to thousands of invoices
- Feature expansion

---

**Report Generated:** January 2024  
**Platform Version:** 1.0  
**Last Updated:** After CSV Import Implementation
