-- Add missing columns to services table to support Admin management
-- Run this in the Supabase Dashboard SQL Editor

-- 1. Add available_for_subscription
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS available_for_subscription boolean DEFAULT true;

-- 2. Add features array (used for bullet points in UI)
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}';

-- 3. Add slug for SEO friendly URLs
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS slug text;

-- Add unique constraint to slug
ALTER TABLE public.services 
DROP CONSTRAINT IF EXISTS services_slug_key;

ALTER TABLE public.services 
ADD CONSTRAINT services_slug_key UNIQUE (slug);

-- Enable RLS for these new columns (already enabled for table, but good to double check policies if needed)
-- (Existing policies cover "all" for admin, so no new policies needed for admin)
