-- ClaudeXP community leaderboard schema (v2 — owner-token ownership).
-- Paste into your Supabase project's SQL Editor and run.
--
-- Design:
--   - Anyone (anon) can read the leaderboard.
--   - Anyone can claim an unused username and write their owner_token.
--   - Updates/deletes require the caller to send the stored owner_token as
--     the `x-claudexp-owner-token` request header. Only the owner's client has it.
--   - The owner_token column is not readable by anon (column-level grant),
--     so friends/strangers can't scrape tokens to hijack profiles.

drop table if exists profiles cascade;

create table profiles (
  username       text primary key,
  owner_token    text not null,
  total_xp       integer     not null default 0,
  level          integer     not null default 1,
  session_count  integer     not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index profiles_total_xp_idx on profiles (total_xp desc);

alter table profiles enable row level security;

-- Column-level grants: anon CANNOT read owner_token, CANNOT change username
-- or owner_token after insert.
revoke all on profiles from anon;
grant select (username, total_xp, level, session_count, created_at, updated_at)
  on profiles to anon;
grant insert (username, owner_token, total_xp, level, session_count)
  on profiles to anon;
grant update (total_xp, level, session_count, updated_at)
  on profiles to anon;
grant delete on profiles to anon;

-- Same for authenticated (in case Supabase adds auth later).
grant select (username, total_xp, level, session_count, created_at, updated_at)
  on profiles to authenticated;
grant insert (username, owner_token, total_xp, level, session_count)
  on profiles to authenticated;
grant update (total_xp, level, session_count, updated_at)
  on profiles to authenticated;
grant delete on profiles to authenticated;

-- Everyone can read.
create policy profiles_read_all on profiles
  for select
  using (true);

-- Everyone can insert a new row (PK conflict prevents stealing a taken name).
create policy profiles_insert_all on profiles
  for insert
  with check (true);

-- Updates require x-claudexp-owner-token header to match stored owner_token.
create policy profiles_update_own on profiles
  for update
  using (
    owner_token = (current_setting('request.headers', true)::json ->> 'x-claudexp-owner-token')
  );

-- Deletes likewise require the owner token.
create policy profiles_delete_own on profiles
  for delete
  using (
    owner_token = (current_setting('request.headers', true)::json ->> 'x-claudexp-owner-token')
  );
