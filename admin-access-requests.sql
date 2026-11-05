-- Run in Supabase SQL Editor after setup.sql.

create table if not exists public.admin_access_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_path text,
  created_at timestamptz not null default now(),
  email_confirmed_at timestamptz
);

alter table public.admin_profiles enable row level security;
revoke all on public.admin_profiles from anon, authenticated;
grant select on public.admin_profiles to authenticated;

drop policy if exists "admin_profiles_admin_read" on public.admin_profiles;
create policy "admin_profiles_admin_read"
  on public.admin_profiles for select to authenticated
  using (public.is_admin());

create table if not exists public.admin_email_approvals (
  email text primary key,
  approved_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  applied_user_id uuid references auth.users(id) on delete set null
);

alter table public.admin_email_approvals enable row level security;
revoke all on public.admin_email_approvals from anon, authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'admin_access_requests'
     ) then
    alter publication supabase_realtime add table public.admin_access_requests;
  end if;
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'admin_profiles'
     ) then
    alter publication supabase_realtime add table public.admin_profiles;
  end if;
end;
$$;

alter table public.admin_access_requests enable row level security;

grant select on public.admin_access_requests to authenticated;
grant update (status) on public.admin_access_requests to authenticated;
grant insert on public.admins to authenticated;

drop policy if exists "admin_requests_admin_read" on public.admin_access_requests;
create policy "admin_requests_admin_read"
  on public.admin_access_requests for select to authenticated
  using (public.is_admin());

drop policy if exists "admin_requests_own_read" on public.admin_access_requests;
create policy "admin_requests_own_read"
  on public.admin_access_requests for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "admin_requests_admin_update" on public.admin_access_requests;
create policy "admin_requests_admin_update"
  on public.admin_access_requests for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "adm_add" on public.admins;
create policy "adm_add"
  on public.admins for insert to authenticated
  with check (public.is_admin());

create or replace function public.capture_admin_access_request()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.raw_user_meta_data ->> 'request_admin_access' = 'true' then
    insert into public.admin_access_requests (user_id, email)
    values (new.id, new.email)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

revoke all on function public.capture_admin_access_request() from public, anon, authenticated;

create or replace function public.sync_admin_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.admin_profiles (
    user_id, email, display_name, avatar_path, created_at, email_confirmed_at
  )
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'avatar_path'), ''),
    coalesce(new.created_at, now()),
    new.email_confirmed_at
  )
  on conflict (user_id) do update
    set email = excluded.email,
        display_name = excluded.display_name,
        avatar_path = excluded.avatar_path,
        email_confirmed_at = excluded.email_confirmed_at;
  return new;
end;
$$;

revoke all on function public.sync_admin_profile() from public, anon, authenticated;

drop trigger if exists sync_admin_profile on auth.users;
create trigger sync_admin_profile
  after insert or update of email, raw_user_meta_data, email_confirmed_at on auth.users
  for each row execute function public.sync_admin_profile();

insert into public.admin_profiles (
  user_id, email, display_name, avatar_path, created_at, email_confirmed_at
)
select
  account.id,
  account.email,
  nullif(trim(account.raw_user_meta_data ->> 'display_name'), ''),
  nullif(trim(account.raw_user_meta_data ->> 'avatar_path'), ''),
  coalesce(account.created_at, now()),
  account.email_confirmed_at
from auth.users as account
on conflict (user_id) do update
  set email = excluded.email,
      display_name = excluded.display_name,
      avatar_path = excluded.avatar_path,
      email_confirmed_at = excluded.email_confirmed_at;

drop trigger if exists capture_admin_access_request on auth.users;
create trigger capture_admin_access_request
  after insert on auth.users
  for each row execute function public.capture_admin_access_request();

