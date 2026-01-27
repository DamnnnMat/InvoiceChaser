-- Create templates table (system defaults + user templates)
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT, -- For system templates (e.g., 'friendly-pre-due')
  name TEXT NOT NULL,
  tone TEXT NOT NULL CHECK (tone IN ('friendly', 'neutral', 'polite', 'firm', 'final', 'partial')),
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Unique constraint: users can't have duplicate template names (but system templates can have any name)
CREATE UNIQUE INDEX IF NOT EXISTS idx_templates_user_name_unique 
ON templates(user_id, name) 
WHERE user_id IS NOT NULL;

-- Create template_versions table
CREATE TABLE IF NOT EXISTS template_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE NOT NULL,
  name TEXT, -- Version label (e.g., "January wording")
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_is_system ON templates(is_system);
CREATE INDEX IF NOT EXISTS idx_template_versions_template_id ON template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_is_active ON template_versions(template_id, is_active) WHERE is_active = TRUE;

-- Partial unique index to ensure only one active version per template
CREATE UNIQUE INDEX IF NOT EXISTS idx_template_versions_one_active 
ON template_versions(template_id) 
WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates
-- Users can view system templates and their own templates
CREATE POLICY "Users can view system templates" ON templates
  FOR SELECT USING (is_system = TRUE);

CREATE POLICY "Users can view own templates" ON templates
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own templates
CREATE POLICY "Users can create own templates" ON templates
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

-- Users can update their own templates (but not system templates)
CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE USING (auth.uid() = user_id AND is_system = FALSE);

-- Users can delete their own templates (soft delete via is_active on versions, or hard delete)
CREATE POLICY "Users can delete own templates" ON templates
  FOR DELETE USING (auth.uid() = user_id AND is_system = FALSE);

-- RLS Policies for template_versions
-- Users can view versions for system templates and their own templates
CREATE POLICY "Users can view system template versions" ON template_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM templates 
      WHERE templates.id = template_versions.template_id 
      AND templates.is_system = TRUE
    )
  );

CREATE POLICY "Users can view own template versions" ON template_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM templates 
      WHERE templates.id = template_versions.template_id 
      AND templates.user_id = auth.uid()
    )
  );

-- Users can create versions for their own templates
CREATE POLICY "Users can create own template versions" ON template_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM templates 
      WHERE templates.id = template_versions.template_id 
      AND templates.user_id = auth.uid()
      AND templates.is_system = FALSE
    )
  );

-- Users can update versions for their own templates
CREATE POLICY "Users can update own template versions" ON template_versions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM templates 
      WHERE templates.id = template_versions.template_id 
      AND templates.user_id = auth.uid()
      AND templates.is_system = FALSE
    )
  );

-- Users can delete versions for their own templates
CREATE POLICY "Users can delete own template versions" ON template_versions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM templates 
      WHERE templates.id = template_versions.template_id 
      AND templates.user_id = auth.uid()
      AND templates.is_system = FALSE
    )
  );

-- Function to ensure only one active version per template
CREATE OR REPLACE FUNCTION ensure_single_active_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = TRUE THEN
    -- Set all other versions of this template to inactive
    UPDATE template_versions
    SET is_active = FALSE
    WHERE template_id = NEW.template_id
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single active version
CREATE TRIGGER trigger_single_active_version
  BEFORE INSERT OR UPDATE ON template_versions
  FOR EACH ROW
  WHEN (NEW.is_active = TRUE)
  EXECUTE FUNCTION ensure_single_active_version();
