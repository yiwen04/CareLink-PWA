-- US08: donors can attach their bank transfer receipt to a pledge.
-- Receipts live in a PRIVATE bucket. Visitors may upload but never read;
-- admins read them through signed URLs.

-- 1. Where the pledge's receipt file is stored (path inside the bucket)
alter table public.pledges
  add column receipt_path text
  check (receipt_path is null or (receipt_path like 'pledges/%' and char_length(receipt_path) <= 300));

-- 2. Private bucket: max 5 MB, images or PDF only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- 3. Bucket policies
-- Anyone pledging (logged in or not) may upload into receipts/pledges/...
-- No select/update/delete for them, so they cannot list, read or overwrite files.
create policy "Donors upload pledge receipts"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = 'pledges'
  );

-- Only admins can read receipts (needed to create signed URLs)
create policy "Admin reads receipts"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'receipts' and public.is_admin());

-- Admins may clean up receipts
create policy "Admin deletes receipts"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'receipts' and public.is_admin());
