-- Add walkthrough completion flag to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS has_seen_walkthrough BOOLEAN DEFAULT FALSE NOT NULL;

-- Update existing users to not show walkthrough (optional - remove if you want existing users to see it)
-- UPDATE profiles SET has_seen_walkthrough = TRUE WHERE has_seen_walkthrough = FALSE;
