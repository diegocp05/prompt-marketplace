-- Create user profiles table extending auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text,
  avatar_url text,
  website_url text,
  is_seller boolean default false,
  total_sales integer default 0,
  rating numeric(3,2) default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can view all profiles (for marketplace browsing)
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

-- Users can only insert their own profile
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can only update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Users can only delete their own profile
create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);
