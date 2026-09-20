create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  contract_type text not null,
  parties text not null,
  status text not null check (status in ('Active', 'Renewal soon', 'Processing')),
  risk text not null check (risk in ('Low', 'Medium', 'High', 'Pending')),
  effective_date date,
  expiration_date date,
  renewal_date date,
  icon text not null default 'CL',
  color_class text not null default 'bg-[#e8efff] text-[#526ec4]',
  updated_at timestamptz not null default now(),
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
  priority text not null check (priority in ('High', 'Medium', 'Low')),
  status text not null check (status in ('Pending', 'Completed', 'Overdue')),
  source_reference text not null default '',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  alert_type text not null check (alert_type in ('Overdue', 'Upcoming', 'Review')),
  title text not null,
  detail text not null,
  is_read boolean not null default false,
  dismissed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.contract_clauses (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  clause_number text not null,
  title text not null,
  category text not null,
  risk text not null check (risk in ('Low', 'Medium', 'High')),
  page_number integer,
  source_text text not null,
  human_review_required boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.contract_versions (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  version_label text not null,
  version_date date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  action text not null,
  detail text not null,
  icon text not null default 'activity',
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null,
  team text not null,
  initials text not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, email)
);

create table if not exists public.workspace_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  notification_days integer[] not null default '{7,14,30}',
  organization text not null default '',
  ai_summary_style text not null default 'Plain-language summaries',
  created_at timestamptz not null default now()
);

create table if not exists public.homepage_settings (
  id text primary key default 'default',
  brand_name text not null,
  brand_tagline text not null,
  footer_text text not null,
  hero_eyebrow text not null,
  hero_title text not null,
  hero_description text not null,
  hero_primary_label text not null,
  hero_primary_href text not null,
  hero_secondary_label text not null,
  hero_secondary_href text not null,
  hero_proof_one text not null,
  hero_proof_two text not null,
  features_eyebrow text not null,
  features_title text not null,
  features_description text not null,
  workflow_eyebrow text not null,
  workflow_title text not null,
  workflow_description text not null,
  security_eyebrow text not null,
  security_title text not null,
  security_description text not null,
  security_cta_label text not null,
  security_cta_href text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_nav_items (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('nav', 'secondary_action', 'primary_action', 'mobile_action')),
  label text not null,
  href text not null,
  sort_order integer not null default 0,
  enabled boolean not null default true
);

create table if not exists public.homepage_features (
  id uuid primary key default gen_random_uuid(),
  icon_name text not null,
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  enabled boolean not null default true
);

create table if not exists public.homepage_workflow_steps (
  id uuid primary key default gen_random_uuid(),
  step_number text not null,
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  enabled boolean not null default true
);

create table if not exists public.homepage_preview (
  id text primary key default 'default',
  contract_name text not null,
  contract_status text not null,
  renewal_label text not null,
  renewal_value text not null,
  renewal_detail text not null,
  obligations_label text not null,
  obligations_value text not null,
  obligations_detail text not null,
  review_label text not null,
  review_value text not null,
  review_detail text not null,
  timeline_title text not null,
  timeline_action_label text not null,
  ask_label text not null,
  change_label text not null,
  change_detail text not null
);

create table if not exists public.homepage_preview_events (
  id uuid primary key default gen_random_uuid(),
  preview_id text not null references public.homepage_preview(id) on delete cascade,
  event_date text not null,
  event_title text not null,
  event_type text not null,
  sort_order integer not null default 0,
  enabled boolean not null default true
);

create table if not exists public.homepage_footer_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text,
  sort_order integer not null default 0,
  enabled boolean not null default true
);

insert into public.workspaces (id, name)
values ('00000000-0000-0000-0000-000000000001', 'ContractLens Demo Workspace')
on conflict (id) do update set name = excluded.name;

