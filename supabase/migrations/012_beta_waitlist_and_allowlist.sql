-- Beta waitlist: public can insert, only service role can read
CREATE TABLE beta_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  role text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE beta_waitlist ENABLE ROW LEVEL SECURITY;

-- No public SELECT or INSERT (only service role via API)
CREATE POLICY "No public read on beta_waitlist"
  ON beta_waitlist FOR SELECT
  USING (false);

CREATE POLICY "No public write on beta_waitlist"
  ON beta_waitlist FOR INSERT
  WITH CHECK (false);

-- Service role bypasses RLS (used by /api/waitlist)

-- Beta allowlist: only service role reads; used to gate signup and /app access
CREATE TABLE beta_allowlist (
  email text PRIMARY KEY,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE beta_allowlist ENABLE ROW LEVEL SECURITY;

-- No public read or write (only service role / backend)
CREATE POLICY "No public access on beta_allowlist"
  ON beta_allowlist FOR ALL
  USING (false)
  WITH CHECK (false);

-- Index for waitlist admin queries
CREATE INDEX idx_beta_waitlist_created_at ON beta_waitlist(created_at DESC);
