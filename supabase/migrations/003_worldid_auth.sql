-- Switch authentication from Supabase Auth to World ID
-- Profiles no longer reference auth.users — we manage our own UUIDs

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
