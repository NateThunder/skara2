-- Authenticated-user schema for Sakra site content
-- Run this in Supabase SQL Editor.

-- Clean up old single-admin objects if they exist.
drop function if exists public.is_admin();
drop table if exists public.app_config;

-- 1) Site content tables.
create table if not exists public.site_content (
  id smallint primary key default 1 check (id = 1),
  about_eyebrow text not null default 'About',
  about_heading text not null default '',
  about_text text not null default '',
  nav_layout_mode text not null default 'hamburger' check (nav_layout_mode in ('full', 'hamburger')),
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.site_content (id)
values (1)
on conflict (id) do nothing;

alter table public.site_content
  add column if not exists nav_layout_mode text;

update public.site_content
set nav_layout_mode = 'hamburger'
where nav_layout_mode is distinct from 'hamburger';

alter table public.site_content
  alter column nav_layout_mode set default 'hamburger';

alter table public.site_content
  alter column nav_layout_mode set not null;

alter table public.site_content
  drop constraint if exists site_content_nav_layout_mode_check;

alter table public.site_content
  add constraint site_content_nav_layout_mode_check
  check (nav_layout_mode in ('full', 'hamburger'));

create table if not exists public.site_mentions (
  id text primary key,
  quote text not null,
  source text not null,
  url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists site_mentions_sort_idx
  on public.site_mentions (sort_order, created_at);

-- 2) Keep updated_at and updated_by fresh on writes.
create or replace function public.set_updated_fields()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  if auth.uid() is not null then
    new.updated_by = auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_site_content_updated on public.site_content;
create trigger trg_site_content_updated
before insert or update on public.site_content
for each row execute function public.set_updated_fields();

drop trigger if exists trg_site_mentions_updated on public.site_mentions;
create trigger trg_site_mentions_updated
before insert or update on public.site_mentions
for each row execute function public.set_updated_fields();

-- 3) RLS policies.
alter table public.site_content enable row level security;
alter table public.site_mentions enable row level security;

-- Public read for homepage rendering.
drop policy if exists site_content_read_public on public.site_content;
create policy site_content_read_public
on public.site_content
for select
to anon, authenticated
using (true);

drop policy if exists site_mentions_read_public on public.site_mentions;
create policy site_mentions_read_public
on public.site_mentions
for select
to anon, authenticated
using (true);

-- Any authenticated user can write.
drop policy if exists site_content_insert_admin on public.site_content;
drop policy if exists site_content_insert_auth on public.site_content;
create policy site_content_insert_auth
on public.site_content
for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists site_content_update_admin on public.site_content;
drop policy if exists site_content_update_auth on public.site_content;
create policy site_content_update_auth
on public.site_content
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists site_mentions_insert_admin on public.site_mentions;
drop policy if exists site_mentions_insert_auth on public.site_mentions;
create policy site_mentions_insert_auth
on public.site_mentions
for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists site_mentions_update_admin on public.site_mentions;
drop policy if exists site_mentions_update_auth on public.site_mentions;
create policy site_mentions_update_auth
on public.site_mentions
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists site_mentions_delete_admin on public.site_mentions;
drop policy if exists site_mentions_delete_auth on public.site_mentions;
create policy site_mentions_delete_auth
on public.site_mentions
for delete
to authenticated
using (auth.uid() is not null);
