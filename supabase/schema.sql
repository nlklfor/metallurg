-- =============================================================================
-- METALLURG — snapshot of the live database schema (public schema + the bits
-- of storage/cron it relies on). Supabase project: metallurgStore.
--
-- Snapshot taken 2026-10-14, after migration 20261014150000_add_country_to_orders.
--
-- What this file is for:
--   * One place to read the whole schema instead of piecing it together from
--     the dashboard. The early history (before 2026-08) was applied from the
--     SQL editor and never committed, so supabase/migrations/ alone can't
--     rebuild the database.
--   * Rebuilding the schema on a fresh Supabase project (a staging copy, or
--     disaster recovery): run this file once in the SQL editor. It creates
--     structure only, no data.
--
-- It is NOT a migration: don't add it to supabase/migrations/. Keep making
-- changes as new migrations, and refresh this file when the schema changes
-- (ask Claude to "refresh supabase/schema.sql from the live DB").
--
-- Supabase-managed schemas (auth, storage, realtime, vault, extensions…) are
-- created by the platform and are not repeated here.
-- =============================================================================


-- ─── Extensions ──────────────────────────────────────────────────────────────
-- pgcrypto, uuid-ossp, pg_stat_statements and supabase_vault are enabled on
-- every Supabase project by default.
create extension if not exists pg_cron with schema pg_catalog;


-- ─── Types ───────────────────────────────────────────────────────────────────
create type public.order_status as enum (
  'pending', 'waiting_for_payment', 'paid', 'processing', 'shipped', 'completed', 'cancelled'
);

create type public.product_category as enum ('apparel', 'footwear', 'accessories');


-- ─── Tables ──────────────────────────────────────────────────────────────────

-- Supabase Auth users allowed into the admin panel (checked by is_admin()).
create table public.admins (
  user_id uuid not null,
  created_at timestamp with time zone default now() not null,
  constraint admins_pkey primary key (user_id),
  constraint admins_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade
);

-- Telegram users who started the bot (written by the bot over a direct DB connection).
create table public.bot_users (
  tg_username text not null,
  chat_id bigint not null,
  created_at timestamp with time zone default now(),
  constraint bot_users_pkey primary key (tg_username)
);

-- Rate-limit log for the public edge functions. Cleaned daily by pg_cron.
create table public.lookup_attempts (
  id uuid default gen_random_uuid() not null,
  identifier text not null,
  source text not null,
  created_at timestamp with time zone default now() not null,
  constraint lookup_attempts_pkey primary key (id)
);

create table public.products (
  id uuid default gen_random_uuid() not null,
  created_at timestamp with time zone default now() not null,
  name text,
  price integer,                       -- UAH
  description text,
  image_url jsonb,                     -- array of URLs
  sizes jsonb,
  is_new boolean,
  stock_status text,                   -- 'in_stock' | 'out_of_stock' | 'pre_order'
  slug text,
  quantity smallint default '1'::smallint,  -- = sum(size_stock) when size_stock is set (trigger)
  materials text,
  weight text,                         -- kg, used for Nova Poshta delivery cost
  box text,
  condition text,
  category public.product_category,
  sku text,
  size_stock jsonb default '{}'::jsonb, -- {"42": 2, "43": 1}
  constraint products_pkey primary key (id)
);

create table public.orders (
  id uuid default gen_random_uuid() not null,
  created_at timestamp with time zone default now() not null,
  order_number text not null,          -- MTL-XXXXXX
  total_price bigint not null,         -- UAH, items + delivery, computed server-side
  status public.order_status default 'waiting_for_payment'::public.order_status not null,
  customer_name text not null,
  contact text not null,
  shipping_zone text not null,         -- 'Ukraine' | 'International'
  items jsonb not null,                -- [{product_id, name, selectedSize, price, cart_quantity}]
  current_status_index integer default 0 not null,
  is_international boolean default false not null,  -- set by trigger from shipping_zone
  tracking_number text,                -- Nova Poshta TTN
  city text,
  np_branch text,
  delivery_cost integer default 0 not null,
  customer_email text,
  country text,                        -- International orders only
  constraint orders_pkey primary key (id),
  constraint orders_order_number_key unique (order_number)
);

create table public.reviews (
  id uuid default gen_random_uuid() not null,
  product_id uuid,
  order_id uuid not null,
  author_name text not null,
  rating smallint not null,
  size_purchased text,
  body text,
  image_urls text[] default '{}'::text[],
  created_at timestamp with time zone default now() not null,
  constraint reviews_pkey primary key (id),
  constraint reviews_order_id_fkey foreign key (order_id) references public.orders(id) on delete cascade,
  constraint reviews_product_id_fkey foreign key (product_id) references public.products(id) on delete cascade,
  constraint reviews_product_id_order_id_key unique (product_id, order_id),
  constraint reviews_rating_check check (((rating >= 1) and (rating <= 5)))
);