insert into public.homepage_settings (
  id, brand_name, brand_tagline, footer_text, hero_eyebrow, hero_title, hero_description,
  hero_primary_label, hero_primary_href, hero_secondary_label, hero_secondary_href,
  hero_proof_one, hero_proof_two, features_eyebrow, features_title, features_description,
  workflow_eyebrow, workflow_title, workflow_description, security_eyebrow, security_title,
  security_description, security_cta_label, security_cta_href
) values (
  'default', 'contractlens', 'contract intelligence', '© 2026 ContractLens AI',
  'Built for business teams', 'Understand contracts.\nTrack obligations.\nNever miss a deadline.',
  'ContractLens turns dense agreements into clear, actionable intelligence — so operations teams can move faster without losing the source of truth.',
  'Get started free', '/login?mode=signup', 'View demo workspace', '/dashboard',
  'No legal advice claims', 'Traceable to source', 'One clear view of your agreements',
  'From document to decision.', 'ContractLens makes the work between “where is that clause?” and “what do we do next?” simple.',
  'How it works', 'Clarity you can verify.', 'Every extracted fact, deadline, risk, and answer stays linked to the language that supports it.',
  'Built for trust', 'Move quickly without losing the audit trail.',
  'ContractLens supports business teams with explainable intelligence. It reduces review effort — it never replaces legal judgment.',
  'Start with ContractLens', '/login?mode=signup'
)
on conflict (id) do update set
  brand_name = excluded.brand_name,
  brand_tagline = excluded.brand_tagline,
  footer_text = excluded.footer_text,
  hero_eyebrow = excluded.hero_eyebrow,
  hero_title = excluded.hero_title,
  hero_description = excluded.hero_description,
  hero_primary_label = excluded.hero_primary_label,
  hero_primary_href = excluded.hero_primary_href,
  hero_secondary_label = excluded.hero_secondary_label,
  hero_secondary_href = excluded.hero_secondary_href,
  hero_proof_one = excluded.hero_proof_one,
  hero_proof_two = excluded.hero_proof_two,
  features_eyebrow = excluded.features_eyebrow,
  features_title = excluded.features_title,
  features_description = excluded.features_description,
  workflow_eyebrow = excluded.workflow_eyebrow,
  workflow_title = excluded.workflow_title,
  workflow_description = excluded.workflow_description,
  security_eyebrow = excluded.security_eyebrow,
  security_title = excluded.security_title,
  security_description = excluded.security_description,
  security_cta_label = excluded.security_cta_label,
  security_cta_href = excluded.security_cta_href,
  updated_at = now();

insert into public.homepage_nav_items (id, item_type, label, href, sort_order)
values
  ('10000000-0000-0000-0000-000000000001', 'nav', 'Features', '#features', 1),
  ('10000000-0000-0000-0000-000000000002', 'nav', 'How it works', '#how-it-works', 2),
  ('10000000-0000-0000-0000-000000000003', 'nav', 'Security', '#security', 3),
  ('10000000-0000-0000-0000-000000000004', 'secondary_action', 'Log in', '/login', 1),
  ('10000000-0000-0000-0000-000000000005', 'primary_action', 'Get started', '/login?mode=signup', 2),
  ('10000000-0000-0000-0000-000000000006', 'mobile_action', 'Get started', '/login?mode=signup', 1)
on conflict (id) do update set
  item_type = excluded.item_type, label = excluded.label, href = excluded.href,
  sort_order = excluded.sort_order, enabled = excluded.enabled;

insert into public.homepage_features (id, icon_name, title, description, sort_order)
values
  ('11000000-0000-0000-0000-000000000001', 'FileText', 'See the facts clearly', 'Pull parties, dates, payment terms, renewals, and termination conditions from every agreement.', 1),
  ('11000000-0000-0000-0000-000000000002', 'Zap', 'Stay ahead of obligations', 'Turn contract language into a living timeline with owners, deadlines, and proactive alerts.', 2),
  ('11000000-0000-0000-0000-000000000003', 'ShieldCheck', 'Know what needs review', 'Surface ambiguity, material changes, and risk without pretending to replace legal judgment.', 3),
  ('11000000-0000-0000-0000-000000000004', 'MessageSquareText', 'Ask with confidence', 'Get business-friendly answers grounded in the exact clause, page, and source text.', 4)
on conflict (id) do update set
  icon_name = excluded.icon_name, title = excluded.title, description = excluded.description,
  sort_order = excluded.sort_order, enabled = excluded.enabled;

