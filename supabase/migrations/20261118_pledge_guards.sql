-- Over-pledge protection + General Fund (Parts 2-5).
-- Everything is applied together, or not at all.

begin;

-- 1. Part 5: donors can allow extra money to go to the General Fund,
--    and a pledge can end up 'redirected' (counts toward no item).
alter table public.pledges
  add column allow_general_fund boolean not null default true;

alter table public.pledges
  drop constraint if exists pledges_status_check,
  add constraint pledges_status_check
    check (status in ('pending', 'confirmed', 'rejected', 'redirected'));

-- 2. Part 3: a plain column the triggers "touch" so Realtime fires on
--    wishlist_items whenever a pledge is created or changes status.
--    (Realtime cannot listen to a function; it can listen to this table.)
alter table public.wishlist_items
  add column pledges_changed_at timestamptz;

-- 3. Part 2: server-side guard on INSERT. Locks the item row, so two donors
--    pledging at the same moment run one after the other. The second one
--    sees the first one's pending pledge and is rejected if nothing is left.
--    Error code CL001; the HINT carries how many are left.
create function public.guard_pledge_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target integer;
  v_taken integer;
  v_remaining integer;
begin
  select target_qty into v_target
  from wishlist_items
  where id = new.wishlist_item_id and status = 'active'
  for update;

  if not found then
    raise exception 'item_unavailable' using errcode = 'CL003';
  end if;

  select coalesce(sum(qty), 0) into v_taken
  from pledges
  where wishlist_item_id = new.wishlist_item_id
    and status in ('confirmed', 'pending');

  v_remaining := greatest(0, v_target - v_taken);

  if new.qty > v_remaining then
    raise exception 'over_pledged' using errcode = 'CL001', hint = v_remaining::text;
  end if;

  return new;
end;
$$;

create trigger pledge_insert_guard
before insert on public.pledges
for each row execute function public.guard_pledge_insert();

-- 4. Part 4: server-side guard on status changes.
--    - confirmed: refused if confirmed total would pass the amount needed (CL002)
--    - redirected: only from pending, and only if the donor allowed it (CL004)
create function public.guard_pledge_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target integer;
  v_confirmed integer;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if new.status = 'confirmed' then
    select target_qty into v_target
    from wishlist_items
    where id = new.wishlist_item_id
    for update;

    select coalesce(sum(qty), 0) into v_confirmed
    from pledges
    where wishlist_item_id = new.wishlist_item_id
      and status = 'confirmed'
      and id <> new.id;

    if v_confirmed + new.qty > v_target then
      raise exception 'over_confirm' using errcode = 'CL002',
        hint = greatest(0, v_target - v_confirmed)::text;
    end if;
  end if;

  if new.status = 'redirected'
     and (old.status <> 'pending' or not new.allow_general_fund) then
    raise exception 'cannot_redirect' using errcode = 'CL004';
  end if;

  return new;
end;
$$;

create trigger pledge_status_guard
before update of status on public.pledges
for each row execute function public.guard_pledge_status();

-- 5. Part 3: touch the item whenever one of its pledges is created or
--    changes status, so the public wish list reloads live.
create function public.touch_wishlist_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update wishlist_items
  set pledges_changed_at = now()
  where id = new.wishlist_item_id;
  return new;
end;
$$;

create trigger pledge_touch_item
after insert or update of status on public.pledges
for each row execute function public.touch_wishlist_item();

-- 6. Part 5: a donor checks their own pledge with its id (a random UUID
--    that works like a private link). Safe fields only: no email or phone.
create function public.get_pledge_status(p_id uuid)
returns table (
  first_name text,
  item_name text,
  qty integer,
  unit_price numeric,
  status text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    split_part(trim(p.donor_name), ' ', 1),
    w.name,
    p.qty,
    w.unit_price,
    p.status,
    p.created_at
  from pledges p
  join wishlist_items w on w.id = p.wishlist_item_id
  where p.id = p_id;
$$;

revoke execute on function public.get_pledge_status(uuid) from public;
grant execute on function public.get_pledge_status(uuid) to anon, authenticated;

-- Trigger functions are never called directly
revoke execute on function public.guard_pledge_insert() from public, anon, authenticated;
revoke execute on function public.guard_pledge_status() from public, anon, authenticated;
revoke execute on function public.touch_wishlist_item() from public, anon, authenticated;

commit;