-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index idx_lookup_attempts_identifier_time on public.lookup_attempts using btree (identifier, created_at);
create index idx_orders_order_number on public.orders using btree (order_number);
create index idx_reviews_product on public.reviews using btree (product_id);


-- ─── Functions ───────────────────────────────────────────────────────────────

-- RLS helper: is the signed-in user an admin?
create or replace function public.is_admin()
 returns boolean
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select exists (select 1 from public.admins where user_id = auth.uid());
$function$;

-- RLS helper for reviews: only completed orders can be reviewed. Executable by
-- anon on purpose (the reviews INSERT policy runs as anon).
create or replace function public.is_order_completed(p_order_id uuid)
 returns boolean
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select exists (
    select 1 from public.orders
    where id = p_order_id and status = 'completed'::order_status
  );
$function$;

-- Called only by the create-order edge function: decrements stock atomically
-- (per size when size_stock is set) and inserts the order.
create or replace function public.create_order(
  p_order_number text,
  p_customer_name text,
  p_contact text,
  p_shipping_zone text,
  p_city text,
  p_np_branch text,
  p_items jsonb,
  p_total_price bigint,
  p_delivery_cost integer default 0,
  p_customer_email text default null,
  p_country text default null
) returns public.orders
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_item jsonb; v_product_id uuid; v_size text; v_qty integer;
  v_has_size boolean; v_rows integer; v_order public.orders;
begin
  if jsonb_array_length(p_items) = 0 then raise exception 'EMPTY_ORDER'; end if;

  for v_item in select value from jsonb_array_elements(p_items) order by (value->>'product_id') loop
    v_product_id := nullif(v_item->>'product_id', '')::uuid;
    v_size       := nullif(v_item->>'selectedSize', '');
    v_qty        := (v_item->>'cart_quantity')::integer;

    if v_product_id is null then raise exception 'MISSING_PRODUCT_ID'; end if;
    if v_qty is null or v_qty <= 0 then raise exception 'INVALID_QUANTITY:%', v_product_id; end if;

    select (size_stock is not null and size_stock <> '{}'::jsonb) into v_has_size
    from public.products where id = v_product_id for update;

    if not found then raise exception 'PRODUCT_NOT_FOUND:%', v_product_id; end if;

    if v_has_size then
      if v_size is null then raise exception 'MISSING_SIZE:%', v_product_id; end if;
      update public.products
      set size_stock = jsonb_set(size_stock, array[v_size], to_jsonb(((size_stock->>v_size)::int - v_qty)))
      where id = v_product_id and (size_stock->>v_size)::int >= v_qty;
    else
      update public.products set quantity = quantity - v_qty
      where id = v_product_id and quantity >= v_qty;
    end if;

    get diagnostics v_rows = row_count;
    if v_rows = 0 then raise exception 'INSUFFICIENT_STOCK:%:%', v_product_id, coalesce(v_size, ''); end if;
  end loop;

  insert into public.orders (order_number, customer_name, contact, shipping_zone, city, np_branch, country, items, total_price, delivery_cost, customer_email, status)
  values (p_order_number, p_customer_name, p_contact, p_shipping_zone, p_city, p_np_branch,
          case when p_shipping_zone = 'Ukraine' then null else nullif(btrim(p_country), '') end,
          p_items, p_total_price, p_delivery_cost, p_customer_email, 'waiting_for_payment')
  returning * into v_order;

  return v_order;
end;
$function$;

-- Puts an order's items back into stock (used when an order is cancelled).
create or replace function public.restock_order_items(p_items jsonb)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v_item jsonb; v_product_id uuid; v_size text; v_qty integer; v_has_size boolean;
begin
  for v_item in select value from jsonb_array_elements(p_items) order by (value->>'product_id') loop
    v_product_id := nullif(v_item->>'product_id', '')::uuid;
    v_size := nullif(v_item->>'selectedSize', '');
    v_qty := (v_item->>'cart_quantity')::integer;
    if v_product_id is null or v_qty is null or v_qty <= 0 then continue; end if;

    select (size_stock is not null and size_stock <> '{}'::jsonb) into v_has_size
    from public.products where id = v_product_id for update;
    if not found then continue; end if;

    if v_has_size and v_size is not null then
      update public.products set size_stock = jsonb_set(size_stock, array[v_size], to_jsonb(coalesce((size_stock->>v_size)::int, 0) + v_qty))
      where id = v_product_id;
    else
      update public.products set quantity = quantity + v_qty where id = v_product_id;
    end if;
  end loop;
end;
$function$;

