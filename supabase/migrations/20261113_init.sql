-- CareLink PWA: initial schema (Sprint 1: US01 wishlist, US02 subscriptions)

-- 0. Remove the stack-test table
drop table if exists test;

-- 1. Admin list (links to Supabase Auth users)
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table admins enable row level security;

create function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 2. Wishlist items (US01)
create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  description text check (char_length(description) <= 500),
  target_qty integer not null check (target_qty > 0),
  pledged_qty integer not null default 0 check (pledged_qty >= 0),
  urgency text not null default 'medium' check (urgency in ('low', 'medium', 'high')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now()
);

-- 3. Subscription tiers (US02)
create table subscription_tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount numeric(10,2) check (amount is null or amount > 0),
  is_custom boolean not null default false
);

-- 4. Subscriptions (a donor choosing a Kids Heroes tier)
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  tier_id uuid references subscription_tiers(id),
  donor_name text not null check (char_length(donor_name) between 1 and 100),
  donor_email text not null check (char_length(donor_email) <= 200),
  donor_phone text check (char_length(donor_phone) <= 30),
  amount numeric(10,2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'active', 'failed')),
  started_at timestamptz,
  created_at timestamptz not null default now()
);

-- 5. Pledges (a donor pledging wishlist items)
create table pledges (
  id uuid primary key default gen_random_uuid(),
  wishlist_item_id uuid not null references wishlist_items(id),
  donor_name text not null check (char_length(donor_name) between 1 and 100),
  donor_email text not null check (char_length(donor_email) <= 200),
  donor_phone text check (char_length(donor_phone) <= 30),
  qty integer not null check (qty > 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed')),
  created_at timestamptz not null default now()
);

-- 6. When an admin confirms a pledge, raise the item's progress (never above target)
create function apply_confirmed_pledge()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'confirmed'
     and (tg_op = 'INSERT' or old.status is distinct from 'confirmed') then
    update wishlist_items
    set pledged_qty = least(target_qty, pledged_qty + new.qty)
    where id = new.wishlist_item_id;
  end if;
  return new;
end;
$$;

create trigger pledge_confirmed
after insert or update of status on pledges
for each row execute function apply_confirmed_pledge();

-- 7. Row Level Security
alter table wishlist_items enable row level security;
alter table subscription_tiers enable row level security;
alter table subscriptions enable row level security;
alter table pledges enable row level security;

-- Wishlist: public sees active items; admin sees and manages everything
create policy "Public reads active wishlist"
  on wishlist_items for select
  to anon, authenticated
  using (status = 'active' or is_admin());
create policy "Admin inserts wishlist"
  on wishlist_items for insert to authenticated with check (is_admin());
create policy "Admin updates wishlist"
  on wishlist_items for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admin deletes wishlist"
  on wishlist_items for delete to authenticated using (is_admin());

-- Tiers: public read, admin manage
create policy "Public reads tiers"
  on subscription_tiers for select to anon, authenticated using (true);
create policy "Admin manages tiers"
  on subscription_tiers for all to authenticated using (is_admin()) with check (is_admin());

-- Subscriptions: donors can only create PENDING rows; admin reads and updates
create policy "Donors create pending subscriptions"
  on subscriptions for insert to anon, authenticated with check (status = 'pending');
create policy "Admin reads subscriptions"
  on subscriptions for select to authenticated using (is_admin());
create policy "Admin updates subscriptions"
  on subscriptions for update to authenticated using (is_admin()) with check (is_admin());

-- Pledges: same pattern
create policy "Donors create pending pledges"
  on pledges for insert to anon, authenticated with check (status = 'pending');
create policy "Admin reads pledges"
  on pledges for select to authenticated using (is_admin());
create policy "Admin updates pledges"
  on pledges for update to authenticated using (is_admin()) with check (is_admin());

-- 8. Live updates for the progress bars
alter publication supabase_realtime add table wishlist_items;

-- 9. Seed data (test only; remove before the real launch)
insert into subscription_tiers (name, amount, is_custom) values
  ('Kids Hero RM30', 30, false),
  ('Kids Hero RM50', 50, false),
  ('Custom amount', null, true);

insert into wishlist_items (name, description, target_qty, pledged_qty, urgency) values
  ('Rice (10kg bag)', 'Weekly staple for 22 residents', 10, 3, 'high'),
  ('Diapers (large pack)', 'For residents who need them daily', 20, 5, 'high'),
  ('Cooking oil (5L)', 'Kitchen supplies', 6, 0, 'medium'),
  ('Electricity bill top-up (RM100)', 'Monthly utility cost', 5, 1, 'medium');