-- Add workflow configuration fields to templates table
ALTER TABLE templates
  ADD COLUMN IF NOT EXISTS reminder_type TEXT CHECK (reminder_type IN ('before_due', 'on_due', 'after_due', 'partial_payment')),
  ADD COLUMN IF NOT EXISTS workflow_order INTEGER DEFAULT NULL;

-- Create index for workflow queries
CREATE INDEX IF NOT EXISTS idx_templates_user_reminder_type ON templates(user_id, reminder_type) WHERE reminder_type IS NOT NULL;

-- Add comment
COMMENT ON COLUMN templates.reminder_type IS 'If set, this template is active for this reminder type in the workflow';
COMMENT ON COLUMN templates.workflow_order IS 'Order in which this template appears in the workflow (lower = earlier)';
