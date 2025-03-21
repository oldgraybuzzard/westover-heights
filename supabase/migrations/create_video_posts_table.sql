create table video_posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  youtubeId text not null,
  publishedAt timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table video_posts enable row level security;

-- Create policies
create policy "Anyone can view video posts" on video_posts
  for select using (true);

create policy "Only admins can insert video posts" on video_posts
  for insert with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and 'ADMIN' = any(roles)
    )
  );

create policy "Only admins can update video posts" on video_posts
  for update using (
    exists (
      select 1 from profiles
      where id = auth.uid() and 'ADMIN' = any(roles)
    )
  );

create policy "Only admins can delete video posts" on video_posts
  for delete using (
    exists (
      select 1 from profiles
      where id = auth.uid() and 'ADMIN' = any(roles)
    )
  );