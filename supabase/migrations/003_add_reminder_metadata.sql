-- Add fields to track manual vs automated reminders and template used
ALTER TABLE reminders
  ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS template_type TEXT; -- Store template type for reference even if template is deleted

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reminders_is_manual ON reminders(is_manual);
CREATE INDEX IF NOT EXISTS idx_reminders_template_id ON reminders(template_id);
