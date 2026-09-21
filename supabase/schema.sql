create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
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

create table if not exists public.contract_documents (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null default 'application/pdf',
  file_size bigint not null,
  page_count integer,
  processing_status text not null check (processing_status in ('UPLOADING', 'EXTRACTING', 'ANALYZING', 'SAVING', 'COMPLETED', 'FAILED')),
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.contract_extractions (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  document_id uuid not null unique references public.contract_documents(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  user_id uuid references auth.users(id) on delete cascade,
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

alter table public.workspaces add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.workspace_members add column if not exists user_id uuid references auth.users(id) on delete cascade;
create unique index if not exists workspaces_owner_id_key on public.workspaces(owner_id) where owner_id is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_workspace_id uuid;
  display_name text := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
begin
  insert into public.workspaces (owner_id, name)
  values (new.id, display_name || '''s workspace')
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, name, email, role, team, initials)
  values (new_workspace_id, new.id, display_name, new.email, 'Workspace admin', 'Operations', upper(left(display_name, 2)));

  insert into public.workspace_settings (workspace_id, organization)
  values (new_workspace_id, display_name || '''s organization');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.workspaces (owner_id, name)
select u.id, coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) || '''s workspace'
from auth.users u
left join public.workspaces w on w.owner_id = u.id
where w.id is null;

insert into public.workspace_members (workspace_id, user_id, name, email, role, team, initials)
select w.id, u.id, coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)), u.email, 'Workspace admin', 'Operations', upper(left(coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)), 2))
from public.workspaces w
join auth.users u on u.id = w.owner_id
on conflict (workspace_id, email) do update set user_id = excluded.user_id, name = excluded.name, initials = excluded.initials;

insert into public.workspace_settings (workspace_id, organization)
select w.id, coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) || '''s organization'
from public.workspaces w
join auth.users u on u.id = w.owner_id
on conflict (workspace_id) do nothing;

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

create table if not exists public.workspace_shell_content (
  id text primary key default 'default',
  brand_name text not null,
  brand_tagline text not null,
  workspace_label text not null,
  manage_label text not null,
  cta_title text not null,
  cta_description text not null,
  cta_link_label text not null,
  cta_link text not null,
  search_placeholder text not null,
  shortcut_label text not null,
  sign_out_label text not null,
  settings_label text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_navigation (
  id text primary key,
  label text not null,
  path text not null,
  icon_name text not null,
  section text not null check (section in ('workspace', 'manage')),
  sort_order integer not null default 0,
  enabled boolean not null default true
);

create table if not exists public.dashboard_content (
  id text primary key default 'default',
  eyebrow text not null,
  title_template text not null,
  description text not null,
  upload_label text not null,
  deadlines_title text not null,
  deadlines_description text not null,
  renewals_title text not null,
  renewals_description text not null,
  contracts_title text not null,
  contracts_description text not null,
  status_title text not null,
  obligation_status_title text not null,
  activity_title text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.dashboard_metrics (
  id text primary key,
  label text not null,
  detail text not null,
  metric_key text not null,
  icon_name text not null,
  tone text not null check (tone in ('mint', 'blue', 'peach', 'lilac')),
  sort_order integer not null default 0,
  enabled boolean not null default true
);

create table if not exists public.auth_page_content (
  id text primary key default 'default',
  brand_name text not null,
  brand_tagline text not null,
  eyebrow text not null,
  title text not null,
  title_accent text not null,
  description text not null,
  login_eyebrow text not null,
  login_title text not null,
  login_description text not null,
  signup_eyebrow text not null,
  signup_title text not null,
  signup_description text not null,
  email_label text not null,
  email_placeholder text not null,
  password_label text not null,
  password_placeholder text not null,
  submit_login_label text not null,
  submit_signup_label text not null,
  switch_login_label text not null,
  switch_signup_label text not null,
  success_message text not null,
  benefit_one text not null,
  benefit_two text not null,
  benefit_three text not null,
  updated_at timestamptz not null default now()
);

insert into public.workspace_shell_content (id, brand_name, brand_tagline, workspace_label, manage_label, cta_title, cta_description, cta_link_label, cta_link, search_placeholder, shortcut_label, sign_out_label, settings_label)
values ('default', 'contractlens', 'contract intelligence', 'Workspace', 'Manage', 'Lens intelligence', 'Upload a document and trace every insight to its clause.', 'Upload a contract', '/contracts/upload', 'Search contracts...', '⌘ K', 'Sign out', 'Settings')
on conflict (id) do update set
  brand_name = excluded.brand_name, brand_tagline = excluded.brand_tagline,
  workspace_label = excluded.workspace_label, manage_label = excluded.manage_label, cta_title = excluded.cta_title,
  cta_description = excluded.cta_description, cta_link_label = excluded.cta_link_label, cta_link = excluded.cta_link,
  search_placeholder = excluded.search_placeholder, shortcut_label = excluded.shortcut_label,
  sign_out_label = excluded.sign_out_label, settings_label = excluded.settings_label, updated_at = now();

insert into public.workspace_navigation (id, label, path, icon_name, section, sort_order)
values
  ('dashboard', 'Dashboard', '/dashboard', 'LayoutDashboard', 'workspace', 1),
  ('contracts', 'Contracts', '/contracts', 'FileText', 'workspace', 2),
  ('obligations', 'Obligations', '/obligations', 'ListChecks', 'workspace', 3),
  ('alerts', 'Alerts', '/alerts', 'ShieldAlert', 'workspace', 4),
  ('settings', 'Settings', '/settings', 'Settings2', 'manage', 1)
on conflict (id) do update set
  label = excluded.label, path = excluded.path, icon_name = excluded.icon_name,
  section = excluded.section, sort_order = excluded.sort_order, enabled = excluded.enabled;

insert into public.dashboard_content (id, eyebrow, title_template, description, upload_label, deadlines_title, deadlines_description, renewals_title, renewals_description, contracts_title, contracts_description, status_title, obligation_status_title, activity_title)
values ('default', 'Workspace overview', 'Good morning, {name}', 'Your contracts, obligations, and review work at a glance.', 'Upload contract', 'Upcoming deadlines', 'The next actions across your active agreements', 'Upcoming renewals', 'Notice windows you should not miss', 'Recent contracts', 'Latest document activity', 'Contract status', 'Obligation status', 'Recent activity')
on conflict (id) do update set
  eyebrow = excluded.eyebrow, title_template = excluded.title_template, description = excluded.description,
  upload_label = excluded.upload_label, deadlines_title = excluded.deadlines_title, deadlines_description = excluded.deadlines_description,
  renewals_title = excluded.renewals_title, renewals_description = excluded.renewals_description,
  contracts_title = excluded.contracts_title, contracts_description = excluded.contracts_description,
  status_title = excluded.status_title, obligation_status_title = excluded.obligation_status_title,
  activity_title = excluded.activity_title, updated_at = now();

insert into public.dashboard_metrics (id, label, detail, metric_key, icon_name, tone, sort_order)
values
  ('total-contracts', 'Total contracts', 'Current workspace total', 'totalContracts', 'FolderOpen', 'mint', 1),
  ('active-contracts', 'Active contracts', 'Current portfolio share', 'activeContracts', 'CheckCircle2', 'blue', 2),
  ('expiring-contracts', 'Expiring soon', 'Next 90 days', 'expiringSoon', 'Clock3', 'lilac', 3),
  ('pending-obligations', 'Pending obligations', 'Needs action', 'pendingObligations', 'ListChecks', 'mint', 4),
  ('overdue-obligations', 'Overdue', 'Needs action', 'overdueObligations', 'AlertTriangle', 'peach', 5),
  ('review-items', 'Requires review', 'High-risk clauses', 'reviewItems', 'ShieldAlert', 'peach', 6)
on conflict (id) do update set
  label = excluded.label, detail = excluded.detail, metric_key = excluded.metric_key,
  icon_name = excluded.icon_name, tone = excluded.tone, sort_order = excluded.sort_order, enabled = excluded.enabled;

insert into public.auth_page_content (
  id, brand_name, brand_tagline, eyebrow, title, title_accent, description,
  login_eyebrow, login_title, login_description, signup_eyebrow, signup_title, signup_description,
  email_label, email_placeholder, password_label, password_placeholder,
  submit_login_label, submit_signup_label, switch_login_label, switch_signup_label,
  success_message, benefit_one, benefit_two, benefit_three
) values (
  'default', 'contractlens', 'contract intelligence', 'AI-powered clarity',
  'Contracts are complex.', 'Your work doesn''t have to be.',
  'A calmer way for business teams to understand commitments, spot risk, and keep every deadline in view.',
  'Welcome back', 'Good to see you again.', 'Pick up where your contract workspace left off.',
  'Create your workspace', 'Start seeing clearly.', 'Bring your contracts into focus in minutes.',
  'Work email', 'you@company.com', 'Password', 'Enter your password',
  'Log in', 'Create your workspace', 'Already have an account? Log in', 'New to ContractLens? Create an account',
  'Your workspace is ready. You can sign in now.',
  'No legal advice claims', 'Traceable to source language', 'Built for business teams'
)
on conflict (id) do update set
  brand_name = excluded.brand_name, brand_tagline = excluded.brand_tagline, eyebrow = excluded.eyebrow,
  title = excluded.title, title_accent = excluded.title_accent, description = excluded.description,
  login_eyebrow = excluded.login_eyebrow, login_title = excluded.login_title, login_description = excluded.login_description,
  signup_eyebrow = excluded.signup_eyebrow, signup_title = excluded.signup_title, signup_description = excluded.signup_description,
  email_label = excluded.email_label, email_placeholder = excluded.email_placeholder,
  password_label = excluded.password_label, password_placeholder = excluded.password_placeholder,
  submit_login_label = excluded.submit_login_label, submit_signup_label = excluded.submit_signup_label,
  switch_login_label = excluded.switch_login_label, switch_signup_label = excluded.switch_signup_label,
  success_message = excluded.success_message, benefit_one = excluded.benefit_one,
  benefit_two = excluded.benefit_two, benefit_three = excluded.benefit_three, updated_at = now();

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
  'Get started free', '/login?mode=signup', 'View your workspace', '/dashboard',
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

alter table public.homepage_settings enable row level security;
alter table public.homepage_nav_items enable row level security;
alter table public.homepage_features enable row level security;
alter table public.homepage_workflow_steps enable row level security;
alter table public.homepage_preview enable row level security;
alter table public.homepage_preview_events enable row level security;
alter table public.homepage_footer_items enable row level security;
alter table public.auth_page_content enable row level security;
alter table public.workspace_shell_content enable row level security;
alter table public.workspace_navigation enable row level security;
alter table public.dashboard_content enable row level security;
alter table public.dashboard_metrics enable row level security;
alter table public.workspaces enable row level security;
alter table public.contracts enable row level security;
alter table public.obligations enable row level security;
alter table public.alerts enable row level security;
alter table public.contract_clauses enable row level security;
alter table public.contract_documents enable row level security;
alter table public.contract_extractions enable row level security;
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
drop policy if exists auth_page_content_read on public.auth_page_content;
create policy auth_page_content_read on public.auth_page_content for select to anon, authenticated using (true);
drop policy if exists workspace_shell_content_read on public.workspace_shell_content;
create policy workspace_shell_content_read on public.workspace_shell_content for select to anon, authenticated using (true);
drop policy if exists workspace_navigation_read on public.workspace_navigation;
create policy workspace_navigation_read on public.workspace_navigation for select to anon, authenticated using (enabled);
drop policy if exists dashboard_content_read on public.dashboard_content;
create policy dashboard_content_read on public.dashboard_content for select to anon, authenticated using (true);
drop policy if exists dashboard_metrics_read on public.dashboard_metrics;
create policy dashboard_metrics_read on public.dashboard_metrics for select to anon, authenticated using (enabled);

create or replace function public.user_owns_workspace(workspace_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.workspaces where id = workspace_uuid and owner_id = auth.uid());
$$;

drop policy if exists workspaces_read on public.workspaces;
create policy workspaces_read on public.workspaces for select to authenticated using (owner_id = auth.uid());
drop policy if exists contracts_read on public.contracts;
create policy contracts_read on public.contracts for select to authenticated using (public.user_owns_workspace(workspace_id));
drop policy if exists contracts_insert on public.contracts;
create policy contracts_insert on public.contracts for insert to authenticated with check (public.user_owns_workspace(workspace_id));
drop policy if exists contracts_update on public.contracts;
create policy contracts_update on public.contracts for update to authenticated using (public.user_owns_workspace(workspace_id)) with check (public.user_owns_workspace(workspace_id));
drop policy if exists contracts_delete on public.contracts;
create policy contracts_delete on public.contracts for delete to authenticated using (public.user_owns_workspace(workspace_id));
drop policy if exists obligations_read on public.obligations;
create policy obligations_read on public.obligations for select to authenticated using (public.user_owns_workspace(workspace_id));
drop policy if exists obligations_update on public.obligations;
create policy obligations_update on public.obligations for update to authenticated using (public.user_owns_workspace(workspace_id)) with check (public.user_owns_workspace(workspace_id));
drop policy if exists alerts_read on public.alerts;
create policy alerts_read on public.alerts for select to authenticated using (public.user_owns_workspace(workspace_id));
drop policy if exists alerts_update on public.alerts;
create policy alerts_update on public.alerts for update to authenticated using (public.user_owns_workspace(workspace_id)) with check (public.user_owns_workspace(workspace_id));
drop policy if exists clauses_read on public.contract_clauses;
create policy clauses_read on public.contract_clauses for select to authenticated using (exists (select 1 from public.contracts where contracts.id = contract_clauses.contract_id and public.user_owns_workspace(contracts.workspace_id)));
drop policy if exists clauses_insert on public.contract_clauses;
create policy clauses_insert on public.contract_clauses for insert to authenticated with check (exists (select 1 from public.contracts where contracts.id = contract_clauses.contract_id and public.user_owns_workspace(contracts.workspace_id)));
drop policy if exists clauses_delete on public.contract_clauses;
create policy clauses_delete on public.contract_clauses for delete to authenticated using (exists (select 1 from public.contracts where contracts.id = contract_clauses.contract_id and public.user_owns_workspace(contracts.workspace_id)));
drop policy if exists documents_read on public.contract_documents;
create policy documents_read on public.contract_documents for select to authenticated using (public.user_owns_workspace(workspace_id));
drop policy if exists documents_insert on public.contract_documents;
create policy documents_insert on public.contract_documents for insert to authenticated with check (user_id = auth.uid() and public.user_owns_workspace(workspace_id));
drop policy if exists documents_update on public.contract_documents;
create policy documents_update on public.contract_documents for update to authenticated using (public.user_owns_workspace(workspace_id)) with check (public.user_owns_workspace(workspace_id));
drop policy if exists extractions_read on public.contract_extractions;
create policy extractions_read on public.contract_extractions for select to authenticated using (public.user_owns_workspace(workspace_id));
drop policy if exists extractions_insert on public.contract_extractions;
create policy extractions_insert on public.contract_extractions for insert to authenticated with check (public.user_owns_workspace(workspace_id));
drop policy if exists extractions_update on public.contract_extractions;
create policy extractions_update on public.contract_extractions for update to authenticated using (public.user_owns_workspace(workspace_id)) with check (public.user_owns_workspace(workspace_id));
drop policy if exists versions_read on public.contract_versions;
create policy versions_read on public.contract_versions for select to authenticated using (exists (select 1 from public.contracts where contracts.id = contract_versions.contract_id and public.user_owns_workspace(contracts.workspace_id)));
drop policy if exists activities_read on public.activities;
create policy activities_read on public.activities for select to authenticated using (public.user_owns_workspace(workspace_id));
drop policy if exists activities_insert on public.activities;
create policy activities_insert on public.activities for insert to authenticated with check (public.user_owns_workspace(workspace_id));
drop policy if exists members_read on public.workspace_members;
create policy members_read on public.workspace_members for select to authenticated using (user_id = auth.uid());
drop policy if exists members_update on public.workspace_members;
create policy members_update on public.workspace_members for update to authenticated using (user_id = auth.uid() and public.user_owns_workspace(workspace_id)) with check (user_id = auth.uid() and public.user_owns_workspace(workspace_id));
drop policy if exists settings_read on public.workspace_settings;
create policy settings_read on public.workspace_settings for select to authenticated using (public.user_owns_workspace(workspace_id));
drop policy if exists settings_insert on public.workspace_settings;
create policy settings_insert on public.workspace_settings for insert to authenticated with check (public.user_owns_workspace(workspace_id));
drop policy if exists settings_update on public.workspace_settings;
create policy settings_update on public.workspace_settings for update to authenticated using (public.user_owns_workspace(workspace_id)) with check (public.user_owns_workspace(workspace_id));

insert into storage.buckets (id, name, public)
values ('contract-documents', 'contract-documents', false)
on conflict (id) do update set public = false;

drop policy if exists contract_documents_storage_read on storage.objects;
create policy contract_documents_storage_read on storage.objects for select to authenticated using (
  bucket_id = 'contract-documents' and (storage.foldername(name))[2] = auth.uid()::text
);
drop policy if exists contract_documents_storage_insert on storage.objects;
create policy contract_documents_storage_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'contract-documents' and (storage.foldername(name))[1] = 'contracts' and (storage.foldername(name))[2] = auth.uid()::text
);
