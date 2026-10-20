create extension if not exists "pgcrypto";

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  description text not null default '',
  region text not null default '',
  distance_km numeric not null default 0,
  duration_min integer not null default 0,
  elevation_gain_m integer not null default 0,
  difficulty text not null default 'media' check (difficulty in ('facil', 'media', 'alta')),
  surface text not null default 'asfalto' check (surface in ('asfalto', 'mixto', 'tierra')),
  tags text[] not null default '{}',
  start_name text not null default '',
  points jsonb not null default '[]'::jsonb,
  youtube_url text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists routes_published_created_idx
  on public.routes (published, created_at desc);

create index if not exists routes_tags_idx on public.routes using gin (tags);

alter table public.routes enable row level security;

drop policy if exists "rutas publicas visibles" on public.routes;
create policy "rutas publicas visibles"
  on public.routes for select
  using (published = true);

-- Las escrituras se hacen desde el servidor con la service role key,
-- por lo que no se crean politicas de insert/update para el publico.
