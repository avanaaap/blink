-- Add profile_picture_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
