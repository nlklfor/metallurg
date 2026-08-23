-- The "Public can insert reviews" policy's WITH CHECK subqueries `orders`
-- directly, but that subquery runs under the calling (anon) role's own RLS,
-- and orders has no public SELECT policy (intentionally, to close the
-- client-trusted-price hole from backlog #1) -- so the EXISTS always
-- evaluated to false for real customers, regardless of actual order status.
-- Customers hit this as "new row violates row-level security policy for
-- table reviews" when trying to submit a review on a genuinely completed
-- order. Fix: check completion through a SECURITY DEFINER function (same
-- pattern as is_admin()) so the check runs with elevated privilege while
-- only ever returning a boolean.

create or replace function public.is_order_completed(p_order_id uuid) returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.orders
    where id = p_order_id and status = 'completed'::order_status
  );
$$;

revoke all on function public.is_order_completed(uuid) from public;
grant execute on function public.is_order_completed(uuid) to anon, authenticated;

drop policy if exists "Public can insert reviews" on public.reviews;
create policy "Public can insert reviews" on public.reviews
  for insert to public with check (is_order_completed(order_id));
