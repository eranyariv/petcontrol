-- 4. Vets (supporting veterinarians per pet)
create table public.vets (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references public.pets(id) on delete cascade not null,
  name text not null,
  clinic_address text,
  phone text,
  created_at timestamp with time zone default now()
);

alter table public.vets enable row level security;

create policy "Users can manage vets of own pets"
  on public.vets for all
  using (
    exists (
      select 1 from public.pets
      where pets.id = vets.pet_id
      and pets.owner_id = auth.uid()
    )
  );
