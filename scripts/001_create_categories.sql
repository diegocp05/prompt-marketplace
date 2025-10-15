-- Create categories table for organizing prompts
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.categories enable row level security;

-- Categories are public - anyone can read them
create policy "categories_select_all"
  on public.categories for select
  using (true);

-- Only authenticated users can suggest categories (for future admin approval)
create policy "categories_insert_authenticated"
  on public.categories for insert
  with check (auth.uid() is not null);
