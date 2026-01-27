-- Add fields for CSV import support
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS invoice_ref TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('unpaid', 'overdue', 'paid', 'partially_paid'));

-- Make client_email nullable to support CSV imports without email
ALTER TABLE invoices
  ALTER COLUMN client_email DROP NOT NULL;

-- Create unique index for invoice_ref per user (prevents duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_user_invoice_ref 
ON invoices(user_id, invoice_ref) 
WHERE invoice_ref IS NOT NULL;

-- Update is_paid based on status if status is provided
-- Note: This is a helper - the app logic should handle status updates
-- But we can set a default based on status
UPDATE invoices 
SET is_paid = CASE 
  WHEN status = 'paid' THEN TRUE 
  WHEN status = 'unpaid' OR status = 'overdue' THEN FALSE 
  ELSE is_paid 
END
WHERE status IS NOT NULL;
