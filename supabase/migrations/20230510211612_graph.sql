create table node (
  id bigint primary key generated by default as identity,
  type text not null,
  user_id uuid references profile(id) not null,
  data jsonb,
  public boolean default false
);
alter table node enable row level security;
create policy "Anyone can read nodes that are public" on node
  for select using (public = true);
create policy "Authenticated user can manage their nodes" on node
  for all using (auth.uid() = user_id);

create table edge (
  source bigint references node(id) not null,
  destination bigint references node(id) not null,
  user_id uuid references profile(id) not null,
  data jsonb,
  public boolean default false
);
alter table edge enable row level security;
create policy "Anyone can read edges that are public" on edge
  for select using (public = true);
create policy "Authenticated user can manage their edges" on edge
  for all using (auth.uid() = user_id);
