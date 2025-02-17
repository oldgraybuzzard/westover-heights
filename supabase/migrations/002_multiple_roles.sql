-- First drop the existing enum and column
alter table public.profiles drop column role;
drop type user_role;

-- Create new enum
create type user_role as enum ('PARTICIPANT', 'EXPERT', 'ADMIN');

-- Add new array column
alter table public.profiles 
add column roles user_role[] not null default array['PARTICIPANT']::user_role[]; 