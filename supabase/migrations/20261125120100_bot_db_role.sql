-- A database role for the Telegram bot with only the rights it needs.
--
-- The bot used to connect as `postgres`, which ignores RLS and can change
-- anything. metallurg_bot can only:
--   read products and orders,
--   set customer_chat_id / notified_state on orders (order-update links),
--   read and write bot_users and bot_state.
--
-- The role is created WITHOUT a password. To switch the bot over:
--   1. SQL editor: alter role metallurg_bot with password '<a long random password>';
--   2. Railway → DATABASE_URL: the same pooler URL with the user
--      metallurg_bot.<project-ref> and that password.
-- Never commit the password.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'metallurg_bot') then
    create role metallurg_bot login noinherit;
  end if;
end
$$;

grant usage on schema public to metallurg_bot;

grant select on public.products to metallurg_bot;
grant select on public.orders to metallurg_bot;
grant update (customer_chat_id, notified_state) on public.orders to metallurg_bot;
grant select, insert, update on public.bot_users to metallurg_bot;
grant select, insert, update on public.bot_state to metallurg_bot;

-- RLS: products are already readable by everyone ("Public can view products").
drop policy if exists "Bot can select orders" on public.orders;
create policy "Bot can select orders" on public.orders
  for select to metallurg_bot using (true);

drop policy if exists "Bot can link chats to orders" on public.orders;
create policy "Bot can link chats to orders" on public.orders
  for update to metallurg_bot using (true) with check (true);

drop policy if exists "Bot manages bot_users" on public.bot_users;
create policy "Bot manages bot_users" on public.bot_users
  for all to metallurg_bot using (true) with check (true);

drop policy if exists "Bot manages bot_state" on public.bot_state;
create policy "Bot manages bot_state" on public.bot_state
  for all to metallurg_bot using (true) with check (true);