-- Trigger: restock when an order changes to 'cancelled'.
create or replace function public.handle_order_cancelled()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    perform public.restock_order_items(new.items);
  end if;
  return new;
end;
$function$;

-- Trigger: is_international follows shipping_zone.
create or replace function public.set_is_international()
 returns trigger
 language plpgsql
 set search_path to 'public'
as $function$
begin
  new.is_international := (new.shipping_zone is distinct from 'Ukraine');
  return new;
end;
$function$;

-- Trigger: for products with size_stock, quantity = sum of the sizes.
create or replace function public.sync_products_quantity()
 returns trigger
 language plpgsql
 set search_path to 'public'
as $function$
begin
  if new.size_stock is not null and new.size_stock <> '{}'::jsonb then
    new.quantity := (
      select coalesce(sum(greatest(coalesce((v)::int, 0), 0)), 0)
      from jsonb_each_text(new.size_stock) as e(k, v)
    );
  end if;
  return new;
end;
$function$;


-- ─── Function grants ─────────────────────────────────────────────────────────
revoke execute on function public.create_order(text, text, text, text, text, text, jsonb, bigint, integer, text, text) from public, anon, authenticated;
revoke execute on function public.restock_order_items(jsonb) from public, anon, authenticated;
revoke execute on function public.handle_order_cancelled() from public, anon, authenticated;
revoke execute on function public.sync_products_quantity() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.create_order(text, text, text, text, text, text, jsonb, bigint, integer, text, text) to service_role;
grant execute on function public.restock_order_items(jsonb) to service_role;
grant execute on function public.handle_order_cancelled() to service_role;
grant execute on function public.sync_products_quantity() to service_role;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.is_order_completed(uuid) to anon, authenticated, service_role;


-- ─── Triggers ────────────────────────────────────────────────────────────────
create trigger trg_set_is_international
  before insert or update of shipping_zone on public.orders
  for each row execute function public.set_is_international();

create trigger trg_restock_on_cancel
  after update on public.orders
  for each row execute function public.handle_order_cancelled();

create trigger trg_sync_products_quantity
  before insert or update of size_stock, quantity on public.products
  for each row execute function public.sync_products_quantity();


-- ─── Views ───────────────────────────────────────────────────────────────────
-- Public reviews feed with the items of the reviewed order. Runs with the
-- owner's rights on purpose (orders aren't readable by anon); exposes only
-- order items, no names/contacts/addresses.
create view public.reviews_with_order_items as
 select r.id,
    r.product_id,
    r.order_id,
    r.author_name,
    r.rating,
    r.size_purchased,
    r.body,
    r.image_urls,
    r.created_at,
    o.items as order_items
   from (public.reviews r
     join public.orders o on ((o.id = r.order_id)));


-- ─── Row Level Security ──────────────────────────────────────────────────────
-- admins and lookup_attempts have RLS on and no policies: only service_role
-- (edge functions) and SECURITY DEFINER functions can touch them.
alter table public.admins enable row level security;
alter table public.bot_users enable row level security;
alter table public.lookup_attempts enable row level security;
alter table public.orders enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;

create policy "Admins can select bot_users" on public.bot_users for select to authenticated using (is_admin());

-- Customers never read orders directly: tracking goes through the
-- track-order edge function, checkout through create-order.
create policy "Admins can select orders" on public.orders for select to authenticated using (is_admin());
create policy "Admins can update orders" on public.orders for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admins can delete orders" on public.orders for delete to authenticated using (is_admin());

create policy "Public can view products" on public.products for select to public using (true);
create policy "Admins can insert products" on public.products for insert to authenticated with check (is_admin());
create policy "Admins can update products" on public.products for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admins can delete products" on public.products for delete to authenticated using (is_admin());

create policy "Reviews are publicly readable" on public.reviews for select to public using (true);
create policy "Public can insert reviews" on public.reviews for insert to public with check (is_order_completed(order_id));


-- ─── Storage ─────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('products',      'products',      true, 52428800, array['image/jpeg', 'image/png', 'image/webp']),
  ('product-image', 'product-image', true, null,     null),
  ('review-images', 'review-images', true, 5242880,  array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Public read products bucket" on storage.objects for select to public using ((bucket_id = 'products'::text));
create policy "public read product-image" on storage.objects for select to public using ((bucket_id = 'product-image'::text));
create policy "Public read review images" on storage.objects for select to public using ((bucket_id = 'review-images'::text));
create policy "Anyone can upload review images" on storage.objects for insert to public with check ((bucket_id = 'review-images'::text));


-- ─── Scheduled jobs (pg_cron) ────────────────────────────────────────────────
select cron.schedule(
  'cleanup-lookup-attempts',
  '17 3 * * *',
  $$delete from public.lookup_attempts where created_at < now() - interval '1 day'$$
);
