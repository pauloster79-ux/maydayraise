-- 1. Create the audit table
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  table_name text not null,
  record_id text,
  operation text not null,
  old_record jsonb,
  new_record jsonb,
  changed_by uuid default auth.uid(),
  changed_at timestamptz default now()
);

-- 2. Enable RLS on the audit table (optional but recommended)
alter table public.audit_logs enable row level security;

-- 3. Create a policy to allow read access to admins (adjust criteria as needed)
-- For example, if you have an 'admin' role or specific users
-- create policy "Admins can read audit logs" on public.audit_logs for select using (auth.role() = 'service_role');

-- 4. Create the trigger function
create or replace function public.handle_audit_log()
returns trigger as $$
declare
  old_data jsonb;
  new_data jsonb;
  record_id_text text;
begin
  if (TG_OP = 'UPDATE') then
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    record_id_text := OLD.id::text;
  elsif (TG_OP = 'DELETE') then
    old_data := to_jsonb(OLD);
    new_data := null;
    record_id_text := OLD.id::text;
  elsif (TG_OP = 'INSERT') then
    old_data := null;
    new_data := to_jsonb(NEW);
    record_id_text := NEW.id::text;
  end if;

  insert into public.audit_logs (
    table_name,
    record_id,
    operation,
    old_record,
    new_record,
    changed_by
  )
  values (
    TG_TABLE_NAME,
    record_id_text,
    TG_OP,
    old_data,
    new_data,
    auth.uid()
  );

  return new;
end;
$$ language plpgsql security definer;

-- 5. Create triggers for each table you want to track
-- Drop existing triggers to avoid errors if re-running
drop trigger if exists audit_shareholders_changes on public.shareholders;
create trigger audit_shareholders_changes
  after insert or update or delete on public.shareholders
  for each row execute function public.handle_audit_log();

drop trigger if exists audit_applications_changes on public.applications;
create trigger audit_applications_changes
  after insert or update or delete on public.applications
  for each row execute function public.handle_audit_log();

drop trigger if exists audit_payments_changes on public.payments;
create trigger audit_payments_changes
  after insert or update or delete on public.payments
  for each row execute function public.handle_audit_log();

drop trigger if exists audit_messages_changes on public.messages;
create trigger audit_messages_changes
  after insert or update or delete on public.messages
  for each row execute function public.handle_audit_log();

drop trigger if exists audit_settings_changes on public.settings;
create trigger audit_settings_changes
  after insert or update or delete on public.settings
  for each row execute function public.handle_audit_log();

drop trigger if exists audit_certificates_changes on public.certificates;
create trigger audit_certificates_changes
  after insert or update or delete on public.certificates
  for each row execute function public.handle_audit_log();

-- Optional: Audit the 'User' table if you are using it for profile data
-- Note: 'User' is a reserved keyword in some contexts, ensure it matches your actual table name (e.g. "User" with quotes if case sensitive)
-- Based on schema.prisma it is 'User' (capital U) or 'public."User"', but Prisma usually maps it to 'User' or 'user' (lowercase) in Postgres depending on config.
-- In Prisma schema it says: model User { ... }. By default prisma uses mixed case if not mapped.
-- However, standard postgres practice often uses lowercase. I will assume it is "User" or "user".
-- Check if table exists in your public schema. If it was created via Prisma with default mapping, it might be named "User" (quoted).
-- safely attempting to create trigger if table exists
do $$
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'User') then
    execute 'create trigger audit_user_changes after insert or update or delete on public."User" for each row execute function public.handle_audit_log()';
  elsif exists (select from pg_tables where schemaname = 'public' and tablename = 'user') then
    execute 'create trigger audit_user_changes after insert or update or delete on public."user" for each row execute function public.handle_audit_log()';
  end if;
end
$$;
