-- Add missing columns to service_categories table
ALTER TABLE public.service_categories 
ADD COLUMN IF NOT EXISTS slug text;

ALTER TABLE public.service_categories 
ADD COLUMN IF NOT EXISTS icon text;

-- Add unique constraint to slug if not exists
ALTER TABLE public.service_categories 
DROP CONSTRAINT IF EXISTS service_categories_slug_key;

ALTER TABLE public.service_categories 
ADD CONSTRAINT service_categories_slug_key UNIQUE (slug);


-- Seed Service Categories
INSERT INTO public.service_categories (name, slug, description, icon)
VALUES 
  ('Integrated Facility Management', 'integrated-fm', 'Comprehensive facility management solutions', 'LayoutDashboard'),
  ('Hard Services', 'hard-services', 'Mechanical, Electrical, and Plumbing maintenance', 'Wrench'),
  ('Soft Services', 'soft-services', 'Cleaning, Security, and Concierge services', 'Sparkles'),
  ('Specialized Services', 'specialized', 'Pool, Facade, and specialized maintenance', 'Zap'),
  ('Home Automation', 'home-automation', 'Smart home installation and maintenance', 'Cpu')
ON CONFLICT (slug) DO UPDATE 
SET 
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

-- Update Services with better images
UPDATE public.services SET image = 'https://images.unsplash.com/photo-1581094794329-cd56b5095bb1?auto=format&fit=crop&q=80&w=2670' WHERE name ILIKE '%cleaning%' OR name ILIKE '%maid%';
UPDATE public.services SET image = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=2669' WHERE name ILIKE '%ac%' OR name ILIKE '%air condition%';
UPDATE public.services SET image = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=2689' WHERE name ILIKE '%plumb%' OR name ILIKE '%water%';
UPDATE public.services SET image = 'https://images.unsplash.com/photo-1621905252507-b35a830ce5e0?auto=format&fit=crop&q=80&w=2667' WHERE name ILIKE '%electric%';
UPDATE public.services SET image = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=2573' WHERE name ILIKE '%handyman%';
