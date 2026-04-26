-- Add bio field to profiles (150 character max, free-response)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio text DEFAULT '' CHECK (char_length(bio) <= 150);
