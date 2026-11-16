alter table public.wishlist_items
  add column unit_price numeric(10,2)
  check (unit_price is null or unit_price > 0);