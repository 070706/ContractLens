import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BrainCircuit,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  Database,
  FileCheck2,
  FileText,
  FolderOpen,
  GitCompareArrows,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  LockKeyhole,
  MessageSquareText,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  ScanSearch,
  SlidersHorizontal,
  Settings2,
  ShieldAlert,
  Sparkles,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Contracts", icon: FileText, count: "24" },
  { label: "Obligations", icon: CalendarClock, count: "18" },
  { label: "Review queue", icon: Inbox, count: "7", attention: true },
];

const timelineItems = [
  {
    month: "OCT",
    day: "24",
    title: "Security questionnaire due",
    contract: "Acme Cloud Services Agreement",
    owner: "You",
    type: "Obligation",
    tone: "amber",
  },
  {
    month: "NOV",
    day: "02",
    title: "Auto-renewal notice window opens",
    contract: "Northstar Logistics MSA",
    owner: "Procurement",
    type: "Renewal",
    tone: "rose",
  },
  {
    month: "NOV",
    day: "14",
    title: "Quarterly uptime report",
    contract: "Orbit Analytics DPA",
    owner: "Finance",
    type: "Obligation",
    tone: "sky",
  },
];

const contracts = [
  {
    name: "Acme Cloud Services Agreement",
    type: "Vendor agreement",
    parties: "Acme Inc. · Your company",
    updated: "Today, 9:42 AM",
    status: "Active",
    risk: "1 review",
    icon: "AC",
    color: "bg-[#dff7ef] text-[#0d775f]",
  },
  {
    name: "Northstar Logistics MSA",
    type: "Master service agreement",
    parties: "Northstar · Your company",
    updated: "Yesterday",
    status: "Renewal soon",
    risk: "2 reviews",
    icon: "NL",
    color: "bg-[#e5edff] text-[#415cb8]",
  },
  {
    name: "Orbit Analytics DPA",
    type: "Data processing addendum",
    parties: "Orbit Analytics · Your company",
    updated: "Oct 17, 2024",
    status: "Active",
    risk: "Clear",
    icon: "OA",
    color: "bg-[#f2e7ff] text-[#8754bd]",
  },
  {
    name: "Mosaic Studio SOW #03",
    type: "Statement of work",
    parties: "Mosaic Studio · Your company",
    updated: "Oct 12, 2024",
    status: "Processing",
    risk: "Pending",
    icon: "MS",
    color: "bg-[#fff0d9] text-[#a56a19]",
  },
];

const questionSuggestions = [
  "What can we terminate for convenience?",
  "Which contracts renew in the next 90 days?",
  "Show me our data breach obligations",
];

function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "rose" | "blue" }) {
  const tones = {
    neutral: "bg-[#f1f4f7] text-[#617082]",
    green: "bg-[#e2f7ee] text-[#147a5d]",
    amber: "bg-[#fff2d8] text-[#a86816]",
    rose: "bg-[#ffe7e6] text-[#b74d55]",
    blue: "bg-[#e8efff] text-[#4765bd]",
  };

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[#c8f2e4] text-[#123d3a] shadow-[0_6px_16px_rgba(127,226,198,0.18)]">
        <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full border-[5px] border-[#123d3a]/20" />
        <BrainCircuit className="relative h-[19px] w-[19px]" strokeWidth={2.2} />
      </div>
      <div>
        <div className="text-[15px] font-bold tracking-[-0.02em] text-white">contractlens</div>
        <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8094a4]">contract intelligence</div>
      </div>
    </div>
  );
}

