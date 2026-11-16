-- US09: an admin can reject a pledge (e.g. no matching bank transfer).
-- Allow 'rejected' as a pledge status.
-- Rejecting does NOT touch wishlist_items.pledged_qty: the
-- apply_confirmed_pledge trigger only acts when status becomes 'confirmed'.

alter table public.pledges
  drop constraint if exists pledges_status_check,
  add constraint pledges_status_check
    check (status in ('pending', 'confirmed', 'rejected'));
