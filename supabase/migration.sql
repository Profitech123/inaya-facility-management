-- =============================================
-- INAYA Facilities Management — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================

-- 1. Profiles table (extends auth.users with app-specific fields)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  first_name text,
  last_name text,
  email text,
  phone_number text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_date timestamptz default now()
);

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, first_name, last_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Service Categories
create table if not exists public.service_categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  description text,
  display_order integer default 0,
  created_date timestamptz default now()
);

-- 3. Services
create table if not exists public.services (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  description text,
  price numeric default 0,
  category_id text references public.service_categories(id),
  image text,
  duration_minutes integer default 60,
  is_active boolean default true,
  created_date timestamptz default now()
);

-- 4. Service Add-ons
create table if not exists public.service_addons (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  description text,
  price numeric default 0,
  service_id text references public.services(id),
  is_active boolean default true,
  created_date timestamptz default now()
);

-- 5. Properties
create table if not exists public.properties (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users on delete cascade,
  property_type text default 'villa',
  area text,
  address text,
  bedrooms integer,
  square_meters numeric,
  access_notes text,
  created_date timestamptz default now()
);

-- 6. Providers (technicians)
create table if not exists public.providers (
  id text primary key default gen_random_uuid()::text,
  full_name text,
  name text,
  email text,
  phone text,
  rating numeric default 0,
  is_active boolean default true,
  created_date timestamptz default now()
);

-- 7. Bookings
create table if not exists public.bookings (
  id text primary key default gen_random_uuid()::text,
  customer_id uuid references auth.users on delete set null,
  service_id text references public.services(id),
  property_id text references public.properties(id),
  status text default 'pending',
  scheduled_date date,
  scheduled_time text,
  customer_notes text,
  total_amount numeric default 0,
  addon_ids text[],
  addons_amount numeric default 0,
  assigned_provider_id text references public.providers(id),
  assigned_provider text,
  payment_status text default 'unpaid',
  created_date timestamptz default now()
);

-- 8. Subscription Packages
create table if not exists public.subscription_packages (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  price numeric default 0,
  monthly_amount numeric default 0,
  features text[],
  description text,
  created_date timestamptz default now()
);

-- 9. Subscriptions
create table if not exists public.subscriptions (
  id text primary key default gen_random_uuid()::text,
  customer_id uuid references auth.users on delete set null,
  package_id text references public.subscription_packages(id),
  property_id text references public.properties(id),
  status text default 'active',
  start_date date,
  end_date date,
  monthly_amount numeric default 0,
  renewal_reminder_sent boolean default false,
  created_date timestamptz default now()
);

-- 10. Provider Reviews
create table if not exists public.provider_reviews (
  id text primary key default gen_random_uuid()::text,
  provider_id text references public.providers(id),
  user_id uuid references auth.users on delete set null,
  booking_id text references public.bookings(id),
  rating integer default 5 check (rating between 1 and 5),
  comment text,
  created_date timestamptz default now()
);

-- 11. Support Tickets
create table if not exists public.support_tickets (
  id text primary key default gen_random_uuid()::text,
  customer_id uuid references auth.users on delete set null,
  subject text,
  message text,
  status text default 'open',
  priority text default 'medium',
  created_date timestamptz default now()
);

-- 12. Chat Conversations (for admin live chat)
create table if not exists public.chat_conversations (
  id text primary key default gen_random_uuid()::text,
  customer_id uuid references auth.users on delete set null,
  status text default 'open',
  last_message_at timestamptz default now(),
  created_date timestamptz default now()
);

-- 13. Audit Logs
create table if not exists public.audit_logs (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users on delete set null,
  action text,
  entity_type text,
  entity_id text,
  details jsonb,
  created_date timestamptz default now()
);


-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.service_categories enable row level security;
alter table public.service_addons enable row level security;
alter table public.properties enable row level security;
alter table public.providers enable row level security;
alter table public.bookings enable row level security;
alter table public.subscription_packages enable row level security;
alter table public.subscriptions enable row level security;
alter table public.provider_reviews enable row level security;
alter table public.support_tickets enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.audit_logs enable row level security;

-- Helper function: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- PROFILES: users can read/update their own, admins can read all
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());

-- SERVICES & CATEGORIES: everyone can read, only admins can write
create policy "Anyone can view services" on public.services for select using (true);
create policy "Admins can manage services" on public.services for all using (public.is_admin());
create policy "Anyone can view categories" on public.service_categories for select using (true);
create policy "Admins can manage categories" on public.service_categories for all using (public.is_admin());
create policy "Anyone can view addons" on public.service_addons for select using (true);
create policy "Admins can manage addons" on public.service_addons for all using (public.is_admin());

