-- ============================================================
-- "The Button" — Supabase Setup
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1) Create the players table
create table if not exists public.players (
    id bigint generated always as identity primary key,
    username text not null unique,
    playtime bigint not null default 0,
    score bigint not null default 0,
    created_at timestamptz not null default now()
);

-- 2) Enable Row Level Security (RLS)
alter table public.players enable row level security;

-- 3) Anonymous read of everyone (needed for the global scoreboard)
create policy "allow public read"
on public.players for select
using (true);

-- 4) Anonymous users can insert a new player (create their account)
create policy "allow public insert"
on public.players for insert
with check (true);

-- 5) Anonymous users can update scores/playtime
--    (everyone can update anyone's row — simple public game board)
create policy "allow public update"
on public.players for update
using (true);

-- 6) Nobody can delete (optional, just for safety)
create policy "deny public delete"
on public.players for delete
using (false);
