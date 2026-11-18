-- Wish list item type: lets donors filter the list by what kind of need it is.
-- Existing items become 'Others'; an admin can re-categorise them.
-- No policy changes: wishlist_items already has RLS, and these rules are
-- the same ones that apply to the other columns.

alter table public.wishlist_items
  add column item_type text not null default 'Others'
  check (item_type in (
    'Food',
    'Medical & Therapy',
    'Education',
    'Daily Essentials',
    'Equipment',
    'Bills & Maintenance',
    'Others'
  ));
