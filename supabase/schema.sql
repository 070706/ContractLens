create extension if not exists pgcrypto;

create or replace function public.demo_workspace_id()
returns uuid
language sql
immutable
as $$ select '00000000-0000-0000-0000-000000000001'::uuid $$;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'hackathon',
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'member',
  team text not null default 'Operations team',
  initials text not null default 'AS',
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  notification_days integer[] not null default array[7, 14, 30],
  organization text not null default 'Your company',
  ai_summary_style text not null default 'plain-language',
  updated_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  contract_type text not null,
  parties text not null,
  status text not null default 'Processing' check (status in ('Active', 'Renewal soon', 'Processing')),
  risk text not null default 'Pending' check (risk in ('Low', 'Medium', 'High', 'Pending')),
  effective_date date,
  expiration_date date,
  renewal_date date,
  icon text not null default 'CL',
  color_class text not null default 'bg-[#e8efff] text-[#526ec4]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contract_clauses (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  clause_number text not null,
  title text not null,
  category text not null,
  risk text not null default 'Low',
  page_number integer,
  source_text text not null,
  human_review_required boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.contract_versions (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  version_label text not null,
  version_date date not null default current_date,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.obligations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  party text not null,
  title text not null,
  deadline date,
  frequency text not null default 'One-time',
  priority text not null default 'Medium' check (priority in ('High', 'Medium', 'Low')),
  status text not null default 'Pending' check (status in ('Pending', 'Completed', 'Overdue')),
  source_reference text not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete cascade,
  alert_type text not null check (alert_type in ('Overdue', 'Upcoming', 'Review')),
  title text not null,
  detail text not null,
  is_read boolean not null default false,
  dismissed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  action text not null,
  detail text not null,
  icon text not null default 'spark',
  created_at timestamptz not null default now()
);

create index if not exists contracts_workspace_updated_idx on public.contracts(workspace_id, updated_at desc);
create index if not exists contracts_status_idx on public.contracts(workspace_id, status);
create index if not exists clauses_contract_idx on public.contract_clauses(contract_id, page_number);
create index if not exists versions_contract_idx on public.contract_versions(contract_id, version_date desc);
create index if not exists obligations_workspace_deadline_idx on public.obligations(workspace_id, deadline);
create index if not exists obligations_contract_idx on public.obligations(contract_id, status);
create index if not exists alerts_workspace_read_idx on public.alerts(workspace_id, is_read, created_at desc);
create index if not exists activities_workspace_created_idx on public.activities(workspace_id, created_at desc);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_settings enable row level security;
alter table public.contracts enable row level security;
alter table public.contract_clauses enable row level security;
alter table public.contract_versions enable row level security;
alter table public.obligations enable row level security;
alter table public.alerts enable row level security;
alter table public.activities enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['workspaces','workspace_members','workspace_settings','contracts','contract_clauses','contract_versions','obligations','alerts','activities'] loop
    execute format('drop policy if exists demo_select on public.%I', table_name);
    execute format('drop policy if exists demo_insert on public.%I', table_name);
    execute format('drop policy if exists demo_update on public.%I', table_name);
    execute format('drop policy if exists demo_delete on public.%I', table_name);
  end loop;
end $$;

create policy demo_select on public.workspaces for select using (id = public.demo_workspace_id());
create policy demo_insert on public.workspaces for insert with check (id = public.demo_workspace_id());
create policy demo_update on public.workspaces for update using (id = public.demo_workspace_id()) with check (id = public.demo_workspace_id());
create policy demo_delete on public.workspaces for delete using (id = public.demo_workspace_id());

create policy demo_select on public.workspace_members for select using (workspace_id = public.demo_workspace_id());
create policy demo_insert on public.workspace_members for insert with check (workspace_id = public.demo_workspace_id());
create policy demo_update on public.workspace_members for update using (workspace_id = public.demo_workspace_id()) with check (workspace_id = public.demo_workspace_id());
create policy demo_delete on public.workspace_members for delete using (workspace_id = public.demo_workspace_id());

create policy demo_select on public.workspace_settings for select using (workspace_id = public.demo_workspace_id());
create policy demo_insert on public.workspace_settings for insert with check (workspace_id = public.demo_workspace_id());
create policy demo_update on public.workspace_settings for update using (workspace_id = public.demo_workspace_id()) with check (workspace_id = public.demo_workspace_id());
create policy demo_delete on public.workspace_settings for delete using (workspace_id = public.demo_workspace_id());

create policy demo_select on public.contracts for select using (workspace_id = public.demo_workspace_id());
create policy demo_insert on public.contracts for insert with check (workspace_id = public.demo_workspace_id());
create policy demo_update on public.contracts for update using (workspace_id = public.demo_workspace_id()) with check (workspace_id = public.demo_workspace_id());
create policy demo_delete on public.contracts for delete using (workspace_id = public.demo_workspace_id());

