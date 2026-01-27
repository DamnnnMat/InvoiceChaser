-- Create invoice_payments table for tracking partial and full payments
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_paid_at ON invoice_payments(paid_at);

-- Enable RLS
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view payments for their own invoices
CREATE POLICY "Users can view own invoice payments" ON invoice_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_payments.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can create payments for their own invoices
CREATE POLICY "Users can create own invoice payments" ON invoice_payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_payments.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update payments for their own invoices
CREATE POLICY "Users can update own invoice payments" ON invoice_payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_payments.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete payments for their own invoices
CREATE POLICY "Users can delete own invoice payments" ON invoice_payments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_payments.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );
