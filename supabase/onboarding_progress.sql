-- 14. Onboarding Progress (for tracking dashboard steps)
create table if not exists public.onboarding_progress (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users on delete cascade,
  role text check (role in ('admin', 'customer')),
  completed_steps text[] default '{}',
  dismissed boolean default false,
  created_date timestamptz default now()
);

-- Enable RLS
alter table public.onboarding_progress enable row level security;

-- Policies
create policy "Users can view own progress" on public.onboarding_progress for select using (auth.uid() = user_id);
create policy "Users can update own progress" on public.onboarding_progress for update using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.onboarding_progress for insert with check (auth.uid() = user_id);