create policy demo_select on public.contract_clauses for select using (exists (select 1 from public.contracts c where c.id = contract_id and c.workspace_id = public.demo_workspace_id()));
create policy demo_insert on public.contract_clauses for insert with check (exists (select 1 from public.contracts c where c.id = contract_id and c.workspace_id = public.demo_workspace_id()));
create policy demo_update on public.contract_clauses for update using (exists (select 1 from public.contracts c where c.id = contract_id and c.workspace_id = public.demo_workspace_id())) with check (exists (select 1 from public.contracts c where c.id = contract_id and c.workspace_id = public.demo_workspace_id()));
create policy demo_delete on public.contract_clauses for delete using (exists (select 1 from public.contracts c where c.id = contract_id and c.workspace_id = public.demo_workspace_id()));

create policy demo_select on public.contract_versions for select using (exists (select 1 from public.contracts c where c.id = contract_id and c.workspace_id = public.demo_workspace_id()));
create policy demo_insert on public.contract_versions for insert with check (exists (select 1 from public.contracts c where c.id = contract_id and c.workspace_id = public.demo_workspace_id()));
create policy demo_update on public.contract_versions for update using (exists (select 1 from public.contracts c where c.id = contract_id and c.workspace_id = public.demo_workspace_id())) with check (exists (select 1 from public.contracts c where c.id = contract_id and c.workspace_id = public.demo_workspace_id()));
create policy demo_delete on public.contract_versions for delete using (exists (select 1 from public.contracts c where c.id = contract_id and c.workspace_id = public.demo_workspace_id()));

create policy demo_select on public.obligations for select using (workspace_id = public.demo_workspace_id());
create policy demo_insert on public.obligations for insert with check (workspace_id = public.demo_workspace_id());
create policy demo_update on public.obligations for update using (workspace_id = public.demo_workspace_id()) with check (workspace_id = public.demo_workspace_id());
create policy demo_delete on public.obligations for delete using (workspace_id = public.demo_workspace_id());

create policy demo_select on public.alerts for select using (workspace_id = public.demo_workspace_id());
create policy demo_insert on public.alerts for insert with check (workspace_id = public.demo_workspace_id());
create policy demo_update on public.alerts for update using (workspace_id = public.demo_workspace_id()) with check (workspace_id = public.demo_workspace_id());
create policy demo_delete on public.alerts for delete using (workspace_id = public.demo_workspace_id());

create policy demo_select on public.activities for select using (workspace_id = public.demo_workspace_id());
create policy demo_insert on public.activities for insert with check (workspace_id = public.demo_workspace_id());
create policy demo_update on public.activities for update using (workspace_id = public.demo_workspace_id()) with check (workspace_id = public.demo_workspace_id());
create policy demo_delete on public.activities for delete using (workspace_id = public.demo_workspace_id());

insert into public.workspaces (id, name, plan)
values (public.demo_workspace_id(), 'Your company', 'hackathon')
on conflict (id) do nothing;

insert into public.workspace_members (workspace_id, name, email, role, team, initials)
select public.demo_workspace_id(), 'Avery Singh', 'avery@yourcompany.com', 'admin', 'Operations team', 'AS'
where not exists (select 1 from public.workspace_members where workspace_id = public.demo_workspace_id());

insert into public.workspace_settings (workspace_id)
values (public.demo_workspace_id())
on conflict (workspace_id) do nothing;

with seeded_contracts (id, name, contract_type, parties, status, risk, expiration_date, renewal_date, icon, color_class) as (
  values
    ('10000000-0000-0000-0000-000000000001'::uuid, 'Acme Cloud Services Agreement', 'Vendor agreement', 'Acme Inc. · Your company', 'Active', 'Medium', '2026-12-31'::date, '2026-11-30'::date, 'AC', 'bg-[#dff7ef] text-[#0d775f]'),
    ('10000000-0000-0000-0000-000000000002'::uuid, 'Northstar Logistics MSA', 'Master service agreement', 'Northstar · Your company', 'Renewal soon', 'High', '2024-12-14'::date, '2024-11-02'::date, 'NL', 'bg-[#e5edff] text-[#415cb8]'),
    ('10000000-0000-0000-0000-000000000003'::uuid, 'Orbit Analytics DPA', 'Data processing addendum', 'Orbit Analytics · Your company', 'Active', 'Low', '2026-06-30'::date, '2026-05-31'::date, 'OA', 'bg-[#f2e7ff] text-[#8754bd]'),
    ('10000000-0000-0000-0000-000000000004'::uuid, 'Mosaic Studio SOW #03', 'Statement of work', 'Mosaic Studio · Your company', 'Processing', 'Pending', '2025-03-31'::date, '2025-03-01'::date, 'MS', 'bg-[#fff0d9] text-[#a56a19]')
)
insert into public.contracts (id, workspace_id, name, contract_type, parties, status, risk, expiration_date, renewal_date, icon, color_class)
select id, public.demo_workspace_id(), name, contract_type, parties, status, risk, expiration_date, renewal_date, icon, color_class from seeded_contracts
on conflict (id) do nothing;