-- PROPERTIES: owners can CRUD their own, admins can read all
create policy "Owners can view own properties" on public.properties for select using (auth.uid() = owner_id);
create policy "Owners can create properties" on public.properties for insert with check (auth.uid() = owner_id);
create policy "Owners can update own properties" on public.properties for update using (auth.uid() = owner_id);
create policy "Owners can delete own properties" on public.properties for delete using (auth.uid() = owner_id);
create policy "Admins can view all properties" on public.properties for select using (public.is_admin());

-- BOOKINGS: customers see their own, admins see all
create policy "Customers can view own bookings" on public.bookings for select using (auth.uid() = customer_id);
create policy "Customers can create bookings" on public.bookings for insert with check (auth.uid() = customer_id);
create policy "Admins can view all bookings" on public.bookings for select using (public.is_admin());
create policy "Admins can update bookings" on public.bookings for update using (public.is_admin());

-- PROVIDERS: everyone can read, admins can write
create policy "Anyone can view providers" on public.providers for select using (true);
create policy "Admins can manage providers" on public.providers for all using (public.is_admin());

-- SUBSCRIPTION PACKAGES: everyone can read, admins can write
create policy "Anyone can view packages" on public.subscription_packages for select using (true);
create policy "Admins can manage packages" on public.subscription_packages for all using (public.is_admin());

-- SUBSCRIPTIONS: customers see their own, admins see all
create policy "Customers can view own subscriptions" on public.subscriptions for select using (auth.uid() = customer_id);
create policy "Customers can create subscriptions" on public.subscriptions for insert with check (auth.uid() = customer_id);
create policy "Admins can view all subscriptions" on public.subscriptions for select using (public.is_admin());
create policy "Admins can manage subscriptions" on public.subscriptions for all using (public.is_admin());

-- REVIEWS: everyone can read, authenticated users can create
create policy "Anyone can view reviews" on public.provider_reviews for select using (true);
create policy "Users can create reviews" on public.provider_reviews for insert with check (auth.uid() = user_id);

-- SUPPORT TICKETS: customers see their own, admins see all
create policy "Customers can view own tickets" on public.support_tickets for select using (auth.uid() = customer_id);
create policy "Customers can create tickets" on public.support_tickets for insert with check (auth.uid() = customer_id);
create policy "Admins can view all tickets" on public.support_tickets for select using (public.is_admin());
create policy "Admins can manage tickets" on public.support_tickets for all using (public.is_admin());

-- CHAT: customers see their own, admins see all
create policy "Customers can view own chats" on public.chat_conversations for select using (auth.uid() = customer_id);
create policy "Admins can view all chats" on public.chat_conversations for select using (public.is_admin());

-- AUDIT LOGS: admins only
create policy "Admins can view audit logs" on public.audit_logs for select using (public.is_admin());
create policy "Admins can create audit logs" on public.audit_logs for insert with check (public.is_admin());


-- =============================================
-- SEED DATA (services, categories, packages)
-- =============================================

-- Categories
insert into public.service_categories (id, name, description, display_order) values
  ('cat_1', 'Cooling', 'AC and cooling system services', 1),
  ('cat_2', 'Maintenance', 'General maintenance and repairs', 2),
  ('cat_3', 'Cleaning', 'Cleaning services', 3)
on conflict (id) do nothing;

-- Services
insert into public.services (id, name, description, price, category_id, image, duration_minutes, is_active) values
  ('svc_1', 'AC Cleaning', 'Professional AC cleaning & maintenance for all types of units', 150, 'cat_1', 'https://placehold.co/600x400/png?text=AC+Cleaning', 60, true),
  ('svc_2', 'Plumbing Repair', 'Expert plumbing repair for leaks, blockages, and pipe issues', 120, 'cat_2', 'https://placehold.co/600x400/png?text=Plumbing', 90, true),
  ('svc_3', 'Electrical Maintenance', 'Professional electrical wiring, fixtures, and panel repair', 200, 'cat_2', 'https://placehold.co/600x400/png?text=Electrical', 120, true)
on conflict (id) do nothing;

-- Service Addons
insert into public.service_addons (id, name, description, price, service_id, is_active) values
  ('addon_1', 'Deep Clean Add-on', 'Extended deep cleaning for AC units', 50, 'svc_1', true),
  ('addon_2', 'Emergency Surcharge', 'Same-day service priority', 75, null, true)
on conflict (id) do nothing;

-- Subscription Packages
insert into public.subscription_packages (id, name, price, monthly_amount, features, description) values
  ('pkg_1', 'Gold Annual', 1500, 125, ARRAY['Unlimited Callouts', '4 AC Services', 'Plumbing & Electrical Coverage'], 'Complete coverage for your property'),
  ('pkg_2', 'Silver Annual', 1000, 83, ARRAY['Limited Callouts', '2 AC Services'], 'Essential maintenance coverage')
on conflict (id) do nothing;

-- Providers
insert into public.providers (id, full_name, name, rating, is_active) values
  ('prov_1', 'Ahmad Hassan', 'Best Fixers LLC', 4.8, true)
on conflict (id) do nothing;
