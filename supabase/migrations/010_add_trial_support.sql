-- Add trial fields to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Create index for trial queries
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON profiles(trial_ends_at) WHERE trial_ends_at IS NOT NULL;

-- Update existing function to include trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, trial_started_at, trial_ends_at)
  VALUES (
    NEW.id, 
    NEW.email,
    NOW(),
    NOW() + INTERVAL '30 days'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    -- Only set trial if it doesn't exist
    trial_started_at = COALESCE(profiles.trial_started_at, EXCLUDED.trial_started_at),
    trial_ends_at = COALESCE(profiles.trial_ends_at, EXCLUDED.trial_ends_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users without trial to have a trial (optional - comment out if you don't want this)
-- UPDATE profiles 
-- SET trial_started_at = created_at, trial_ends_at = created_at + INTERVAL '30 days'
-- WHERE trial_started_at IS NULL AND created_at > NOW() - INTERVAL '30 days';
