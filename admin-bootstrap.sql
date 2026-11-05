-- Run in Supabase SQL Editor after creating the user in Authentication > Users.
-- This grants the first administrator without exposing credentials in the app.

do $$
declare
  first_admin_id uuid;
begin
  select id
  into first_admin_id
  from auth.users
  where lower(email) = lower('SEU_EMAIL_ADMIN');

  if first_admin_id is null then
    raise exception 'Conta % não encontrada em Authentication > Users. Crie a conta antes de executar este script.', 'SEU_EMAIL_ADMIN';
  end if;

  insert into public.admins (user_id)
  values (first_admin_id)
  on conflict (user_id) do nothing;
end;
$$;
