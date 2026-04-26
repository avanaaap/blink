-- Migration: Convert interests, relationship_meaning, time_with_partner,
-- and conflict_style from enum/enum-array columns to free-response text (150 chars).
-- Preserves existing data by casting in-place.
-- Also converts shared_interests on matches to text[].

-- 1. profiles — array columns: flatten to comma-separated text, then constrain
--    interests (interest_option[]) → text
ALTER TABLE profiles
  ALTER COLUMN interests DROP DEFAULT,
  ALTER COLUMN interests TYPE text USING array_to_string(interests, ', '),
  ALTER COLUMN interests SET DEFAULT '';

ALTER TABLE profiles
  ADD CONSTRAINT chk_interests_len CHECK (char_length(interests) <= 150);

--    relationship_meaning (relationship_value[]) → text
ALTER TABLE profiles
  ALTER COLUMN relationship_meaning DROP DEFAULT,
  ALTER COLUMN relationship_meaning TYPE text USING array_to_string(relationship_meaning, ', '),
  ALTER COLUMN relationship_meaning SET DEFAULT '';

ALTER TABLE profiles
  ADD CONSTRAINT chk_relationship_meaning_len CHECK (char_length(relationship_meaning) <= 150);

--    time_with_partner (time_with_partner[]) → text
ALTER TABLE profiles
  ALTER COLUMN time_with_partner DROP DEFAULT,
  ALTER COLUMN time_with_partner TYPE text USING array_to_string(time_with_partner, ', '),
  ALTER COLUMN time_with_partner SET DEFAULT '';

ALTER TABLE profiles
  ADD CONSTRAINT chk_time_with_partner_len CHECK (char_length(time_with_partner) <= 150);

-- 2. profiles — enum column: cast to text
--    conflict_style (conflict_style enum) → text
ALTER TABLE profiles
  ALTER COLUMN conflict_style TYPE text USING conflict_style::text;

ALTER TABLE profiles
  ADD CONSTRAINT chk_conflict_style_len CHECK (char_length(conflict_style) <= 150);

-- 3. matches — shared_interests: convert from interest_option[] to text[]
ALTER TABLE matches
  ALTER COLUMN shared_interests DROP DEFAULT,
  ALTER COLUMN shared_interests TYPE text[] USING shared_interests::text[],
  ALTER COLUMN shared_interests SET DEFAULT '{}';