insert into public.homepage_workflow_steps (id, step_number, title, description, sort_order)
values
  ('12000000-0000-0000-0000-000000000001', '01', 'Upload', 'Drop in a PDF or DOCX. ContractLens preserves pages, sections, and clause boundaries.', 1),
  ('12000000-0000-0000-0000-000000000002', '02', 'Understand', 'AI extracts facts, obligations, deadlines, changes, and potential risks into structured data.', 2),
  ('12000000-0000-0000-0000-000000000003', '03', 'Act', 'Share clear summaries, assign owners, ask questions, and stay ahead of what comes next.', 3)
on conflict (id) do update set
  step_number = excluded.step_number, title = excluded.title, description = excluded.description,
  sort_order = excluded.sort_order, enabled = excluded.enabled;

insert into public.homepage_preview (
  id, contract_name, contract_status, renewal_label, renewal_value, renewal_detail,
  obligations_label, obligations_value, obligations_detail, review_label, review_value,
  review_detail, timeline_title, timeline_action_label, ask_label, change_label, change_detail
) values (
  'default', 'Acme Cloud Services', 'Active', 'Renewal', '12d', 'Nov 02, 2024',
  'Obligations', '06', '2 due soon', 'Review', '02', 'Needs attention',
  'Upcoming timeline', 'View all', 'Ask about this contract', 'Material change detected', 'Termination notice · Section 8.2'
)
on conflict (id) do update set
  contract_name = excluded.contract_name, contract_status = excluded.contract_status,
  renewal_label = excluded.renewal_label, renewal_value = excluded.renewal_value,
  renewal_detail = excluded.renewal_detail, obligations_label = excluded.obligations_label,
  obligations_value = excluded.obligations_value, obligations_detail = excluded.obligations_detail,
  review_label = excluded.review_label, review_value = excluded.review_value,
  review_detail = excluded.review_detail, timeline_title = excluded.timeline_title,
  timeline_action_label = excluded.timeline_action_label, ask_label = excluded.ask_label,
  change_label = excluded.change_label, change_detail = excluded.change_detail;

insert into public.homepage_preview_events (id, preview_id, event_date, event_title, event_type, sort_order)
values
  ('13000000-0000-0000-0000-000000000001', 'default', 'OCT 24', 'Security questionnaire', 'Obligation', 1),
  ('13000000-0000-0000-0000-000000000002', 'default', 'NOV 02', 'Auto-renewal window', 'Renewal', 2),
  ('13000000-0000-0000-0000-000000000003', 'default', 'NOV 14', 'Quarterly uptime report', 'Obligation', 3)
on conflict (id) do update set
  preview_id = excluded.preview_id, event_date = excluded.event_date, event_title = excluded.event_title,
  event_type = excluded.event_type, sort_order = excluded.sort_order, enabled = excluded.enabled;

insert into public.homepage_footer_items (id, label, href, sort_order)
values
  ('14000000-0000-0000-0000-000000000001', 'Log in', '/login', 1),
  ('14000000-0000-0000-0000-000000000002', 'Privacy', null, 2),
  ('14000000-0000-0000-0000-000000000003', 'Built for better decisions', null, 3)
on conflict (id) do update set
  label = excluded.label, href = excluded.href, sort_order = excluded.sort_order, enabled = excluded.enabled;

insert into public.contracts (id, workspace_id, name, contract_type, parties, status, risk, effective_date, expiration_date, renewal_date, icon, color_class)
values (
  '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
  'Acme Cloud Services', 'Cloud services agreement', 'Acme Cloud · Your company', 'Active', 'Medium',
  '2024-01-01', '2026-12-31', '2026-11-02', 'AC', 'bg-[#e5f8f1] text-[#3d927b]'
)
on conflict (id) do update set
  name = excluded.name, contract_type = excluded.contract_type, parties = excluded.parties,
  status = excluded.status, risk = excluded.risk, effective_date = excluded.effective_date,
  expiration_date = excluded.expiration_date, renewal_date = excluded.renewal_date,
  icon = excluded.icon, color_class = excluded.color_class, updated_at = now();

