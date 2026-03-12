-- 6. Pet Social Profiles
create table public.pet_social_profiles (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references public.pets(id) on delete cascade not null,
  platform text not null,
  url text not null,
  created_at timestamp with time zone default now()
);

alter table public.pet_social_profiles enable row level security;

create policy "Users can manage social profiles of own pets"
  on public.pet_social_profiles for all
  using (
    exists (
      select 1 from public.pets
      where pets.id = pet_social_profiles.pet_id
      and pets.owner_id = auth.uid()
    )
  );
