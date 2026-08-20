-- Adds an optional customer_email column so create-order can send an order
-- confirmation email via Resend when the customer provides one at checkout
-- (email is optional — contact is still the required @username/phone field).
alter table public.orders add column if not exists customer_email text;

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
  p_customer_email text default null
) returns orders
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

  insert into public.orders (order_number, customer_name, contact, shipping_zone, city, np_branch, items, total_price, delivery_cost, customer_email, status)
  values (p_order_number, p_customer_name, p_contact, p_shipping_zone, p_city, p_np_branch, p_items, p_total_price, p_delivery_cost, p_customer_email, 'waiting_for_payment')
  returning * into v_order;

  return v_order;
end;
$function$;

-- CREATE OR REPLACE FUNCTION resets ACLs to the default (EXECUTE to PUBLIC)
-- whenever the parameter list changes, even by adding a defaulted trailing
-- param — confirmed live via get_advisors after the change above, which is
-- why this is a separate explicit step rather than assumed to carry over.
-- Without this, create_order() would be callable directly by anon/authenticated,
-- reopening the client-trusted-price hole this function exists to close.
revoke all on function public.create_order(text,text,text,text,text,text,jsonb,bigint,integer,text) from public, anon, authenticated;
grant execute on function public.create_order(text,text,text,text,text,text,jsonb,bigint,integer,text) to service_role;