insert into public.obligations (id, workspace_id, contract_id, party, title, deadline, frequency, priority, status, source_reference)
values
  ('21000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Your company', 'Complete security questionnaire', '2024-10-24', 'Annual', 'High', 'Pending', 'Section 7.4 · Page 9'),
  ('21000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Acme Cloud', 'Review auto-renewal window', '2024-11-02', 'Annual', 'Medium', 'Pending', 'Section 12.1 · Page 14'),
  ('21000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Acme Cloud', 'Send quarterly uptime report', '2024-11-14', 'Quarterly', 'Low', 'Pending', 'Section 9.3 · Page 11')
on conflict (id) do update set
  party = excluded.party, title = excluded.title, deadline = excluded.deadline,
  frequency = excluded.frequency, priority = excluded.priority, status = excluded.status,
  source_reference = excluded.source_reference;

insert into public.alerts (id, workspace_id, contract_id, alert_type, title, detail)
values
  ('22000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Upcoming', 'Auto-renewal window approaching', 'Notice is due in 12 days.'),
  ('22000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Review', 'Termination language needs review', 'The material business reason threshold is undefined.')
on conflict (id) do update set
  alert_type = excluded.alert_type, title = excluded.title, detail = excluded.detail;

insert into public.contract_clauses (id, contract_id, clause_number, title, category, risk, page_number, source_text, human_review_required)
values
  ('23000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '7.4', 'Payment terms', 'Payment', 'Low', 9, 'Customer payments are due within thirty days of receiving an undisputed invoice.', false),
  ('23000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '8.2', 'Termination for convenience', 'Termination', 'High', 10, 'Either party may terminate for convenience with written notice where a material business reason exists.', true),
  ('23000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '12.1', 'Automatic renewal', 'Renewal', 'High', 14, 'The agreement automatically renews unless notice is provided 30 days before expiration.', true)
on conflict (id) do update set
  title = excluded.title, category = excluded.category, risk = excluded.risk, page_number = excluded.page_number,
  source_text = excluded.source_text, human_review_required = excluded.human_review_required;

insert into public.contract_versions (id, contract_id, version_label, version_date, is_current)
values
  ('24000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Version 3', '2024-10-20', true),
  ('24000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Version 2', '2024-10-03', false),
  ('24000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Version 1', '2024-01-01', false)
on conflict (id) do update set
  version_label = excluded.version_label, version_date = excluded.version_date, is_current = excluded.is_current;

insert into public.activities (id, workspace_id, action, detail, icon)
values
  ('25000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Contract uploaded', 'Acme Cloud Services was added to the workspace.', 'upload'),
  ('25000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Summary generated', 'Key facts and obligations are ready to review.', 'sparkles'),
  ('25000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Risk identified', 'Termination language has been flagged for review.', 'alert')
on conflict (id) do update set
  action = excluded.action, detail = excluded.detail, icon = excluded.icon;

insert into public.workspace_members (id, workspace_id, name, email, role, team, initials)
values ('26000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Avery Singh', 'avery@yourcompany.com', 'Workspace admin', 'Operations', 'AS')
on conflict (id) do update set
  name = excluded.name, email = excluded.email, role = excluded.role, team = excluded.team, initials = excluded.initials;

insert into public.workspace_settings (id, workspace_id, notification_days, organization, ai_summary_style)
values ('27000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '{7,14,30}', 'Your company', 'Plain-language summaries')
on conflict (workspace_id) do update set
  notification_days = excluded.notification_days, organization = excluded.organization, ai_summary_style = excluded.ai_summary_style;

alter table public.homepage_settings enable row level security;
alter table public.homepage_nav_items enable row level security;
alter table public.homepage_features enable row level security;
alter table public.homepage_workflow_steps enable row level security;
alter table public.homepage_preview enable row level security;
alter table public.homepage_preview_events enable row level security;
alter table public.homepage_footer_items enable row level security;
alter table public.workspaces enable row level security;
alter table public.contracts enable row level security;
alter table public.obligations enable row level security;
alter table public.alerts enable row level security;
alter table public.contract_clauses enable row level security;
alter table public.contract_versions enable row level security;
alter table public.activities enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_settings enable row level security;

drop policy if exists homepage_settings_read on public.homepage_settings;
create policy homepage_settings_read on public.homepage_settings for select to anon, authenticated using (true);
drop policy if exists homepage_nav_items_read on public.homepage_nav_items;
create policy homepage_nav_items_read on public.homepage_nav_items for select to anon, authenticated using (enabled);
drop policy if exists homepage_features_read on public.homepage_features;
create policy homepage_features_read on public.homepage_features for select to anon, authenticated using (enabled);
drop policy if exists homepage_workflow_steps_read on public.homepage_workflow_steps;
create policy homepage_workflow_steps_read on public.homepage_workflow_steps for select to anon, authenticated using (enabled);
drop policy if exists homepage_preview_read on public.homepage_preview;
create policy homepage_preview_read on public.homepage_preview for select to anon, authenticated using (true);
drop policy if exists homepage_preview_events_read on public.homepage_preview_events;
create policy homepage_preview_events_read on public.homepage_preview_events for select to anon, authenticated using (enabled);
drop policy if exists homepage_footer_items_read on public.homepage_footer_items;
create policy homepage_footer_items_read on public.homepage_footer_items for select to anon, authenticated using (enabled);

drop policy if exists workspaces_read on public.workspaces;
create policy workspaces_read on public.workspaces for select to anon, authenticated using (id = '00000000-0000-0000-0000-000000000001');
drop policy if exists contracts_read on public.contracts;
create policy contracts_read on public.contracts for select to anon, authenticated using (workspace_id = '00000000-0000-0000-0000-000000000001');
drop policy if exists contracts_insert on public.contracts;
create policy contracts_insert on public.contracts for insert to anon, authenticated with check (workspace_id = '00000000-0000-0000-0000-000000000001');
drop policy if exists contracts_update on public.contracts;
create policy contracts_update on public.contracts for update to anon, authenticated using (workspace_id = '00000000-0000-0000-0000-000000000001') with check (workspace_id = '00000000-0000-0000-0000-000000000001');
drop policy if exists obligations_read on public.obligations;
create policy obligations_read on public.obligations for select to anon, authenticated using (workspace_id = '00000000-0000-0000-0000-000000000001');
drop policy if exists obligations_update on public.obligations;
create policy obligations_update on public.obligations for update to anon, authenticated using (workspace_id = '00000000-0000-0000-0000-000000000001') with check (workspace_id = '00000000-0000-0000-0000-000000000001');
drop policy if exists alerts_read on public.alerts;
create policy alerts_read on public.alerts for select to anon, authenticated using (workspace_id = '00000000-0000-0000-0000-000000000001');
drop policy if exists alerts_update on public.alerts;
create policy alerts_update on public.alerts for update to anon, authenticated using (workspace_id = '00000000-0000-0000-0000-000000000001') with check (workspace_id = '00000000-0000-0000-0000-000000000001');
drop policy if exists clauses_read on public.contract_clauses;
create policy clauses_read on public.contract_clauses for select to anon, authenticated using (exists (select 1 from public.contracts where contracts.id = contract_clauses.contract_id and contracts.workspace_id = '00000000-0000-0000-0000-000000000001'));
drop policy if exists versions_read on public.contract_versions;
create policy versions_read on public.contract_versions for select to anon, authenticated using (exists (select 1 from public.contracts where contracts.id = contract_versions.contract_id and contracts.workspace_id = '00000000-0000-0000-0000-000000000001'));
drop policy if exists activities_read on public.activities;
create policy activities_read on public.activities for select to anon, authenticated using (workspace_id = '00000000-0000-0000-0000-000000000001');
drop policy if exists members_read on public.workspace_members;
create policy members_read on public.workspace_members for select to anon, authenticated using (workspace_id = '00000000-0000-0000-0000-000000000001');
drop policy if exists settings_read on public.workspace_settings;
create policy settings_read on public.workspace_settings for select to anon, authenticated using (workspace_id = '00000000-0000-0000-0000-000000000001');
drop policy if exists settings_update on public.workspace_settings;
create policy settings_update on public.workspace_settings for update to anon, authenticated using (workspace_id = '00000000-0000-0000-0000-000000000001') with check (workspace_id = '00000000-0000-0000-0000-000000000001');
