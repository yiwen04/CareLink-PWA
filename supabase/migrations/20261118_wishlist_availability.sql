-- Reserved quantity: a PENDING pledge counts as taken, so two donors can't
-- both pledge the same last unit. Rejected pledges are ignored (rejecting
-- frees the quantity).
--
-- Visitors cannot read the pledges table (RLS). This function runs with the
-- owner's rights and returns ONLY totals per item: no names, emails or
-- receipts. Pass an item id for one item, or nothing for all active items.
--
-- Usage from the app: supabase.rpc('get_wishlist_availability')
--                     supabase.rpc('get_wishlist_availability', { p_item_id: id })

create function public.get_wishlist_availability(p_item_id uuid default null)
returns table (
  item_id uuid,
  qty_needed integer,
  qty_confirmed integer,
  qty_pending integer,
  qty_remaining integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    w.id,
    w.target_qty,
    coalesce(sum(p.qty) filter (where p.status = 'confirmed'), 0)::integer,
    coalesce(sum(p.qty) filter (where p.status = 'pending'), 0)::integer,
    greatest(
      0,
      w.target_qty - coalesce(sum(p.qty) filter (where p.status in ('confirmed', 'pending')), 0)
    )::integer
  from wishlist_items w
  left join pledges p on p.wishlist_item_id = w.id
  where w.status = 'active'
    and (p_item_id is null or w.id = p_item_id)
  group by w.id, w.target_qty;
$$;

revoke execute on function public.get_wishlist_availability(uuid) from public;
grant execute on function public.get_wishlist_availability(uuid) to anon, authenticated;
