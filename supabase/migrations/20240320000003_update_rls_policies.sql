alter table profiles enable row level security;
alter table topics enable row level security;

create policy "Users can view their own encrypted email"
on profiles for select
to authenticated
using (auth.uid() = id);

create policy "Only admins can view all encrypted emails"
on profiles for select
to authenticated
using (exists (
  select 1 from profiles
  where id = auth.uid()
  and 'ADMIN' = any(roles)
)); 