export default function Index() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [timelineFilter, setTimelineFilter] = useState("All activity");
  const [query, setQuery] = useState("");
  const [question, setQuestion] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleContracts = useMemo(() => {
    if (!query.trim()) return contracts;
    const normalized = query.toLowerCase();
    return contracts.filter((contract) => `${contract.name} ${contract.type} ${contract.parties}`.toLowerCase().includes(normalized));
  }, [query]);

  const handleQuestion = (value = question) => {
    if (value.trim()) {
      setQuestion(value);
      setShowAnswer(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#162334] selection:bg-[#c8f2e4] selection:text-[#123d3a]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[248px] shrink-0 flex-col bg-[#101c2b] px-4 py-5 text-white lg:flex">
          <div className="px-3 pb-9"><AppLogo /></div>

          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#71879a]">Workspace</div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveNav(item.label)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${active ? "bg-[#1e3444] text-[#d5faed] shadow-[inset_3px_0_0_#91e8cb]" : "text-[#9aabba] hover:bg-white/[0.06] hover:text-white"}`}
                >
                  <span className="flex items-center gap-3"><Icon className={`h-[17px] w-[17px] ${active ? "text-[#91e8cb]" : "text-[#71879a] group-hover:text-[#dce8f0]"}`} strokeWidth={1.8} />{item.label}</span>
                  {item.count && <span className={`text-[11px] ${item.attention ? "rounded-full bg-[#edb873] px-1.5 py-0.5 font-bold text-[#302215]" : "text-[#6f8496]"}`}>{item.count}</span>}
                </button>
              );
            })}
          </nav>

          <div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#71879a]">Manage</div>
          <nav className="space-y-1">
            <button onClick={() => setActiveNav("Reports")} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${activeNav === "Reports" ? "bg-[#1e3444] text-[#d5faed]" : "text-[#9aabba] hover:bg-white/[0.06] hover:text-white"}`}><ScanSearch className="h-[17px] w-[17px] text-[#71879a]" strokeWidth={1.8} />Reports</button>
            <button onClick={() => setActiveNav("Settings")} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${activeNav === "Settings" ? "bg-[#1e3444] text-[#d5faed]" : "text-[#9aabba] hover:bg-white/[0.06] hover:text-white"}`}><Settings2 className="h-[17px] w-[17px] text-[#71879a]" strokeWidth={1.8} />Settings</button>
          </nav>

          <div className="mt-auto">
            <div className="mb-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3.5">
              <div className="mb-3 flex items-center justify-between"><span className="flex items-center gap-2 text-[11px] font-semibold text-[#c4d4df]"><Sparkles className="h-3.5 w-3.5 text-[#91e8cb]" />Lens intelligence</span><span className="rounded-full bg-[#c8f2e4]/15 px-2 py-0.5 text-[9px] font-bold text-[#91e8cb]">BETA</span></div>
              <p className="text-[11px] leading-[1.55] text-[#8498a9]">Every answer is linked back to the exact clause it came from.</p>
              <button onClick={() => setActiveNav("How it works")} className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#b9efe0] hover:text-white">How it works <ArrowUpRight className="h-3 w-3" /></button>
            </div>
            <div className="flex items-center gap-3 border-t border-white/[0.08] px-2 pt-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0d3c1] text-[11px] font-bold text-[#7c483a]">AS</div>
              <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-semibold text-white">Avery Singh</p><p className="truncate text-[10px] text-[#71879a]">Operations team</p></div>
              <MoreHorizontal className="h-4 w-4 text-[#71879a]" />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-[#e8edf2] bg-white/85 px-5 backdrop-blur md:px-8">
            <div className="flex items-center gap-3 lg:hidden"><AppLogo /></div>
            <div className="hidden items-center gap-2 text-[12px] font-medium text-[#8492a0] md:flex"><span>Workspace</span><span className="text-[#c1cbd3]">/</span><span className="text-[#233345]">{activeNav}</span></div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden h-9 w-[260px] items-center gap-2.5 rounded-xl border border-[#e4eaf0] bg-[#f8fafc] px-3.5 focus-within:border-[#9ddfce] focus-within:bg-white sm:flex"><Search className="h-4 w-4 text-[#9ba9b5]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search contracts..." className="w-full bg-transparent text-[12px] text-[#27394b] outline-none placeholder:text-[#a4b0ba]" /><span className="flex items-center gap-0.5 text-[10px] text-[#9ba9b5]"><Command className="h-3 w-3" /> K</span></div>
              <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#e4eaf0] text-[#708091] transition hover:border-[#cbd7df] hover:bg-[#f8fafc]" aria-label="Notifications"><Bell className="h-[16px] w-[16px]" strokeWidth={1.8} /><span className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#ed8d79] ring-2 ring-white" /></button>
              <div className="hidden h-8 w-px bg-[#e8edf2] md:block" />
              <button className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0d3c1] text-[10px] font-bold text-[#7c483a]">AS</div><ChevronDown className="hidden h-3.5 w-3.5 text-[#8c9aa6] sm:block" /></button>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] px-5 pb-12 pt-6 md:px-8 md:pt-8 xl:px-10">
            <section className="relative overflow-hidden rounded-[24px] bg-[#183448] px-6 py-7 shadow-[0_16px_34px_rgba(25,52,72,0.10)] md:px-8 md:py-8">
              <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[42px] border-[#8ae3c7]/[0.07]" />
              <div className="absolute -bottom-36 right-20 h-72 w-72 rounded-full border-[1px] border-[#8ae3c7]/[0.12]" />
              <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8fdcc7]"><span className="h-1.5 w-1.5 rounded-full bg-[#8fdcc7] shadow-[0_0_0_4px_rgba(143,220,199,0.12)]" /> Monday, October 21, 2024</div>
                  <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-white md:text-[34px]">Good morning, Avery<span className="text-[#91e8cb]">.</span></h1>
                  <p className="mt-2 max-w-[450px] text-[13px] leading-relaxed text-[#a9bac6]">Here’s what needs your attention across the contract workspace today.</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(event) => setUploadedFile(event.target.files?.[0]?.name ?? null)} />
                  <button onClick={() => fileInputRef.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#c8f2e4] px-4 text-[12px] font-bold text-[#123d3a] transition hover:bg-[#e0faf1]"><Upload className="h-4 w-4" strokeWidth={2.2} />{uploadedFile ? "Ready to analyze" : "Upload contract"}</button>
                  <button onClick={() => document.getElementById("ask-lens")?.scrollIntoView({ behavior: "smooth", block: "center" })} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[12px] font-semibold text-white transition hover:bg-white/[0.12]"><MessageSquareText className="h-4 w-4 text-[#9fe8d2]" />Ask ContractLens</button>
                </div>
              </div>
              {uploadedFile && <div className="relative mt-5 flex w-fit items-center gap-2 rounded-lg bg-white/[0.08] px-3 py-2 text-[11px] text-[#cde7df]"><FileCheck2 className="h-3.5 w-3.5 text-[#91e8cb]" />{uploadedFile}<button onClick={() => setUploadedFile(null)} className="ml-1 text-[#88a7a8] hover:text-white" aria-label="Remove file"><X className="h-3 w-3" /></button></div>}
            </section>

            <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {[
                { label: "Total contracts", value: "24", detail: "+3 this month", icon: FolderOpen, tone: "mint", trend: "up" },
                { label: "Active obligations", value: "18", detail: "4 due this week", icon: CheckCircle2, tone: "blue", trend: "flat" },
                { label: "Review queue", value: "07", detail: "2 high priority", icon: ShieldAlert, tone: "peach", trend: "alert" },
                { label: "Next renewal", value: "12d", detail: "Northstar Logistics", icon: Clock3, tone: "lilac", trend: "clock" },
              ].map((stat) => {
                const Icon = stat.icon;
                const backgrounds = { mint: "bg-[#e5f8f1] text-[#25866d]", blue: "bg-[#eaf0ff] text-[#526ec4]", peach: "bg-[#fff0e8] text-[#c26851]", lilac: "bg-[#f1edff] text-[#816bc6]" };
                return <div key={stat.label} className="group rounded-2xl border border-[#e7edf1] bg-white p-4 shadow-[0_5px_18px_rgba(34,52,68,0.025)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(34,52,68,0.06)] md:p-5"><div className="flex items-start justify-between"><div className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${backgrounds[stat.tone as keyof typeof backgrounds]}`}><Icon className="h-4 w-4" strokeWidth={1.9} /></div><ArrowUpRight className="h-3.5 w-3.5 text-[#b7c1ca] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#6d9f93]" /></div><div className="mt-4 text-[24px] font-semibold tracking-[-0.04em] text-[#203244] md:text-[26px]">{stat.value}</div><div className="mt-0.5 text-[11px] font-medium text-[#778795]">{stat.label}</div><div className={`mt-3 text-[10px] font-semibold ${stat.trend === "alert" ? "text-[#cf725d]" : "text-[#7d909e]"}`}>{stat.detail}</div></div>;
              })}
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
              <div className="rounded-2xl border border-[#e7edf1] bg-white p-5 shadow-[0_5px_18px_rgba(34,52,68,0.025)] md:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2"><h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#243648]">Upcoming timeline</h2><span className="rounded-md bg-[#f1f4f7] px-1.5 py-0.5 text-[9px] font-bold text-[#7f8e9b]">NEXT 30 DAYS</span></div><p className="mt-1 text-[11px] text-[#8b99a5]">Deadlines and renewal windows from your contracts</p></div><div className="flex items-center gap-1 rounded-lg bg-[#f5f7f9] p-1">{["All activity", "Renewals"].map((filter) => <button key={filter} onClick={() => setTimelineFilter(filter)} className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition ${timelineFilter === filter ? "bg-white text-[#35495a] shadow-sm" : "text-[#91a0ac] hover:text-[#536576]"}`}>{filter}</button>)}</div></div>
                <div className="mt-5 divide-y divide-[#edf1f4]">{timelineItems.filter((item) => timelineFilter === "All activity" || item.type === "Renewal").map((item) => <div key={item.title} className="group flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"><div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#f7f9fb] leading-none"><span className="text-[8px] font-bold tracking-[0.1em] text-[#98a5b0]">{item.month}</span><span className="mt-1 text-[16px] font-bold tracking-[-0.04em] text-[#384b5d]">{item.day}</span></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-[12px] font-semibold text-[#304356]">{item.title}</h3><StatusPill tone={item.tone === "rose" ? "rose" : item.tone === "amber" ? "amber" : "blue"}>{item.type}</StatusPill></div><p className="mt-1 truncate text-[10px] text-[#8c9ba7]">{item.contract}</p></div><div className="hidden items-center gap-1.5 text-[10px] text-[#9ba8b2] sm:flex"><div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8eef2] text-[8px] font-bold text-[#718394]">{item.owner.slice(0, 1)}</div>{item.owner}</div><button className="rounded-lg p-1.5 text-[#b0bbc3] opacity-0 transition hover:bg-[#f4f7f9] hover:text-[#516574] group-hover:opacity-100"><ArrowRight className="h-4 w-4" /></button></div>)}</div>
                <button onClick={() => setActiveNav("Obligations")} className="mt-5 flex items-center gap-1.5 text-[11px] font-bold text-[#3b8272] hover:text-[#245e53]">View all obligations <ArrowRight className="h-3 w-3" /></button>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-[#fffaf3] p-5 shadow-[0_5px_18px_rgba(174,116,50,0.05)] md:p-6"><div className="absolute -right-12 -top-12 h-32 w-32 rounded-full border-[18px] border-[#f5d59b]/25" /><div className="relative"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#4b3b2b]">Needs your attention</h2><span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f4c97f] px-1.5 text-[9px] font-bold text-[#5e411e]">3</span></div><p className="mt-1 text-[11px] text-[#a99074]">Insights that may need a human review</p></div><ShieldAlert className="h-5 w-5 text-[#d99c4a]" strokeWidth={1.7} /></div><div className="mt-6 space-y-3"><button onClick={() => setActiveNav("Review queue")} className="group w-full rounded-xl border border-[#f2e3ca] bg-white/70 p-3 text-left transition hover:border-[#e5bd7e] hover:bg-white"><div className="flex gap-3"><div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#ffe8dc] text-[#cd7357]"><AlertTriangle className="h-3.5 w-3.5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-[11px] font-bold text-[#5c4837]">Ambiguous termination clause</p><ArrowUpRight className="h-3 w-3 text-[#bda486] transition group-hover:text-[#9a6d3b]" /></div><p className="mt-1 truncate text-[10px] text-[#a28b73]">Acme Cloud · Section 8.2</p></div></div></button><button onClick={() => setActiveNav("Review queue")} className="group w-full rounded-xl border border-[#f2e3ca] bg-white/70 p-3 text-left transition hover:border-[#e5bd7e] hover:bg-white"><div className="flex gap-3"><div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fff0cf] text-[#c89137]"><GitCompareArrows className="h-3.5 w-3.5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-[11px] font-bold text-[#5c4837]">Material version change</p><ArrowUpRight className="h-3 w-3 text-[#bda486] transition group-hover:text-[#9a6d3b]" /></div><p className="mt-1 truncate text-[10px] text-[#a28b73]">Northstar MSA · Liability cap</p></div></div></button><button onClick={() => setActiveNav("Review queue")} className="group w-full rounded-xl border border-[#f2e3ca] bg-white/70 p-3 text-left transition hover:border-[#e5bd7e] hover:bg-white"><div className="flex gap-3"><div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e6efff] text-[#607dcc]"><CircleHelp className="h-3.5 w-3.5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-[11px] font-bold text-[#5c4837]">Missing effective date</p><ArrowUpRight className="h-3 w-3 text-[#bda486] transition group-hover:text-[#9a6d3b]" /></div><p className="mt-1 truncate text-[10px] text-[#a28b73]">Mosaic Studio SOW #03 · Cover</p></div></div></button></div><button onClick={() => setActiveNav("Review queue")} className="mt-5 flex items-center gap-1.5 text-[11px] font-bold text-[#a06b2c] hover:text-[#704619]">Open review queue <ArrowRight className="h-3 w-3" /></button></div></div>
            </section>

            <section className="mt-5 rounded-2xl border border-[#e7edf1] bg-white shadow-[0_5px_18px_rgba(34,52,68,0.025)]">
              <div className="flex flex-col justify-between gap-3 border-b border-[#edf1f4] px-5 py-5 md:flex-row md:items-center md:px-6"><div><h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#243648]">Recent contracts</h2><p className="mt-1 text-[11px] text-[#8b99a5]">Your latest documents and their current intelligence status</p></div><div className="flex items-center gap-2"><button className="flex h-8 items-center gap-1.5 rounded-lg border border-[#e4eaf0] px-2.5 text-[10px] font-semibold text-[#6f8190] hover:bg-[#f7f9fb]"><SlidersHorizontal className="h-3.5 w-3.5" /> Filter</button><button onClick={() => fileInputRef.current?.click()} className="flex h-8 items-center gap-1.5 rounded-lg bg-[#183448] px-3 text-[10px] font-bold text-white hover:bg-[#24465d]"><Plus className="h-3.5 w-3.5" /> Add contract</button></div></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b border-[#f0f3f5] text-[9px] font-bold uppercase tracking-[0.12em] text-[#a0acb5]"><th className="px-6 py-3 font-bold">Contract</th><th className="px-4 py-3 font-bold">Last updated</th><th className="px-4 py-3 font-bold">Status</th><th className="px-4 py-3 font-bold">Review</th><th className="px-6 py-3" /></tr></thead><tbody>{visibleContracts.map((contract) => <tr key={contract.name} className="group border-b border-[#f0f3f5] last:border-0 hover:bg-[#fbfcfd]"><td className="px-6 py-3.5"><div className="flex items-center gap-3"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[10px] font-bold ${contract.color}`}>{contract.icon}</div><div className="min-w-0"><p className="truncate text-[12px] font-bold text-[#33485b]">{contract.name}</p><p className="mt-0.5 truncate text-[10px] text-[#91a0ab]">{contract.type} · {contract.parties}</p></div></div></td><td className="px-4 py-3.5 text-[10px] font-medium text-[#81919e]">{contract.updated}</td><td className="px-4 py-3.5"><StatusPill tone={contract.status === "Active" ? "green" : contract.status === "Renewal soon" ? "amber" : "blue"}>{contract.status}</StatusPill></td><td className="px-4 py-3.5"><span className={`text-[10px] font-semibold ${contract.risk === "Clear" ? "text-[#278369]" : contract.risk === "Pending" ? "text-[#9aa7b0]" : "text-[#bc6a55]"}`}>{contract.risk}</span></td><td className="px-6 py-3.5 text-right"><button className="rounded-lg p-1.5 text-[#abb6be] opacity-0 transition hover:bg-[#f0f4f6] hover:text-[#506474] group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></button></td></tr>)}</tbody></table>{visibleContracts.length === 0 && <div className="px-6 py-10 text-center text-[12px] text-[#8998a4]">No contracts match “{query}”.</div>}</div>
            </section>

            <section id="ask-lens" className="mt-5 overflow-hidden rounded-2xl border border-[#d6e9e3] bg-[#f0faf6] p-5 md:p-6"><div className="flex flex-col gap-5 md:flex-row md:items-center"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#c8f2e4] text-[#267d6b]"><Sparkles className="h-5 w-5" strokeWidth={1.8} /></div><div className="min-w-0 flex-1"><h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#23463f]">Ask ContractLens anything</h2><p className="mt-1 text-[11px] text-[#6f9188]">Get a plain-language answer grounded in your contracts, with a source for every claim.</p></div><div className="w-full md:max-w-[470px]"><div className="flex h-11 items-center gap-2 rounded-xl border border-[#cfe4dd] bg-white px-3 shadow-[0_3px_10px_rgba(53,126,106,0.05)] focus-within:border-[#8fceb9]"><Paperclip className="h-4 w-4 shrink-0 text-[#9ab9b0]" /><input value={question} onChange={(event) => { setQuestion(event.target.value); setShowAnswer(false); }} onKeyDown={(event) => { if (event.key === "Enter") handleQuestion(); }} placeholder="Ask about a term, date, or obligation..." className="min-w-0 flex-1 bg-transparent text-[11px] text-[#29483f] outline-none placeholder:text-[#9eb5ae]" /><button onClick={() => handleQuestion()} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#183f3c] text-white transition hover:bg-[#245e55]" aria-label="Ask ContractLens"><ArrowRight className="h-3.5 w-3.5" /></button></div></div></div>{!showAnswer && <div className="mt-4 flex flex-wrap gap-2 pl-0 md:pl-16">{questionSuggestions.map((suggestion) => <button key={suggestion} onClick={() => handleQuestion(suggestion)} className="rounded-full border border-[#d4e9e1] bg-white/70 px-3 py-1.5 text-[10px] font-medium text-[#63877d] transition hover:border-[#a9d5c7] hover:bg-white">{suggestion}</button>)}</div>}{showAnswer && <div className="mt-5 rounded-xl border border-[#d4e9e1] bg-white/85 p-4 md:ml-16"><div className="flex items-start gap-3"><div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#e1f6ef] text-[#2c806d]"><Check className="h-3.5 w-3.5" /></div><div><p className="text-[11px] font-semibold text-[#31564c]">Based on 3 clauses across 2 contracts</p><p className="mt-1.5 text-[12px] leading-relaxed text-[#58766e]">The Acme Cloud agreement allows termination for convenience with <span className="font-bold text-[#31564c]">30 days’ written notice</span>. Northstar requires 60 days and only permits convenience termination after the initial term.</p><button onClick={() => setActiveNav("Contracts")} className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-[#36806f]">View cited clauses <ArrowUpRight className="h-3 w-3" /></button></div></div></div>}</section>

            <footer className="flex flex-col items-center justify-between gap-3 px-1 pb-2 pt-7 text-[10px] text-[#9aa7b1] sm:flex-row"><div className="flex items-center gap-2"><LockKeyhole className="h-3 w-3" /> Your workspace is private and encrypted</div><div className="flex items-center gap-4"><button className="hover:text-[#59716f]">Help center</button><button className="hover:text-[#59716f]">Privacy</button><span>ContractLens v0.1</span></div></footer>
          </div>
        </main>
      </div>
    </div>
  );
}
