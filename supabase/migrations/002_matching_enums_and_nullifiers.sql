-- ============================================================
-- Migration 002: Align match_status & interaction_type enums
-- with the matching algorithm requirements, widen unlock_level
-- to 0-4, and add the nullifiers table for World ID enforcement.
-- ============================================================

-- 1. Update match_status enum to: pending, active, unmatched, connected
--    (replaces completed, expired, declined)
ALTER TYPE match_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE match_status ADD VALUE IF NOT EXISTS 'unmatched';
ALTER TYPE match_status ADD VALUE IF NOT EXISTS 'connected';

-- 2. Add post_connection to interaction_type
ALTER TYPE interaction_type ADD VALUE IF NOT EXISTS 'post_connection';

-- 3. Widen unlock_level CHECK constraint from 0-3 to 0-4
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_unlock_level_check;
ALTER TABLE matches ADD CONSTRAINT matches_unlock_level_check
  CHECK (unlock_level BETWEEN 0 AND 4);

-- 4. Update matches.status default to 'pending'
ALTER TABLE matches ALTER COLUMN status SET DEFAULT 'pending';

-- 5. Create nullifiers table for World ID one-person-one-account
CREATE TABLE IF NOT EXISTS nullifiers (
  nullifier   NUMERIC(78, 0) NOT NULL,
  action      TEXT NOT NULL,
  user_id     UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (nullifier, action)
);

-- 6. Index for fast matching eligibility queries
CREATE INDEX IF NOT EXISTS idx_profiles_eligible
  ON profiles (id)
  WHERE worldid_verified = true AND pause_matches = false;
