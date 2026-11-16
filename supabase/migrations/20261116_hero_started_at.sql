-- US02: when an admin activates a Kids Hero subscription, the DATABASE
-- clock sets started_at (not the admin's phone/computer clock).
-- The app only changes status; this trigger fills in the date.

create function public.set_subscription_started_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Only when the status CHANGES to active (not on other edits)
  if new.status = 'active' and old.status is distinct from 'active' then
    new.started_at := now();
  end if;
  return new;
end;
$$;

-- "before update": we change the row before it is saved
create trigger subscription_started_at
before update of status on public.subscriptions
for each row execute function public.set_subscription_started_at();
