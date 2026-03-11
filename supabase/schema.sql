-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (linked to Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Pets
create table public.pets (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text check (type in ('dog', 'cat')) not null,
  dob date,
  breed text,
  is_mixed boolean default false,
  photo_url text,
  home_address text,
  allergies text,
  chip_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.pets enable row level security;

create policy "Users can manage own pets"
  on public.pets for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- 3. Medical Records
create table public.medical_records (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references public.pets(id) on delete cascade not null,
  visit_date date not null,
  visit_type text check (visit_type in ('routine', 'vaccine', 'treatment')) not null,
  description text,
  vet_name text,
  created_at timestamp with time zone default now()
);

alter table public.medical_records enable row level security;

create policy "Users can manage medical records of own pets"
  on public.medical_records for all
  using (
    exists (
      select 1 from public.pets
      where pets.id = medical_records.pet_id
      and pets.owner_id = auth.uid()
    )
  );
