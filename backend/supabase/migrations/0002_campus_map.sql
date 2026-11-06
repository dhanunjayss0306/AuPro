-- AuPro campus map data model
-- Raw survey tracks remain private. Only reviewed records are publicly readable.

create extension if not exists postgis;

create type public.map_publication_status as enum ('draft', 'published', 'rejected');
create type public.map_suggestion_status as enum ('pending', 'accepted', 'rejected', 'needs_information');
create type public.survey_session_status as enum ('active', 'completed', 'reviewed');

create table public.map_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.map_places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references public.map_categories (id) on delete set null,
  description text,
  official_contact text,
  opening_hours text,
  accessibility_notes text,
  location geography(Point, 4326) not null,
  publication_status public.map_publication_status not null default 'draft',
  source_url text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index map_places_location_idx on public.map_places using gist (location);
create index map_places_category_idx on public.map_places (category_id);
create index map_places_status_idx on public.map_places (publication_status);

create table public.map_paths (
  id uuid primary key default gen_random_uuid(),
  name text,
  geometry geography(LineString, 4326) not null,
  accessibility_notes text,
  publication_status public.map_publication_status not null default 'draft',
  source_survey_session_id uuid,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index map_paths_geometry_idx on public.map_paths using gist (geometry);
create index map_paths_status_idx on public.map_paths (publication_status);

create table public.map_survey_sessions (
  id uuid primary key default gen_random_uuid(),
  surveyor_id uuid not null references public.profiles (id) on delete restrict,
  status public.survey_session_status not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text
);

create table public.map_survey_track_points (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.map_survey_sessions (id) on delete cascade,
  recorded_at timestamptz not null,
  location geography(Point, 4326) not null,
  accuracy_meters numeric,
  sequence_no integer not null,
  created_at timestamptz not null default now(),
  unique (session_id, sequence_no)
);

create index map_survey_track_points_location_idx on public.map_survey_track_points using gist (location);
create index map_survey_track_points_session_idx on public.map_survey_track_points (session_id, sequence_no);

create table public.map_suggestions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references public.profiles (id) on delete restrict,
  place_id uuid references public.map_places (id) on delete set null,
  suggested_name text,
  suggested_category_id uuid references public.map_categories (id) on delete set null,
  suggestion_text text not null,
  location geography(Point, 4326),
  status public.map_suggestion_status not null default 'pending',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index map_suggestions_location_idx on public.map_suggestions using gist (location);
create index map_suggestions_status_idx on public.map_suggestions (status);

create table public.map_offline_regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  boundary geography(Polygon, 4326) not null,
  package_url text,
  package_version text,
  publication_status public.map_publication_status not null default 'draft',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index map_offline_regions_boundary_idx on public.map_offline_regions using gist (boundary);

alter table public.map_paths
  add constraint map_paths_source_session_fk
  foreign key (source_survey_session_id)
  references public.map_survey_sessions (id)
  on delete set null;

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('staff', 'admin')
  );
$$;

create or replace function public.set_map_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger map_places_set_updated_at
before update on public.map_places
for each row execute procedure public.set_map_updated_at();

create trigger map_paths_set_updated_at
before update on public.map_paths
for each row execute procedure public.set_map_updated_at();

create trigger map_offline_regions_set_updated_at
before update on public.map_offline_regions
for each row execute procedure public.set_map_updated_at();

alter table public.map_categories enable row level security;
alter table public.map_places enable row level security;
alter table public.map_paths enable row level security;
alter table public.map_survey_sessions enable row level security;
alter table public.map_survey_track_points enable row level security;
alter table public.map_suggestions enable row level security;
alter table public.map_offline_regions enable row level security;

create policy "Anyone authenticated can view map categories"
on public.map_categories for select
to authenticated using (true);

create policy "Authenticated users can view published places"
on public.map_places for select
to authenticated using (publication_status = 'published' or created_by = auth.uid() or public.is_staff_or_admin());

create policy "Staff can manage places"
on public.map_places for all
to authenticated using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Authenticated users can view published paths"
on public.map_paths for select
to authenticated using (publication_status = 'published' or created_by = auth.uid() or public.is_staff_or_admin());

create policy "Staff can manage paths"
on public.map_paths for all
to authenticated using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Surveyors can manage their own sessions"
on public.map_survey_sessions for all
to authenticated using (surveyor_id = auth.uid() or public.is_staff_or_admin())
with check (surveyor_id = auth.uid() or public.is_staff_or_admin());

create policy "Surveyors can manage their own raw track points"
on public.map_survey_track_points for all
to authenticated using (
  public.is_staff_or_admin()
  or exists (
    select 1 from public.map_survey_sessions s
    where s.id = session_id and s.surveyor_id = auth.uid()
  )
)
with check (
  public.is_staff_or_admin()
  or exists (
    select 1 from public.map_survey_sessions s
    where s.id = session_id and s.surveyor_id = auth.uid()
  )
);

create policy "Users can create their own suggestions"
on public.map_suggestions for insert
to authenticated with check (submitted_by = auth.uid());

create policy "Users can view their own suggestions"
on public.map_suggestions for select
to authenticated using (submitted_by = auth.uid() or public.is_staff_or_admin());

create policy "Staff can review suggestions"
on public.map_suggestions for update
to authenticated using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Authenticated users can view published offline regions"
on public.map_offline_regions for select
to authenticated using (publication_status = 'published' or public.is_staff_or_admin());

create policy "Staff can manage offline regions"
on public.map_offline_regions for all
to authenticated using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());
