-- Run once in Supabase SQL Editor before deploying authentication.
begin;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 200),
  role text not null default '' check (char_length(role) <= 200),
  city text not null default '' check (char_length(city) <= 200),
  genres text not null default '' check (char_length(genres) <= 200),
  looking text not null default '' check (char_length(looking) <= 200),
  prompt text not null default '' check (char_length(prompt) <= 2000)
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;
drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Create own profile" on public.profiles;
create policy "Create own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
commit;
