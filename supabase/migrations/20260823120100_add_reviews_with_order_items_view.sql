-- getAllReviews() fetches order items via a PostgREST embedded join
-- (reviews.select("*, orders(items)")), but that join is also subject to
-- orders' own RLS -- which has no public SELECT policy (intentionally,
-- since backlog #1). So the embed silently returned null for every review,
-- and the purchased-item names never rendered on review cards. Fix: expose
-- the join through a view owned by postgres (same table owner as orders),
-- which bypasses orders' RLS for readers the same way is_admin() and
-- is_order_completed() do for functions.
create or replace view public.reviews_with_order_items as
select r.*, o.items as order_items
from public.reviews r
join public.orders o on o.id = r.order_id;

grant select on public.reviews_with_order_items to anon, authenticated;
