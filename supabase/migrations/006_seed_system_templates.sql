-- Seed 6 system templates with active versions

-- 1. Friendly Nudge (Pre-Due)
INSERT INTO templates (id, user_id, slug, name, tone, description, is_system)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'friendly-pre-due',
  'Friendly Nudge (Pre-Due)',
  'friendly',
  'A gentle reminder 3-5 days before the due date.',
  TRUE
) ON CONFLICT DO NOTHING;

INSERT INTO template_versions (template_id, name, subject, body, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default',
  'Friendly Reminder: Invoice {invoice_number} due soon',
  'Hi {client_name},

Just a friendly reminder that your invoice {invoice_number} for £{amount} is due on {due_date}.

If you have any questions or concerns, please don''t hesitate to reach out.

Thank you for your business!

Best regards,
{sender_name}',
  TRUE
) ON CONFLICT DO NOTHING;

-- 2. Due-Today Reminder
INSERT INTO templates (id, user_id, slug, name, tone, description, is_system)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  NULL,
  'due-today',
  'Due-Today Reminder',
  'neutral',
  'A reminder email on the invoice due date.',
  TRUE
) ON CONFLICT DO NOTHING;

INSERT INTO template_versions (template_id, name, subject, body, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Default',
  'Invoice {invoice_number} due today',
  'Hi {client_name},

This is a reminder that invoice {invoice_number} for £{amount} is due today ({due_date}).

Please arrange payment at your earliest convenience.

Thank you,
{sender_name}',
  TRUE
) ON CONFLICT DO NOTHING;

-- 3. Polite Overdue Reminder
INSERT INTO templates (id, user_id, slug, name, tone, description, is_system)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  NULL,
  'polite-overdue',
  'Polite Overdue Reminder',
  'polite',
  'Courteous follow-up shortly after an invoice is overdue.',
  TRUE
) ON CONFLICT DO NOTHING;

INSERT INTO template_versions (template_id, name, subject, body, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Default',
  'Reminder: Invoice {invoice_number} is overdue',
  'Hi {client_name},

I hope this message finds you well. I wanted to follow up on invoice {invoice_number} for £{amount}, which was due on {due_date} and is now overdue.

If there''s anything preventing payment or if you need to discuss payment terms, please let me know so we can work together to resolve this.

Thank you for your attention to this matter.

Best regards,
{sender_name}',
  TRUE
) ON CONFLICT DO NOTHING;

-- 4. Firm Follow-Up
INSERT INTO templates (id, user_id, slug, name, tone, description, is_system)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  NULL,
  'firm-follow-up',
  'Firm Follow-Up',
  'firm',
  'Stronger nudge for persistent overdue invoices.',
  TRUE
) ON CONFLICT DO NOTHING;

INSERT INTO template_versions (template_id, name, subject, body, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'Default',
  'Overdue invoice - action required',
  'Hi {client_name},

Invoice {invoice_number} for £{amount} remains outstanding since {due_date}.

Please confirm when payment will be made. If there''s an issue, let me know so we can resolve it.

I look forward to your prompt response.

Regards,
{sender_name}',
  TRUE
) ON CONFLICT DO NOTHING;

-- 5. Final Notice
INSERT INTO templates (id, user_id, slug, name, tone, description, is_system)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  NULL,
  'final-notice',
  'Final Notice',
  'final',
  'Final warning when an invoice is unpaid for 2+ weeks.',
  TRUE
) ON CONFLICT DO NOTHING;

INSERT INTO template_versions (template_id, name, subject, body, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'Default',
  'Final Notice: Urgent payment required for invoice {invoice_number}',
  'Hi {client_name},

This is a final notice regarding invoice {invoice_number} for £{amount}, which was due on {due_date} and is now significantly overdue.

Immediate payment is required. If payment is not received by {final_date}, we may need to take further action.

Please contact me immediately to arrange payment or discuss a payment plan.

{sender_name}',
  TRUE
) ON CONFLICT DO NOTHING;

-- 6. Partial Payment Acknowledgement
INSERT INTO templates (id, user_id, slug, name, tone, description, is_system)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  NULL,
  'partial-payment',
  'Partial Payment Acknowledgement',
  'partial',
  'Acknowledgment when a partial payment is received.',
  TRUE
) ON CONFLICT DO NOTHING;

INSERT INTO template_versions (template_id, name, subject, body, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  'Default',
  'Payment received: Invoice {invoice_number}',
  'Hi {client_name},

Thank you for your payment of £{paid_amount} towards invoice {invoice_number}.

The outstanding balance is now £{outstanding_amount}. Please arrange payment for the remaining amount by {due_date}.

If you have any questions, please don''t hesitate to contact me.

Thank you,
{sender_name}',
  TRUE
) ON CONFLICT DO NOTHING;
