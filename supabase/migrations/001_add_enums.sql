-- ============================================================
-- Migration: convert free-text select/multi-select columns to
-- PostgreSQL enum types for data integrity.
-- ============================================================

-- 1. Create enum types
CREATE TYPE gender_option        AS ENUM ('Women', 'Men', 'Non-binary');
CREATE TYPE relationship_type    AS ENUM ('Monogamy', 'Polyamory', 'Open to Either');
CREATE TYPE interest_option      AS ENUM ('Travel', 'Music', 'Art', 'Sports', 'Cooking', 'Reading', 'Technology', 'Fitness', 'Movies', 'Photography', 'Gaming', 'Nature');
CREATE TYPE relationship_value   AS ENUM ('Emotional support', 'Quality time', 'Trust & connection', 'Shared experiences', 'Commitment', 'Physical affection');
CREATE TYPE time_with_partner    AS ENUM ('Mostly together', 'Balanced', 'Need personal space', 'Depends on the relationship');
CREATE TYPE conflict_style       AS ENUM ('Talk it out right away', 'Take space, then come back to it', 'Avoid it / keep the peace');
CREATE TYPE island_scenario      AS ENUM ('Cry', 'Explore the island for resources', 'Try to signal for help', 'Stay calm and make a plan');
CREATE TYPE musical_instrument   AS ENUM ('Guitar', 'Piccolo', 'Tuba', 'Saxophone', 'Flute', 'Clarinet');
CREATE TYPE sexuality_option     AS ENUM ('Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Prefer not to say');
CREATE TYPE spending_habit       AS ENUM ('Frugal / Saver', 'Balanced', 'Enjoy spending', 'Live in the moment');
CREATE TYPE debt_status          AS ENUM ('No debt', 'Student loans', 'Credit card debt', 'Prefer not to say');
CREATE TYPE kids_preference      AS ENUM ('Yes', 'No', 'Maybe / Open to it', 'Already have kids');
CREATE TYPE match_status         AS ENUM ('active', 'completed', 'expired', 'declined');
CREATE TYPE interaction_type     AS ENUM ('chat', 'voice', 'video');

-- 2. Drop defaults on array columns before casting (text[] default '{}' can't auto-cast)
ALTER TABLE profiles ALTER COLUMN interested_in        DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN interests            DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN relationship_meaning DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN time_with_partner    DROP DEFAULT;
-- Also on matches
ALTER TABLE matches ALTER COLUMN shared_interests DROP DEFAULT;
ALTER TABLE matches ALTER COLUMN status            DROP DEFAULT;

-- 3. Migrate profiles single-select columns from text → enum
ALTER TABLE profiles
  ALTER COLUMN relationship_type   TYPE relationship_type  USING relationship_type::relationship_type,
  ALTER COLUMN conflict_style      TYPE conflict_style     USING conflict_style::conflict_style,
  ALTER COLUMN island_scenario     TYPE island_scenario    USING island_scenario::island_scenario,
  ALTER COLUMN musical_instrument  TYPE musical_instrument USING musical_instrument::musical_instrument,
  ALTER COLUMN sexuality           TYPE sexuality_option    USING sexuality::sexuality_option,
  ALTER COLUMN spending_habits     TYPE spending_habit      USING spending_habits::spending_habit,
  ALTER COLUMN has_debt            TYPE debt_status         USING has_debt::debt_status,
  ALTER COLUMN wants_kids          TYPE kids_preference     USING wants_kids::kids_preference;

-- 4. Migrate profiles multi-select (array) columns
ALTER TABLE profiles
  ALTER COLUMN interested_in        TYPE gender_option[]      USING interested_in::gender_option[],
  ALTER COLUMN interests            TYPE interest_option[]    USING interests::interest_option[],
  ALTER COLUMN relationship_meaning TYPE relationship_value[] USING relationship_meaning::relationship_value[],
  ALTER COLUMN time_with_partner    TYPE time_with_partner[]  USING time_with_partner::time_with_partner[];

-- Re-add defaults for array columns
ALTER TABLE profiles ALTER COLUMN interested_in        SET DEFAULT '{}';
ALTER TABLE profiles ALTER COLUMN interests            SET DEFAULT '{}';
ALTER TABLE profiles ALTER COLUMN relationship_meaning SET DEFAULT '{}';
ALTER TABLE profiles ALTER COLUMN time_with_partner    SET DEFAULT '{}';

-- 5. Migrate matches.status from text → enum (drop old CHECK first)
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_status_check;
ALTER TABLE matches
  ALTER COLUMN status TYPE match_status USING status::match_status;
ALTER TABLE matches ALTER COLUMN status SET DEFAULT 'active';

-- 6. Migrate matches.shared_interests to use interest_option[]
ALTER TABLE matches
  ALTER COLUMN shared_interests TYPE interest_option[] USING shared_interests::interest_option[];
ALTER TABLE matches ALTER COLUMN shared_interests SET DEFAULT '{}';

-- 7. Migrate interactions.interaction_type from text → enum (drop old CHECK first)
ALTER TABLE interactions DROP CONSTRAINT IF EXISTS interactions_interaction_type_check;
ALTER TABLE interactions
  ALTER COLUMN interaction_type TYPE interaction_type USING interaction_type::interaction_type;
