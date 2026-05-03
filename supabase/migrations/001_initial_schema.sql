-- ─── Jobs ────────────────────────────────────────────────────────────────────
create table if not exists jobs (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  company             text not null,
  city                text not null,
  country             text not null,
  salary_min          numeric,
  salary_max          numeric,
  currency            text,
  experience_level    text,
  apply_url           text not null,
  description         text,
  featured            boolean default false,
  approved            boolean default false,
  source              text check (source in ('admin', 'user_submission')) not null,
  submitter_email     text,
  submitter_ip_hash   text,
  posted_at           timestamptz default now(),
  expires_at          timestamptz default (now() + interval '30 days'),
  created_at          timestamptz default now()
);

create index if not exists jobs_city_idx    on jobs(city);
create index if not exists jobs_active_idx  on jobs(approved, expires_at) where approved = true;

-- RLS
alter table jobs enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'jobs' and policyname = 'Public read approved jobs') then
    create policy "Public read approved jobs" on jobs for select using (approved = true and expires_at > now());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'jobs' and policyname = 'Service role full access') then
    create policy "Service role full access" on jobs for all using (auth.role() = 'service_role');
  end if;
end $$;


-- ─── Testimonials ─────────────────────────────────────────────────────────────
create table if not exists testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,
  city        text,
  rating      int check (rating between 1 and 5) default 5,
  quote       text not null,
  approved    boolean default false,
  created_at  timestamptz default now()
);

alter table testimonials enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'testimonials' and policyname = 'Public read approved testimonials') then
    create policy "Public read approved testimonials" on testimonials for select using (approved = true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'testimonials' and policyname = 'Service role full access on testimonials') then
    create policy "Service role full access on testimonials" on testimonials for all using (auth.role() = 'service_role');
  end if;
end $$;


-- ─── Contact messages ─────────────────────────────────────────────────────────
create table if not exists contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  ip_hash     text,
  created_at  timestamptz default now()
);

alter table contact_messages enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'contact_messages' and policyname = 'Service role full access on contact') then
    create policy "Service role full access on contact" on contact_messages for all using (auth.role() = 'service_role');
  end if;
end $$;


-- ─── Salary submissions ───────────────────────────────────────────────────────
create table if not exists salary_submissions (
  id                uuid primary key default gen_random_uuid(),
  job_title         text not null,
  city              text not null,
  country           text not null,
  experience_years  int,
  salary_monthly    numeric not null,
  currency          text not null,
  employment_type   text,
  nationality       text,
  created_at        timestamptz default now()
);

alter table salary_submissions enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'salary_submissions' and policyname = 'Service role full access on salary_submissions') then
    create policy "Service role full access on salary_submissions" on salary_submissions for all using (auth.role() = 'service_role');
  end if;
end $$;


-- ─── Data deletion requests ───────────────────────────────────────────────────
create table if not exists data_deletion_requests (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  request_type text not null,
  description  text,
  ip           text,
  created_at   timestamptz default now()
);

alter table data_deletion_requests enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'data_deletion_requests' and policyname = 'Service role full access on deletion_requests') then
    create policy "Service role full access on deletion_requests" on data_deletion_requests for all using (auth.role() = 'service_role');
  end if;
end $$;
