-- RLS policy snapshot — public.products / public.orders / public.reviews
--
-- This is a reviewable baseline of the RLS policies actually in force in the
-- live project as of 2026-08-19 (backlog #4: these previously existed only
-- in the Supabase dashboard, invisible to code review). Written idempotent
-- (drop-if-exists + create) so it's safe to re-run.
--
-- Also captured here: dropping "Public can insert orders", the policy that
-- let the anon key insert directly into orders (with an attacker-chosen
-- price) alongside the new create-order edge function. create-order uses
-- the service-role key, which bypasses RLS entirely, so this drop has no
-- effect on the real checkout path — it only closes the bypass.

-- ── is_admin() — used by every admin-only policy below ─────────────────────
-- SECURITY DEFINER with a pinned search_path (avoids search_path hijacking).
create or replace function public.is_admin() returns boolean
language sql stable security definer
set search_path to 'public'
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ── products ─────────────────────────────────────────────────────────────
-- Public can browse the catalog; only admins can mutate it.
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products" on public.products
  for select to public using (true);

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products
  for insert to authenticated with check (is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products
  for update to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products
  for delete to authenticated using (is_admin());

-- ── orders ───────────────────────────────────────────────────────────────
-- No public INSERT/SELECT/UPDATE/DELETE — all order creation goes through
-- the create-order edge function (service role), all lookup through the
-- track-order edge function (service role, rate-limited by order code).
-- Only admins (via an authenticated session) can read/update/delete directly.
drop policy if exists "Public can insert orders" on public.orders;

drop policy if exists "Admins can select orders" on public.orders;
create policy "Admins can select orders" on public.orders
  for select to authenticated using (is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders
  for update to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders" on public.orders
  for delete to authenticated using (is_admin());

-- ── reviews ──────────────────────────────────────────────────────────────
-- Public can read all reviews. Public can only insert a review for an order
-- that's actually marked completed (one review per completed order is
-- enforced client-side in useReviewSubmission, not by a DB constraint here).
drop policy if exists "Reviews are publicly readable" on public.reviews;
create policy "Reviews are publicly readable" on public.reviews
  for select to public using (true);

drop policy if exists "Public can insert reviews" on public.reviews;
create policy "Public can insert reviews" on public.reviews
  for insert to public with check (
    exists (
      select 1 from public.orders
      where orders.id = reviews.order_id
        and orders.status = 'completed'::order_status
    )
  );
