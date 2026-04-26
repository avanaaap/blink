-- Add gender identity field to profiles for proper matching
-- interested_in stores what gender a user wants; gender stores what they identify as.

CREATE TYPE gender_identity AS ENUM ('Man', 'Woman', 'Non-binary', 'Prefer not to say');

ALTER TABLE profiles ADD COLUMN gender gender_identity;
