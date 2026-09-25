-- Waitlist for tools that are announced but not live yet (currently: cover-letter).
-- Written to, and read by, the service role only. Apply manually in the
-- Supabase SQL editor; Claude Code has no DDL access to this project.

create table if not exists tool_waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  tool       text not null,
  created_at timestamptz not null default now(),
  constraint tool_waitlist_email_len    check (char_length(email) <= 254),
  constraint tool_waitlist_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint tool_waitlist_tool_known   check (tool in ('cover-letter')),
  constraint tool_waitlist_email_tool_unique unique (email, tool)
);

alter table tool_waitlist enable row level security;

-- No public policies: anon/authenticated roles can neither read nor write.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'tool_waitlist' and policyname = 'Service role full access on tool_waitlist') then
    create policy "Service role full access on tool_waitlist" on tool_waitlist for all using (auth.role() = 'service_role');
  end if;
end $$;
