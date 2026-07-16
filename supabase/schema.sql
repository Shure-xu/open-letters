create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'active',
  source text,
  unsubscribe_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_sent_at timestamptz
);

create index if not exists subscribers_status_idx
  on public.subscribers (status);

create index if not exists subscribers_created_at_idx
  on public.subscribers (created_at desc);

create table if not exists public.email_sends (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid references public.subscribers(id) on delete set null,
  issue_id text,
  status text not null,
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_sends_subscriber_id_idx
  on public.email_sends (subscriber_id);

create index if not exists email_sends_created_at_idx
  on public.email_sends (created_at desc);

create unique index if not exists email_sends_subscriber_issue_idx
  on public.email_sends (subscriber_id, issue_id);