create or replace function public.ensure_admin_access_request(requested_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  requested_email text;
  has_requested_access boolean;
begin
  select email, raw_user_meta_data ->> 'request_admin_access' = 'true'
    into requested_email, has_requested_access
  from auth.users
  where id = requested_user_id;

  if not found or has_requested_access is distinct from true then
    raise exception 'Conta não encontrada ou sem solicitação de acesso';
  end if;

  if exists (select 1 from public.admins where user_id = requested_user_id) then
    return;
  end if;

  insert into public.admin_access_requests (user_id, email)
  values (requested_user_id, requested_email)
  on conflict (user_id) do nothing;
end;
$$;

revoke all on function public.ensure_admin_access_request(uuid) from public;
grant execute on function public.ensure_admin_access_request(uuid) to anon, authenticated;
notify pgrst, 'reload schema';

create or replace function public.approve_admin_access(requested_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  email_confirmed boolean;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem aprovar acessos'
      using errcode = '42501';
  end if;

  select account.email_confirmed_at is not null
    into email_confirmed
  from auth.users as account
  where account.id = requested_user_id
  for update;

  if not found then
    raise exception 'Conta da solicitação não encontrada';
  end if;

  if email_confirmed is not true then
    raise exception 'O e-mail precisa ser confirmado antes de conceder acesso administrativo';
  end if;

  perform 1
  from public.admin_access_requests
  where user_id = requested_user_id and status = 'pending'
  for update;

  if not found then
    raise exception 'Solicitação pendente não encontrada';
  end if;

  insert into public.admins (user_id)
  values (requested_user_id)
  on conflict (user_id) do nothing;

  update public.admin_access_requests
  set status = 'approved'
  where user_id = requested_user_id;
end;
$$;

revoke all on function public.approve_admin_access(uuid) from public, anon, authenticated;
grant execute on function public.approve_admin_access(uuid) to authenticated;

drop function if exists public.approve_admin_access_by_email(text);
create or replace function public.approve_admin_access_by_email(requested_email text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  matched_user_id uuid;
  email_confirmed boolean;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem aprovar acessos'
      using errcode = '42501';
  end if;

  if nullif(trim(requested_email), '') is null then
    raise exception 'Informe o e-mail da conta';
  end if;

  insert into public.admin_email_approvals (email, approved_by, applied_user_id)
  values (lower(trim(requested_email)), auth.uid(), null)
  on conflict (email) do update
    set approved_by = excluded.approved_by,
        created_at = now();

  select account.id, account.email_confirmed_at is not null
    into matched_user_id, email_confirmed
  from auth.users as account
  where lower(trim(account.email)) = lower(trim(requested_email))
  limit 1
  for update of account;

  if matched_user_id is null then
    return 'awaiting_signup';
  end if;

  if not email_confirmed then
    return 'awaiting_email_confirmation';
  end if;

  insert into public.admins (user_id)
  values (matched_user_id)
  on conflict (user_id) do nothing;

  insert into public.admin_access_requests (user_id, email, status)
  select matched_user_id, account.email, 'approved'
  from auth.users as account
  where account.id = matched_user_id
  on conflict (user_id) do update
    set email = excluded.email,
        status = 'approved';

  update public.admin_email_approvals
  set applied_user_id = matched_user_id
  where email = lower(trim(requested_email));

  return 'granted';
end;
$$;

revoke all on function public.approve_admin_access_by_email(text) from public, anon, authenticated;
grant execute on function public.approve_admin_access_by_email(text) to authenticated;

create or replace function public.apply_admin_email_approval()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.email_confirmed_at is null or new.email is null then
    return new;
  end if;

  if exists (
    select 1
    from public.admin_email_approvals as approval
    where approval.email = lower(trim(new.email))
  ) then
    insert into public.admins (user_id)
    values (new.id)
    on conflict (user_id) do nothing;

    insert into public.admin_access_requests (user_id, email, status)
    values (new.id, new.email, 'approved')
    on conflict (user_id) do update
      set email = excluded.email,
          status = 'approved';

    update public.admin_email_approvals
    set applied_user_id = new.id
    where email = lower(trim(new.email));
  end if;

  return new;
end;
$$;

revoke all on function public.apply_admin_email_approval() from public, anon, authenticated;

drop trigger if exists apply_admin_email_approval on auth.users;
create trigger apply_admin_email_approval
  after insert or update of email, email_confirmed_at on auth.users
  for each row execute function public.apply_admin_email_approval();

notify pgrst, 'reload schema';
