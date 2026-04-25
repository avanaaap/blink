-- Add nullifiers table for World ID duplicate-account prevention
CREATE TABLE IF NOT EXISTS nullifiers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nullifier  text NOT NULL,
  action     text NOT NULL,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (nullifier, action)
);

ALTER TABLE nullifiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to nullifiers"
  ON nullifiers FOR ALL
  USING (auth.role() = 'service_role');
