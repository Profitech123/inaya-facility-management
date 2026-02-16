-- =============================================
-- Phase 2: Service Provider Module Migration
-- Run this in Supabase Dashboard SQL Editor
-- =============================================

-- 1. Update Profiles Role Constraint
-- First, drop the existing check constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint including 'technician'
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('customer', 'admin', 'technician'));

-- 2. Link Providers to Auth Users
ALTER TABLE public.providers
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add unique constraint so one user can only be one provider
ALTER TABLE public.providers
ADD CONSTRAINT providers_user_id_key UNIQUE (user_id);

-- 3. RLS Policies for Technicians

-- Technicians can view their own provider profile
CREATE POLICY "Technicians can view own provider profile" 
ON public.providers 
FOR SELECT 
USING (auth.uid() = user_id);

-- Technicians can view bookings assigned to them
CREATE POLICY "Technicians can view assigned bookings" 
ON public.bookings 
FOR SELECT 
USING (
  exists (
    select 1 from public.providers 
    where id = bookings.assigned_provider_id 
    and user_id = auth.uid()
  )
);

-- Technicians can update status of assigned bookings
CREATE POLICY "Technicians can update assigned bookings" 
ON public.bookings 
FOR UPDATE 
USING (
  exists (
    select 1 from public.providers 
    where id = bookings.assigned_provider_id 
    and user_id = auth.uid()
  )
);
