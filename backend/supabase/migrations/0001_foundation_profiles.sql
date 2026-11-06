-- AuPro foundation and profile records
-- Google sign-in is configured in Supabase Auth; this migration enforces the
-- university email-domain boundary for every authenticated profile.

create extension if not exists pgcrypto;

create type public.user_role as enum ('student', 'staff', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  username text unique,
  roll_no text,
  department text,
  year smallint,
  college_email text not null unique,
  role public.user_role not null default 'student',
  profile_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_college_email_domain check (
    lower(college_email) like '%@andhrauniversity.edu.in'
  ),
  constraint profiles_year_range check (year is null or year between 1 and 10)
);

create or replace function public.is_allowed_college_email(email text)
returns boolean
language sql
immutable
as $$
  select lower(coalesce(email, '')) like '%@andhrauniversity.edu.in';
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_allowed_college_email(new.email) then
    raise exception 'Only Andhra University college email addresses are allowed';
  end if;

  insert into public.profiles (id, college_email, name)
  values (
    new.id,
    lower(new.email),
    nullif(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), '')
  )
  on conflict (id) do update
    set college_email = excluded.college_email,
        name = coalesce(public.profiles.name, excluded.name),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (
  auth.uid() = id
  and public.is_allowed_college_email(college_email)
);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and public.is_allowed_college_email(college_email)
);
