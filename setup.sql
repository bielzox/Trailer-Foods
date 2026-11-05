-- Supabase: SQL Editor > New query > Run
-- Pode ser executado novamente: tabelas existentes e seus dados são preservados.

create table if not exists categories (id bigint generated always as identity primary key, name text not null unique);

create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null, description text,
  price numeric(10,2) not null check (price >= 0),
  category_id bigint references categories(id) on delete set null,
  image_url text, active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (            -- comandas / pedidos
  id bigint generated always as identity primary key,
  customer text not null check (char_length(customer) between 1 and 60),
  table_no text check (char_length(table_no) <= 120),
  notes text,
  items jsonb not null,          -- pendente: [{id,qty}] | fechado: [{id,name,price,qty}]
  status text not null default 'pendente' check (status in ('pendente','fechado')),
  total numeric(10,2) not null default 0,
  payment_method text,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists expenses (          -- saídas / gastos
  id bigint generated always as identity primary key,
  description text not null, amount numeric(10,2) not null check (amount >= 0),
  spent_at date not null default current_date
);

create table if not exists settings (key text primary key, value text);   -- cores, textos, títulos
create table if not exists admins (user_id uuid primary key references auth.users(id) on delete cascade);

create or replace function is_admin() returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

alter table categories enable row level security;
alter table products   enable row level security;
alter table orders     enable row level security;
alter table expenses   enable row level security;
alter table settings   enable row level security;
alter table admins     enable row level security;

-- Público (cardápio): lê categorias, produtos ativos e configurações
drop policy if exists "cat_read" on categories;
drop policy if exists "prod_read" on products;
drop policy if exists "set_read" on settings;
create policy "cat_read"  on categories for select using (true);
create policy "prod_read" on products   for select using (active or is_admin());
create policy "set_read"  on settings   for select using (true);

-- Público: só pode ENVIAR pedido pendente (não lê nem altera pedidos de ninguém)
drop policy if exists "ord_send" on orders;
create policy "ord_send" on orders for insert
  with check (status = 'pendente' and total = 0 and payment_method is null and closed_at is null
              and jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 60);

-- Admin: tudo
drop policy if exists "cat_w" on categories;
drop policy if exists "prod_w" on products;
drop policy if exists "ord_w" on orders;
drop policy if exists "exp_w" on expenses;
drop policy if exists "set_w" on settings;
drop policy if exists "adm_me" on admins;
create policy "cat_w"  on categories for all using (is_admin()) with check (is_admin());
create policy "prod_w" on products   for all using (is_admin()) with check (is_admin());
create policy "ord_w"  on orders     for all using (is_admin()) with check (is_admin());
create policy "exp_w"  on expenses   for all using (is_admin()) with check (is_admin());
create policy "set_w"  on settings   for all using (is_admin()) with check (is_admin());
create policy "adm_me" on admins     for select using (user_id = auth.uid());
-- "admins" não tem política de escrita: ninguém vira admin pelo site.

-- Atualização instantânea via Supabase Realtime (o bloco pode ser executado novamente).
do $$
declare
  table_name text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach table_name in array array['orders','products','categories','settings','expenses','admin_access_requests']
    loop
      if to_regclass(format('public.%I', table_name)) is not null
         and not exists (
           select 1 from pg_publication_tables
           where pubname = 'supabase_realtime'
             and schemaname = 'public'
             and tablename = table_name
         ) then
        execute format('alter publication supabase_realtime add table public.%I', table_name);
      end if;
    end loop;
  else
    raise notice 'A publicação supabase_realtime não existe neste projeto; habilite Realtime no Supabase.';
  end if;
end;
$$;

-- Fotos dos produtos
insert into storage.buckets (id, name, public) values ('produtos','produtos',true) on conflict (id) do nothing;
drop policy if exists "img_read" on storage.objects;
drop policy if exists "img_ins" on storage.objects;
drop policy if exists "img_upd" on storage.objects;
drop policy if exists "img_del" on storage.objects;
create policy "img_read" on storage.objects for select using (bucket_id = 'produtos');
create policy "img_ins"  on storage.objects for insert with check (bucket_id = 'produtos' and is_admin());
create policy "img_upd"  on storage.objects for update using (bucket_id = 'produtos' and is_admin());
create policy "img_del"  on storage.objects for delete using (bucket_id = 'produtos' and is_admin());

-- Fotos privadas dos perfis de administradores
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('admin-avatars', 'admin-avatars', false, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = 3145728,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];
drop policy if exists "admin_avatar_read_own" on storage.objects;
drop policy if exists "admin_avatar_read_admins" on storage.objects;
drop policy if exists "admin_avatar_insert_own" on storage.objects;
drop policy if exists "admin_avatar_update_own" on storage.objects;
drop policy if exists "admin_avatar_delete_own" on storage.objects;
create policy "admin_avatar_read_admins" on storage.objects
  for select to authenticated
  using (bucket_id = 'admin-avatars' and public.is_admin());
create policy "admin_avatar_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'admin-avatars' and (storage.foldername(name))[1] = auth.uid()::text and public.is_admin());
create policy "admin_avatar_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'admin-avatars' and (storage.foldername(name))[1] = auth.uid()::text and public.is_admin())
  with check (bucket_id = 'admin-avatars' and (storage.foldername(name))[1] = auth.uid()::text and public.is_admin());
create policy "admin_avatar_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'admin-avatars' and (storage.foldername(name))[1] = auth.uid()::text and public.is_admin());

-- Para cadastrar o primeiro administrador, crie o usuário em Authentication > Users
-- e execute admin-bootstrap.sql no SQL Editor do Supabase.
-- Depois, execute admin-access-requests.sql para habilitar solicitações e aprovações pelo painel.
