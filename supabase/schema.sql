create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  location text,
  interests text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists quest_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  source text not null check (source in ('ai', 'fallback')),
  created_at timestamptz default now()
);

create table if not exists quests (
  id uuid primary key default gen_random_uuid(),
  quest_set_id uuid references quest_sets(id) on delete cascade,
  title text not null,
  description text not null,
  cadence text not null check (cadence in ('daily', 'weekly', 'monthly')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  completed_at timestamptz,
  proof_photo_url text,
  verification_status text check (verification_status in ('pending', 'approved', 'rejected')),
  verified_at timestamptz
);

create index if not exists quest_sets_session_idx on quest_sets(session_id);
create index if not exists quests_quest_set_idx on quests(quest_set_id);
