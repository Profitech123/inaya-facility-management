
-- Fix Admin User Profile
-- This ensures the admin user has a corresponding profile row with the 'admin' role,
-- which is required for RLS policies to work.

INSERT INTO public.profiles (id, email, role, full_name)
SELECT id, email, 'admin', 'System Admin'
FROM auth.users
WHERE email = 'admin@inaya.ae'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
