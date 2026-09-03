-- ============================================================
-- THE BUTTON — SECURE SUPABASE SETUP
-- ============================================================

-- Tabelle
create table if not exists public.players (
    id bigint generated always as identity primary key,
    username text not null unique,
    playtime bigint not null default 0,
    score bigint not null default 0,
    created_at timestamptz not null default now()
);

-- RLS aktivieren
alter table public.players enable row level security;


-- ============================================================
-- POLICIES
-- ============================================================

-- Jeder darf die Rangliste lesen
create policy "public can read players"
on public.players
for select
to anon, authenticated
using (true);


-- Spieler dürfen einen Account erstellen
create policy "public can create player"
on public.players
for insert
to anon, authenticated
with check (
    score = 0
    and playtime = 0
);


-- KEIN direktes UPDATE
-- KEIN DELETE
--
-- Es gibt absichtlich keine UPDATE- oder DELETE-Policy.


-- ============================================================
-- SECURE FUNCTION
-- ============================================================

create or replace function public.add_score(
    player_id bigint,
    amount bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin

    -- Keine negativen Werte erlauben
    if amount <= 0 then
        raise exception 'Invalid amount';
    end if;

    -- Maximale Änderung pro Aufruf begrenzen
    if amount > 1 then
        raise exception 'Amount too large';
    end if;

    -- Score erhöhen
    update public.players
    set score = score + amount
    where id = player_id;

end;
$$;


-- ============================================================
-- FUNCTION PERMISSION
-- ============================================================

grant execute on function public.add_score(bigint, bigint)
to anon, authenticated;