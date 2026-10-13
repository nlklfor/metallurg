-- Backend hardening from the 2026-10-12 audit.
--
-- 1. set_is_international() had the flag inverted: it stored TRUE for
--    Ukraine orders. The site picks the tracking route from shipping_zone,
--    but the Telegram bot used is_international, so a Ukrainian customer saw
--    the 6-step international route in the bot and the 4-step local route
--    on the site. Fix the trigger and recompute every existing order.
--    Old orders still carry the pre-rename zone 'Switzerland'; checkout and
--    create-order only know 'Ukraine' | 'International', so normalise them.
--    (trg_restock_on_cancel also fires on UPDATE but only acts when status
--    changes to 'cancelled', so this backfill doesn't touch stock.)
create or replace function public.set_is_international() returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  new.is_international := (new.shipping_zone is distinct from 'Ukraine');
  return new;
end;
$function$;

update public.orders
set shipping_zone = 'International'
where shipping_zone = 'Switzerland';

update public.orders
set is_international = (shipping_zone is distinct from 'Ukraine')
where is_international is distinct from (shipping_zone is distinct from 'Ukraine');

-- 2. Leftover 9-argument overload of create_order() from before customer_email
--    was added. create-order only calls the 10-argument version.
drop function if exists public.create_order(text, text, text, text, text, text, jsonb, bigint, integer);

-- 3. lookup_attempts (rate-limit log for create-order, track-order,
--    contact-form, notify-telegram, nova-poshta-track) was never cleaned up.
--    Every limiter only looks back 10 minutes, so anything older than a day
--    is dead weight. Daily job at 03:17 UTC.
create extension if not exists pg_cron with schema pg_catalog;

select cron.unschedule('cleanup-lookup-attempts')
where exists (select 1 from cron.job where jobname = 'cleanup-lookup-attempts');

select cron.schedule(
  'cleanup-lookup-attempts',
  '17 3 * * *',
  $$delete from public.lookup_attempts where created_at < now() - interval '1 day'$$
);

-- Deliberately NOT changed (Supabase Advisor flags them, both are intended):
-- * reviews_with_order_items is SECURITY DEFINER so the public reviews feed
--   can show which items a review is about without opening orders to anon.
--   It exposes only order items (name, size, price, qty) for orders that
--   have a review: no names, contacts or addresses.
-- * is_order_completed() is executable by anon because the reviews INSERT
--   policy calls it while evaluating as anon.
