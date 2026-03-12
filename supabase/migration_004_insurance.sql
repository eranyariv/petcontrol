-- 5. Pet Insurance
create table public.pet_insurance (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references public.pets(id) on delete cascade not null,
  firm_name text not null,
  start_date date not null,
  end_date date not null,
  cost numeric,
  policy_pdf_url text,
  created_at timestamp with time zone default now()
);

alter table public.pet_insurance enable row level security;

create policy "Users can manage insurance of own pets"
  on public.pet_insurance for all
  using (
    exists (
      select 1 from public.pets
      where pets.id = pet_insurance.pet_id
      and pets.owner_id = auth.uid()
    )
  );
