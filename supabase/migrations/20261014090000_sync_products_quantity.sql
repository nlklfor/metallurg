-- products.quantity drifted from size_stock: create_order() and
-- restock_order_items() only touch size_stock for sized products, so the
-- overall quantity (shown in the admin panel) was never updated on orders or
-- cancellations. Example: Nike Mind 001 Slide had quantity 11 with sizes
-- summing to 10.
--
-- For products that have size_stock, quantity is now derived from it on every
-- insert/update (orders, cancellations, admin edits alike). Products without
-- size_stock keep managing quantity directly, exactly as before.
create or replace function public.sync_products_quantity() returns trigger
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

drop trigger if exists trg_sync_products_quantity on public.products;
create trigger trg_sync_products_quantity
  before insert or update of size_stock, quantity on public.products
  for each row execute function public.sync_products_quantity();

-- Trigger functions are never called directly.
revoke execute on function public.sync_products_quantity() from public, anon, authenticated;

-- Recompute existing rows (fires the trigger).
update public.products
set size_stock = size_stock
where size_stock is not null and size_stock <> '{}'::jsonb;
