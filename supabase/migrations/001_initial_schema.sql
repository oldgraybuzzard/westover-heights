-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_role as enum ('USER', 'EXPERT', 'ADMIN');
create type topic_status as enum ('OPEN', 'ANSWERED', 'CLOSED');

-- Create users table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text unique not null,
  role user_role not null default 'USER',
  email_visible boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create topics table
create table public.topics (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  author_id uuid references public.profiles not null,
  status topic_status not null default 'OPEN',
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create replies table
create table public.replies (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  author_id uuid references public.profiles not null,
  topic_id uuid references public.topics on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.replies enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
on public.profiles for select
using (true);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

-- Topics policies
create policy "Topics are viewable by everyone"
on public.topics for select
using (true);

create policy "Authenticated users can create topics"
on public.topics for insert
with check (auth.role() = 'authenticated');

create policy "Users can update own topics"
on public.topics for update
using (auth.uid() = author_id);

-- Replies policies
create policy "Replies are viewable by everyone"
on public.replies for select
using (true);

create policy "Authenticated users can create replies"
on public.replies for insert
with check (auth.role() = 'authenticated');

create policy "Users can update own replies"
on public.replies for update
using (auth.uid() = author_id);

-- Create functions
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    'user_' || substr(md5(random()::text), 1, 8),
    'USER'
  );
  return new;
end;
$$;

-- Set up triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 