insert into public.contract_clauses (contract_id, clause_number, title, category, risk, page_number, source_text, human_review_required)
select c.id, data.clause_number, data.title, data.category, data.risk, data.page_number, data.source_text, data.human_review_required
from public.contracts c
cross join lateral (values
  ('2.1', 'Term and expiration', 'Renewal', 'Low', 3, 'This Agreement commences on January 1, 2024 and continues until December 31, 2026, unless earlier terminated in accordance with Section 8.', false),
  ('4.2', 'Payment terms', 'Payment', 'Low', 5, 'Customer shall pay all undisputed invoices within thirty (30) days of receipt. Late amounts may accrue interest at one percent per month.', false),
  ('7.4', 'Service levels', 'SLA', 'Medium', 8, 'Vendor will provide a quarterly security questionnaire and maintain commercially reasonable safeguards for the services.', false),
  ('8.2', 'Termination for convenience', 'Termination', 'High', 10, 'Either party may terminate for convenience upon written notice where a material business reason exists, as determined by the notifying party.', true),
  ('11.1', 'Limitation of liability', 'Liability', 'High', 13, 'Except for excluded claims, each party''s aggregate liability shall not exceed fees paid during the twelve months preceding the event giving rise to the claim.', true)
) as data(clause_number, title, category, risk, page_number, source_text, human_review_required)
where c.id = '10000000-0000-0000-0000-000000000001'::uuid
and not exists (select 1 from public.contract_clauses cc where cc.contract_id = c.id);

insert into public.contract_versions (contract_id, version_label, version_date, is_current)
select c.id, version.version_label, version.version_date, version.is_current
from public.contracts c
cross join lateral (values
  ('Version 3 · Current', current_date, true),
  ('Version 2 · Oct 03, 2024', '2024-10-03'::date, false),
  ('Version 1 · Jan 01, 2024', '2024-01-01'::date, false)
) as version(version_label, version_date, is_current)
where c.id = '10000000-0000-0000-0000-000000000001'::uuid
and not exists (select 1 from public.contract_versions cv where cv.contract_id = c.id);

insert into public.obligations (id, workspace_id, contract_id, party, title, deadline, frequency, priority, status, source_reference)
values
  ('20000000-0000-0000-0000-000000000001', public.demo_workspace_id(), '10000000-0000-0000-0000-000000000001', 'Vendor', 'Submit quarterly security questionnaire', '2024-10-24', 'Quarterly', 'High', 'Pending', 'Section 7.4 · Page 8'),
  ('20000000-0000-0000-0000-000000000002', public.demo_workspace_id(), '10000000-0000-0000-0000-000000000002', 'Customer', 'Send non-renewal notice', '2024-11-02', 'One-time', 'High', 'Pending', 'Section 12.1 · Page 14'),
  ('20000000-0000-0000-0000-000000000003', public.demo_workspace_id(), '10000000-0000-0000-0000-000000000003', 'Vendor', 'Deliver quarterly uptime report', '2024-11-14', 'Quarterly', 'Medium', 'Pending', 'Schedule B · Page 4'),
  ('20000000-0000-0000-0000-000000000004', public.demo_workspace_id(), '10000000-0000-0000-0000-000000000001', 'Customer', 'Make platform subscription payment', '2024-11-30', 'Monthly', 'Medium', 'Pending', 'Section 4.2 · Page 5'),
  ('20000000-0000-0000-0000-000000000005', public.demo_workspace_id(), '10000000-0000-0000-0000-000000000003', 'Your company', 'Delete personal data after termination', '2026-06-30', 'One-time', 'Low', 'Completed', 'Section 9 · Page 7')
on conflict (id) do nothing;

insert into public.alerts (id, workspace_id, contract_id, alert_type, title, detail)
values
  ('30000000-0000-0000-0000-000000000001', public.demo_workspace_id(), '10000000-0000-0000-0000-000000000003', 'Overdue', 'Vendor SLA report was due yesterday', 'Orbit Analytics DPA · Assigned to Finance'),
  ('30000000-0000-0000-0000-000000000002', public.demo_workspace_id(), '10000000-0000-0000-0000-000000000002', 'Upcoming', 'Renewal notice required in 12 days', 'Northstar Logistics MSA · Nov 02, 2024'),
  ('30000000-0000-0000-0000-000000000003', public.demo_workspace_id(), '10000000-0000-0000-0000-000000000001', 'Review', 'Automatic renewal clause needs review', 'Acme Cloud Services Agreement · Section 8.2')
on conflict (id) do nothing;

insert into public.activities (workspace_id, contract_id, action, detail, icon, created_at)
select public.demo_workspace_id(), c.id, activity.action, activity.detail, activity.icon, activity.created_at
from public.contracts c
cross join lateral (values
  ('AI summary generated', 'Acme Cloud Services Agreement', 'spark', now() - interval '20 minutes'),
  ('Obligation created', 'Quarterly security questionnaire', 'check', now() - interval '21 minutes'),
  ('Version compared', 'Northstar Logistics MSA', 'compare', now() - interval '1 day'),
  ('Source viewed', 'Orbit Analytics DPA · Page 7', 'source', now() - interval '1 day' - interval '2 hours')
) as activity(action, detail, icon, created_at)
where c.id = '10000000-0000-0000-0000-000000000001'::uuid
and not exists (select 1 from public.activities a where a.workspace_id = public.demo_workspace_id());
