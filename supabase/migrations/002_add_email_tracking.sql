-- Add email tracking fields to reminders table
ALTER TABLE reminders
  ADD COLUMN IF NOT EXISTS tracking_id UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS open_count INTEGER DEFAULT 0 NOT NULL;

-- Create index for faster lookups by tracking_id
CREATE INDEX IF NOT EXISTS idx_reminders_tracking_id ON reminders(tracking_id);

-- Update existing reminders to have tracking_ids (if any exist)
UPDATE reminders SET tracking_id = uuid_generate_v4() WHERE tracking_id IS NULL;
