 -- Function to grant posting permission
create function grant_posting_permission(session_id uuid)
returns void as $$
begin
  update profiles
  set can_post = true
  where id = auth.uid();
end;
$$ language plpgsql security definer;

-- RLS policy for posting
create policy "Users can post if they've paid"
on topics
for insert
to authenticated
using (
  (select can_post from profiles where id = auth.uid())
  or
  (select role from profiles where id = auth.uid()) = 'ADMIN'
);