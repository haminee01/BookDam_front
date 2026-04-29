-- BookDam minimal schema for frontend-only + Supabase auth
-- Run in Supabase SQL editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  nickname text,
  phone text,
  introduction text,
  profile_image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "read own profile" on public.profiles
for select to authenticated
using (auth.uid() = id);

create policy "insert own profile" on public.profiles
for insert to authenticated
with check (auth.uid() = id);

create policy "update own profile" on public.profiles
for update to authenticated
using (auth.uid() = id);

create table if not exists public.posts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_numeric_id bigint not null,
  nickname text,
  profile_image text,
  title text not null,
  content text not null,
  type text not null default 'GENERAL',
  comment_count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_numeric_id bigint not null,
  nickname text,
  profile_image text,
  content text not null,
  parent_id bigint null references public.comments(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.communities (
  id bigint generated always as identity primary key,
  isbn13 text not null,
  book_title text null,
  title text not null,
  description text not null,
  status text not null default 'RECRUITING',
  max_members integer not null default 6,
  current_members integer not null default 1,
  host_id uuid not null references auth.users(id) on delete cascade,
  host_numeric_id bigint not null,
  host_nickname text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.community_applications (
  id bigint generated always as identity primary key,
  community_id bigint not null references public.communities(id) on delete cascade,
  applicant_id uuid not null references auth.users(id) on delete cascade,
  applicant_numeric_id bigint not null,
  applicant_nickname text,
  application_message text,
  status text not null default 'PENDING',
  applied_at timestamptz default now(),
  processed_at timestamptz null,
  unique(community_id, applicant_id)
);

create table if not exists public.team_posts (
  id bigint generated always as identity primary key,
  community_id bigint not null references public.communities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_numeric_id bigint not null,
  nickname text,
  profile_image text,
  title text not null,
  content text not null,
  type text not null default 'DISCUSSION',
  comment_count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.team_comments (
  id bigint generated always as identity primary key,
  community_id bigint not null references public.communities(id) on delete cascade,
  team_post_id bigint not null references public.team_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_numeric_id bigint not null,
  nickname text,
  profile_image text,
  content text not null,
  parent_id bigint null references public.team_comments(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.wishlist (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_numeric_id bigint not null,
  nickname text,
  isbn13 text not null,
  title text not null,
  cover text null,
  added_at timestamptz default now(),
  unique(user_id, isbn13)
);

create table if not exists public.my_library (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_numeric_id bigint not null,
  nickname text,
  isbn13 text not null,
  title text not null,
  author text,
  publisher text,
  cover text,
  category text,
  status text not null default 'WANT_TO_READ',
  my_rating integer null,
  updated_at timestamptz default now(),
  unique(user_id, isbn13)
);

alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.communities enable row level security;
alter table public.community_applications enable row level security;
alter table public.team_posts enable row level security;
alter table public.team_comments enable row level security;
alter table public.wishlist enable row level security;
alter table public.my_library enable row level security;

create policy "posts read all" on public.posts for select to authenticated using (true);
create policy "posts write own" on public.posts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "comments read all" on public.comments for select to authenticated using (true);
create policy "comments write own" on public.comments for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "communities read all" on public.communities for select to authenticated using (true);
create policy "communities write host" on public.communities for all to authenticated using (auth.uid() = host_id) with check (auth.uid() = host_id);
create policy "community apps read all" on public.community_applications for select to authenticated using (true);
create policy "community apps write own" on public.community_applications for all to authenticated using (auth.uid() = applicant_id) with check (auth.uid() = applicant_id);
create policy "team posts read all" on public.team_posts for select to authenticated using (true);
create policy "team posts write own" on public.team_posts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "team comments read all" on public.team_comments for select to authenticated using (true);
create policy "team comments write own" on public.team_comments for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wishlist own only" on public.wishlist for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "library own only" on public.my_library for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

