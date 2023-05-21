-- profile

create table profile (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null
);
alter table profile enable row level security;
create policy "Anyone can read profiles" on profile
  for select using (true);
create policy "Authenticated user can manage their profile" on profile
  for all using (auth.uid() = id);

-- roles

create table user_role (
    user_id uuid references auth.users(id) on delete cascade,
    role text not null check (role in ('admin', 'curator')),
    constraint user_role_pkey primary key (user_id, role)
);
alter table user_role enable row level security;
create policy "Authenticated user can read their own role" on user_role
    for select using (auth.uid() = user_id);

-- utils

create function is_admin() returns boolean as $$
    select exists(
        select user_id from public.user_role where user_id = auth.uid() and role = 'admin'
    );
$$ language sql;
