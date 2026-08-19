-- set_is_international had no search_path pinned (function_search_path_mutable
-- advisory) — matches the same hardening already applied to is_admin() and
-- every function introduced in the create-order/restock migrations. Logic is
-- otherwise untouched (see docs/backlog.md for the separate, pre-existing
-- inverted-flag note on this function — not addressed here, out of scope for
-- this pass).
create or replace function public.set_is_international() returns trigger
language plpgsql
set search_path to 'public'
as $function$
BEGIN
  NEW.is_international := (NEW.shipping_zone = 'Ukraine');
  RETURN NEW;
END;
$function$;
