-- Enum types
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
CREATE TYPE gender_identity     AS ENUM ('Man', 'Woman', 'Non-binary', 'Prefer not to say');

-- 1. profiles
CREATE TABLE IF NOT EXISTS profiles (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 text NOT NULL,
  age                  integer NOT NULL CHECK (age >= 18),
  gender               gender_identity,
  sexuality            sexuality_option,
  interested_in        gender_option[] DEFAULT '{}',
  relationship_type    relationship_type,
  age_range_min        integer DEFAULT 18,
  age_range_max        integer DEFAULT 80,
  interests            interest_option[] DEFAULT '{}',
  relationship_meaning relationship_value[] DEFAULT '{}',
  time_with_partner    time_with_partner[] DEFAULT '{}',
  conflict_style       conflict_style,
  island_scenario      island_scenario,
  musical_instrument   musical_instrument,
  spending_habits      spending_habit,
  has_debt             debt_status,
  wants_kids           kids_preference,
  notifications_enabled boolean DEFAULT true,
  pause_matches        boolean DEFAULT false,
  worldid_verified     boolean DEFAULT false,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

-- 2. photos
CREATE TABLE IF NOT EXISTS photos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url        text NOT NULL,
  caption    text CHECK (char_length(caption) <= 60),
  sort_order integer NOT NULL CHECK (sort_order BETWEEN 0 AND 4),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, sort_order)
);

-- 3. matches
CREATE TABLE IF NOT EXISTS matches (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a              uuid NOT NULL REFERENCES profiles(id),
  user_b              uuid NOT NULL REFERENCES profiles(id),
  compatibility_score integer CHECK (compatibility_score BETWEEN 0 AND 100),
  shared_interests    interest_option[] DEFAULT '{}',
  match_date          date NOT NULL DEFAULT CURRENT_DATE,
  status              match_status DEFAULT 'active',
  unlock_level        integer DEFAULT 0 CHECK (unlock_level BETWEEN 0 AND 3),
  created_at          timestamptz DEFAULT now(),
  UNIQUE (user_a, user_b, match_date),
  CHECK (user_a < user_b)
);

-- 4. interactions
CREATE TABLE IF NOT EXISTS interactions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id         uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  interaction_type interaction_type NOT NULL,
  started_at       timestamptz NOT NULL DEFAULT now(),
  ended_at         timestamptz,
  duration_seconds integer,
  opted_out        boolean DEFAULT false
);

-- 5. ratings
CREATE TABLE IF NOT EXISTS ratings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id uuid NOT NULL REFERENCES interactions(id) ON DELETE CASCADE,
  rater_id       uuid NOT NULL REFERENCES profiles(id),
  rating         integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback       text,
  created_at     timestamptz DEFAULT now()
);

-- 6. messages
CREATE TABLE IF NOT EXISTS messages (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id  uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id),
  body      text NOT NULL,
  sent_at   timestamptz DEFAULT now()
);

-- 7. blocks
CREATE TABLE IF NOT EXISTS blocks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_not_paused ON profiles (id) WHERE pause_matches = false;
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles (id) WHERE worldid_verified = true;
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches (match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches (status);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages (match_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_ratings_interaction ON ratings (interaction_id);

-- Trigger for auto-updating updated_at on profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row-Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- profiles: users can read/update their own profile; read others for matching
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Service role full access to profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');

-- photos: users manage own photos; matched users can view after reveal
CREATE POLICY "Users can manage own photos" ON photos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full access to photos" ON photos FOR ALL USING (auth.role() = 'service_role');

-- matches: users can read their own matches
CREATE POLICY "Users can view own matches" ON matches FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "Service role full access to matches" ON matches FOR ALL USING (auth.role() = 'service_role');

-- interactions: users can view/insert for their matches
CREATE POLICY "Users can view own interactions" ON interactions FOR SELECT USING (
  match_id IN (SELECT id FROM matches WHERE user_a = auth.uid() OR user_b = auth.uid())
);
CREATE POLICY "Service role full access to interactions" ON interactions FOR ALL USING (auth.role() = 'service_role');

-- ratings: users can insert their own ratings and view them
CREATE POLICY "Users can insert own ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);
CREATE POLICY "Users can view own ratings" ON ratings FOR SELECT USING (auth.uid() = rater_id);
CREATE POLICY "Service role full access to ratings" ON ratings FOR ALL USING (auth.role() = 'service_role');

-- messages: users can read/send messages in their matches
CREATE POLICY "Users can view messages in own matches" ON messages FOR SELECT USING (
  match_id IN (SELECT id FROM matches WHERE user_a = auth.uid() OR user_b = auth.uid())
);
CREATE POLICY "Users can send messages in own matches" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND match_id IN (SELECT id FROM matches WHERE user_a = auth.uid() OR user_b = auth.uid())
);
CREATE POLICY "Service role full access to messages" ON messages FOR ALL USING (auth.role() = 'service_role');

-- blocks: users can manage their own blocks
CREATE POLICY "Users can manage own blocks" ON blocks FOR ALL USING (auth.uid() = blocker_id);
CREATE POLICY "Service role full access to blocks" ON blocks FOR ALL USING (auth.role() = 'service_role');
