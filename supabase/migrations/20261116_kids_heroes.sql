-- US02: Kids Heroes monthly subscriptions.
-- Donors (no account) subscribe, optionally upload a transfer receipt,
-- and can check their own status with the subscription id.
-- begin/commit: all four parts are applied together, or none of them.

begin;

-- 1. Where the subscription's receipt is stored (path inside the 'receipts' bucket)
alter table public.subscriptions
  add column receipt_path text
  check (receipt_path is null or (receipt_path like 'subscriptions/%' and char_length(receipt_path) <= 300));

-- 2. Tighten the donor insert rule.
--    Before: only "status must be pending".
--    Now also: no start date, and the amount must match the chosen tier
--    (RM30 / RM50 exactly, or a whole-ringgit custom amount of at least RM10).
--    Columns are written as subscriptions.<column> on purpose: inside the
--    exists (...) a bare "amount" would mean the TIER's amount.
drop policy "Donors create pending subscriptions" on public.subscriptions;
create policy "Donors create pending subscriptions"
  on public.subscriptions for insert
  to anon, authenticated
  with check (
    subscriptions.status = 'pending'
    and subscriptions.started_at is null
    and exists (
      select 1
      from public.subscription_tiers t
      where t.id = subscriptions.tier_id
        and (
          (not t.is_custom and subscriptions.amount = t.amount)
          or (t.is_custom and subscriptions.amount >= 10
                          and subscriptions.amount = trunc(subscriptions.amount))
        )
    )
  );

-- 3. Donors may upload receipts into receipts/subscriptions/... (upload only:
--    no select/update/delete, so they cannot list, read or overwrite files).
--    The existing "Admin reads receipts" policy already covers this folder.
create policy "Donors upload subscription receipts"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = 'subscriptions'
  );

-- 4. Let a donor check their own subscription by its id, WITHOUT opening
--    the table to visitors. Returns only safe fields: no email or phone.
--    The id is a random UUID, so it works like a private link.
create function public.get_hero_status(sub_id uuid)
returns table (
  first_name text,
  tier_name text,
  amount numeric,
  status text,
  started_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    split_part(trim(s.donor_name), ' ', 1),
    t.name,
    s.amount,
    s.status,
    s.started_at
  from subscriptions s
  left join subscription_tiers t on t.id = s.tier_id
  where s.id = sub_id;
$$;

revoke execute on function public.get_hero_status(uuid) from public;
grant execute on function public.get_hero_status(uuid) to anon, authenticated;

commit;
