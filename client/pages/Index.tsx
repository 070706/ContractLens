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

const reviewFindings = [
  { id: "termination", title: "Ambiguous termination clause", contract: "Acme Cloud Services Agreement", reference: "Section 8.2", description: "The termination language uses an undefined materiality threshold that may need legal interpretation.", severity: "High", icon: AlertTriangle, tone: "rose" as const },
  { id: "liability", title: "Material version change", contract: "Northstar Logistics MSA", reference: "Section 11 · Liability cap", description: "The latest version changes the liability cap from fees paid to 12 months of fees.", severity: "Medium", icon: GitCompareArrows, tone: "amber" as const },
  { id: "effective-date", title: "Missing effective date", contract: "Mosaic Studio SOW #03", reference: "Cover page", description: "No effective date was found in the uploaded document. Confirm before relying on downstream deadlines.", severity: "Medium", icon: CircleHelp, tone: "blue" as const },
];

const workspaceCopy: Record<string, { eyebrow: string; title: string; description: string }> = {
  Overview: { eyebrow: "Workspace overview", title: "Good morning, Avery", description: "Here’s what needs your attention across the contract workspace today." },
  Contracts: { eyebrow: "Contract library", title: "Your contract library", description: "Search, review, and compare every agreement in one place." },
  Obligations: { eyebrow: "Obligation tracker", title: "Stay ahead of commitments", description: "Every deadline and renewal window, assigned to the right owner." },
  "Review queue": { eyebrow: "Human review queue", title: "Decisions that need you", description: "Potential risks and ambiguous language surfaced for a human decision." },
  Reports: { eyebrow: "Workspace reports", title: "See the bigger picture", description: "Turn contract activity into clear operational signals for your team." },
  Settings: { eyebrow: "Workspace settings", title: "Make ContractLens yours", description: "Manage notifications, team access, and intelligence preferences." },
  "How it works": { eyebrow: "Lens intelligence", title: "Trace every answer", description: "ContractLens connects each insight to the exact clause that supports it." },
};

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
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [question, setQuestion] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [contractList, setContractList] = useState(contracts);
  const [openFinding, setOpenFinding] = useState<(typeof reviewFindings)[number] | null>(null);
  const [visibleFindings, setVisibleFindings] = useState(reviewFindings);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const copy = workspaceCopy[activeNav] ?? workspaceCopy.Overview;
  const contractCount = 24 + (contractList.length - contracts.length);
  const reviewCount = 7 - (reviewFindings.length - visibleFindings.length);

  const visibleContracts = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return contractList.filter((contract) => {
      const matchesQuery = !normalized || `${contract.name} ${contract.type} ${contract.parties}`.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "All statuses" || contract.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [contractList, query, statusFilter]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const handleQuestion = (value = question) => {
    if (value.trim()) {
      setQuestion(value);
      setShowAnswer(true);
    }
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const extension = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
    const newContract = {
      name: file.name.replace(/\.[^/.]+$/, ""),
      type: `${extension} contract`,
      parties: "Pending extraction · Your company",
      updated: "Just now",
      status: "Processing",
      risk: "Pending",
      icon: file.name.slice(0, 2).toUpperCase(),
      color: "bg-[#e8efff] text-[#526ec4]",
    };
    setContractList((current) => [newContract, ...current]);
    setUploadedFile(file.name);
    setActiveNav("Contracts");
    showToast(`${file.name} added to your contract library`);
  };

  const selectFinding = (finding: (typeof reviewFindings)[number]) => {
    setOpenFinding(finding);
    setActiveNav("Review queue");
  };

  const resolveFinding = (id: string) => {
    setVisibleFindings((current) => current.filter((finding) => finding.id !== id));
    setOpenFinding(null);
    showToast("Finding marked as reviewed");
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
              const count = item.label === "Contracts" ? contractCount : item.label === "Review queue" ? reviewCount : item.count;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveNav(item.label)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${active ? "bg-[#1e3444] text-[#d5faed] shadow-[inset_3px_0_0_#91e8cb]" : "text-[#9aabba] hover:bg-white/[0.06] hover:text-white"}`}
                >
                  <span className="flex items-center gap-3"><Icon className={`h-[17px] w-[17px] ${active ? "text-[#91e8cb]" : "text-[#71879a] group-hover:text-[#dce8f0]"}`} strokeWidth={1.8} />{item.label}</span>
                  {count && <span className={`text-[11px] ${item.attention ? "rounded-full bg-[#edb873] px-1.5 py-0.5 font-bold text-[#302215]" : "text-[#6f8496]"}`}>{count}</span>}
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
              <button onClick={() => { setActiveNav("How it works"); setHelpOpen(true); }} className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#b9efe0] hover:text-white">How it works <ArrowUpRight className="h-3 w-3" /></button>
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
              <div className="relative">
                <button onClick={() => { setNotificationsOpen((open) => !open); setProfileOpen(false); }} className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#e4eaf0] text-[#708091] transition hover:border-[#cbd7df] hover:bg-[#f8fafc]" aria-label="Notifications"><Bell className="h-[16px] w-[16px]" strokeWidth={1.8} /><span className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#ed8d79] ring-2 ring-white" /></button>
                {notificationsOpen && <div className="absolute right-0 top-12 z-30 w-72 rounded-2xl border border-[#e4eaf0] bg-white p-3 shadow-[0_14px_38px_rgba(28,49,66,0.14)]"><div className="flex items-center justify-between px-2 pb-2"><p className="text-[12px] font-bold text-[#304356]">Notifications</p><span className="rounded-full bg-[#ffe7e6] px-2 py-0.5 text-[9px] font-bold text-[#b74d55]">3 new</span></div><button onClick={() => selectFinding(visibleFindings[0])} className="w-full rounded-xl p-2 text-left hover:bg-[#f8fafc]"><p className="text-[11px] font-semibold text-[#4c3c30]">Review needed on Acme Cloud</p><p className="mt-1 text-[10px] text-[#95a1aa]">Ambiguous termination language found</p></button><button onClick={() => { setActiveNav("Obligations"); setNotificationsOpen(false); }} className="w-full rounded-xl p-2 text-left hover:bg-[#f8fafc]"><p className="text-[11px] font-semibold text-[#304356]">Renewal window opens soon</p><p className="mt-1 text-[10px] text-[#95a1aa]">Northstar Logistics · Nov 02</p></button><button onClick={() => { setNotificationsOpen(false); showToast("All notifications marked as read"); }} className="mt-1 w-full rounded-lg border border-[#e8edf1] py-2 text-[10px] font-bold text-[#5a7880] hover:bg-[#f5faf8]">Mark all as read</button></div>}
              </div>
              <div className="hidden h-8 w-px bg-[#e8edf2] md:block" />
              <div className="relative"><button onClick={() => { setProfileOpen((open) => !open); setNotificationsOpen(false); }} className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0d3c1] text-[10px] font-bold text-[#7c483a]">AS</div><ChevronDown className="hidden h-3.5 w-3.5 text-[#8c9aa6] sm:block" /></button>{profileOpen && <div className="absolute right-0 top-11 z-30 w-52 rounded-2xl border border-[#e4eaf0] bg-white p-2 shadow-[0_14px_38px_rgba(28,49,66,0.14)]"><div className="border-b border-[#edf1f4] px-3 py-2"><p className="text-[11px] font-bold text-[#304356]">Avery Singh</p><p className="mt-0.5 text-[10px] text-[#95a1aa]">avery@yourcompany.com</p></div><button onClick={() => { setActiveNav("Settings"); setProfileOpen(false); }} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-[10px] font-semibold text-[#607281] hover:bg-[#f5f8fa]">Workspace settings</button><button onClick={() => { setProfileOpen(false); showToast("You are already on the secure workspace"); }} className="w-full rounded-lg px-3 py-2 text-left text-[10px] font-semibold text-[#607281] hover:bg-[#f5f8fa]">Account security</button></div>}</div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] px-5 pb-12 pt-6 md:px-8 md:pt-8 xl:px-10">
            <section className="relative overflow-hidden rounded-[24px] bg-[#183448] px-6 py-7 shadow-[0_16px_34px_rgba(25,52,72,0.10)] md:px-8 md:py-8">
              <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[42px] border-[#8ae3c7]/[0.07]" />
              <div className="absolute -bottom-36 right-20 h-72 w-72 rounded-full border-[1px] border-[#8ae3c7]/[0.12]" />
              <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8fdcc7]"><span className="h-1.5 w-1.5 rounded-full bg-[#8fdcc7] shadow-[0_0_0_4px_rgba(143,220,199,0.12)]" />{copy.eyebrow}</div>
                  <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-white md:text-[34px]">{copy.title}<span className="text-[#91e8cb]">.</span></h1>
                  <p className="mt-2 max-w-[450px] text-[13px] leading-relaxed text-[#a9bac6]">{copy.description}</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#c8f2e4] px-4 text-[12px] font-bold text-[#123d3a] transition hover:bg-[#e0faf1]"><Upload className="h-4 w-4" strokeWidth={2.2} />{uploadedFile ? "Ready to analyze" : "Upload contract"}</button>
                  <button onClick={() => document.getElementById("ask-lens")?.scrollIntoView({ behavior: "smooth", block: "center" })} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[12px] font-semibold text-white transition hover:bg-white/[0.12]"><MessageSquareText className="h-4 w-4 text-[#9fe8d2]" />Ask ContractLens</button>
                </div>
              </div>
              {uploadedFile && <div className="relative mt-5 flex w-fit items-center gap-2 rounded-lg bg-white/[0.08] px-3 py-2 text-[11px] text-[#cde7df]"><FileCheck2 className="h-3.5 w-3.5 text-[#91e8cb]" />{uploadedFile}<button onClick={() => setUploadedFile(null)} className="ml-1 text-[#88a7a8] hover:text-white" aria-label="Remove file"><X className="h-3 w-3" /></button></div>}
            </section>

            <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {[
                { label: "Total contracts", value: String(contractCount), detail: "+3 this month", icon: FolderOpen, tone: "mint", trend: "up", nav: "Contracts" },
                { label: "Active obligations", value: "18", detail: "4 due this week", icon: CheckCircle2, tone: "blue", trend: "flat", nav: "Obligations" },
                { label: "Review queue", value: String(reviewCount).padStart(2, "0"), detail: "2 high priority", icon: ShieldAlert, tone: "peach", trend: "alert", nav: "Review queue" },
                { label: "Next renewal", value: "12d", detail: "Northstar Logistics", icon: Clock3, tone: "lilac", trend: "clock", nav: "Obligations" },
              ].map((stat) => {
                const Icon = stat.icon;
                const backgrounds = { mint: "bg-[#e5f8f1] text-[#25866d]", blue: "bg-[#eaf0ff] text-[#526ec4]", peach: "bg-[#fff0e8] text-[#c26851]", lilac: "bg-[#f1edff] text-[#816bc6]" };
                return <button key={stat.label} onClick={() => setActiveNav(stat.nav)} className="group rounded-2xl border border-[#e7edf1] bg-white p-4 text-left shadow-[0_5px_18px_rgba(34,52,68,0.025)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(34,52,68,0.06)] md:p-5"><div className="flex items-start justify-between"><div className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${backgrounds[stat.tone as keyof typeof backgrounds]}`}><Icon className="h-4 w-4" strokeWidth={1.9} /></div><ArrowUpRight className="h-3.5 w-3.5 text-[#b7c1ca] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#6d9f93]" /></div><div className="mt-4 text-[24px] font-semibold tracking-[-0.04em] text-[#203244] md:text-[26px]">{stat.value}</div><div className="mt-0.5 text-[11px] font-medium text-[#778795]">{stat.label}</div><div className={`mt-3 text-[10px] font-semibold ${stat.trend === "alert" ? "text-[#cf725d]" : "text-[#7d909e]"}`}>{stat.detail}</div></button>;
              })}
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
              <div className="rounded-2xl border border-[#e7edf1] bg-white p-5 shadow-[0_5px_18px_rgba(34,52,68,0.025)] md:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2"><h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#243648]">Upcoming timeline</h2><span className="rounded-md bg-[#f1f4f7] px-1.5 py-0.5 text-[9px] font-bold text-[#7f8e9b]">NEXT 30 DAYS</span></div><p className="mt-1 text-[11px] text-[#8b99a5]">Deadlines and renewal windows from your contracts</p></div><div className="flex items-center gap-1 rounded-lg bg-[#f5f7f9] p-1">{["All activity", "Renewals"].map((filter) => <button key={filter} onClick={() => setTimelineFilter(filter)} className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition ${timelineFilter === filter ? "bg-white text-[#35495a] shadow-sm" : "text-[#91a0ac] hover:text-[#536576]"}`}>{filter}</button>)}</div></div>
                <div className="mt-5 divide-y divide-[#edf1f4]">{timelineItems.filter((item) => timelineFilter === "All activity" || item.type === "Renewal").map((item) => <div key={item.title} className="group flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"><div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#f7f9fb] leading-none"><span className="text-[8px] font-bold tracking-[0.1em] text-[#98a5b0]">{item.month}</span><span className="mt-1 text-[16px] font-bold tracking-[-0.04em] text-[#384b5d]">{item.day}</span></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-[12px] font-semibold text-[#304356]">{item.title}</h3><StatusPill tone={item.tone === "rose" ? "rose" : item.tone === "amber" ? "amber" : "blue"}>{item.type}</StatusPill></div><p className="mt-1 truncate text-[10px] text-[#8c9ba7]">{item.contract}</p></div><div className="hidden items-center gap-1.5 text-[10px] text-[#9ba8b2] sm:flex"><div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8eef2] text-[8px] font-bold text-[#718394]">{item.owner.slice(0, 1)}</div>{item.owner}</div><button onClick={() => { setActiveNav("Obligations"); showToast(`${item.title} opened in obligation tracker`); }} className="rounded-lg p-1.5 text-[#b0bbc3] opacity-0 transition hover:bg-[#f4f7f9] hover:text-[#516574] group-hover:opacity-100" aria-label={`Open ${item.title}`}><ArrowRight className="h-4 w-4" /></button></div>)}</div>
                <button onClick={() => setActiveNav("Obligations")} className="mt-5 flex items-center gap-1.5 text-[11px] font-bold text-[#3b8272] hover:text-[#245e53]">View all obligations <ArrowRight className="h-3 w-3" /></button>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-[#fffaf3] p-5 shadow-[0_5px_18px_rgba(174,116,50,0.05)] md:p-6"><div className="absolute -right-12 -top-12 h-32 w-32 rounded-full border-[18px] border-[#f5d59b]/25" /><div className="relative"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#4b3b2b]">Needs your attention</h2><span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f4c97f] px-1.5 text-[9px] font-bold text-[#5e411e]">{visibleFindings.length}</span></div><p className="mt-1 text-[11px] text-[#a99074]">Insights that may need a human review</p></div><ShieldAlert className="h-5 w-5 text-[#d99c4a]" strokeWidth={1.7} /></div><div className="mt-6 space-y-3"><button onClick={() => selectFinding(visibleFindings[0] ?? reviewFindings[0])} className="group w-full rounded-xl border border-[#f2e3ca] bg-white/70 p-3 text-left transition hover:border-[#e5bd7e] hover:bg-white"><div className="flex gap-3"><div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#ffe8dc] text-[#cd7357]"><AlertTriangle className="h-3.5 w-3.5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-[11px] font-bold text-[#5c4837]">Ambiguous termination clause</p><ArrowUpRight className="h-3 w-3 text-[#bda486] transition group-hover:text-[#9a6d3b]" /></div><p className="mt-1 truncate text-[10px] text-[#a28b73]">Acme Cloud · Section 8.2</p></div></div></button><button onClick={() => selectFinding(visibleFindings[1] ?? reviewFindings[1])} className="group w-full rounded-xl border border-[#f2e3ca] bg-white/70 p-3 text-left transition hover:border-[#e5bd7e] hover:bg-white"><div className="flex gap-3"><div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fff0cf] text-[#c89137]"><GitCompareArrows className="h-3.5 w-3.5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-[11px] font-bold text-[#5c4837]">Material version change</p><ArrowUpRight className="h-3 w-3 text-[#bda486] transition group-hover:text-[#9a6d3b]" /></div><p className="mt-1 truncate text-[10px] text-[#a28b73]">Northstar MSA · Liability cap</p></div></div></button><button onClick={() => selectFinding(visibleFindings[2] ?? reviewFindings[2])} className="group w-full rounded-xl border border-[#f2e3ca] bg-white/70 p-3 text-left transition hover:border-[#e5bd7e] hover:bg-white"><div className="flex gap-3"><div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e6efff] text-[#607dcc]"><CircleHelp className="h-3.5 w-3.5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-[11px] font-bold text-[#5c4837]">Missing effective date</p><ArrowUpRight className="h-3 w-3 text-[#bda486] transition group-hover:text-[#9a6d3b]" /></div><p className="mt-1 truncate text-[10px] text-[#a28b73]">Mosaic Studio SOW #03 · Cover</p></div></div></button></div><button onClick={() => setActiveNav("Review queue")} className="mt-5 flex items-center gap-1.5 text-[11px] font-bold text-[#a06b2c] hover:text-[#704619]">Open review queue <ArrowRight className="h-3 w-3" /></button></div></div>
            </section>

            <section className="mt-5 rounded-2xl border border-[#e7edf1] bg-white shadow-[0_5px_18px_rgba(34,52,68,0.025)]">
              <div className="flex flex-col justify-between gap-3 border-b border-[#edf1f4] px-5 py-5 md:flex-row md:items-center md:px-6"><div><h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#243648]">Recent contracts</h2><p className="mt-1 text-[11px] text-[#8b99a5]">Your latest documents and their current intelligence status</p></div><div className="flex items-center gap-2"><button onClick={() => setStatusFilter(statusFilter === "All statuses" ? "Active" : statusFilter === "Active" ? "Renewal soon" : "All statuses")} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#e4eaf0] px-2.5 text-[10px] font-semibold text-[#6f8190] hover:bg-[#f7f9fb]"><SlidersHorizontal className="h-3.5 w-3.5" /> {statusFilter === "All statuses" ? "Filter" : statusFilter}</button><button onClick={() => fileInputRef.current?.click()} className="flex h-8 items-center gap-1.5 rounded-lg bg-[#183448] px-3 text-[10px] font-bold text-white hover:bg-[#24465d]"><Plus className="h-3.5 w-3.5" /> Add contract</button></div></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b border-[#f0f3f5] text-[9px] font-bold uppercase tracking-[0.12em] text-[#a0acb5]"><th className="px-6 py-3 font-bold">Contract</th><th className="px-4 py-3 font-bold">Last updated</th><th className="px-4 py-3 font-bold">Status</th><th className="px-4 py-3 font-bold">Review</th><th className="px-6 py-3" /></tr></thead><tbody>{visibleContracts.map((contract) => <tr key={contract.name} className="group border-b border-[#f0f3f5] last:border-0 hover:bg-[#fbfcfd]"><td className="px-6 py-3.5"><div className="flex items-center gap-3"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[10px] font-bold ${contract.color}`}>{contract.icon}</div><div className="min-w-0"><p className="truncate text-[12px] font-bold text-[#33485b]">{contract.name}</p><p className="mt-0.5 truncate text-[10px] text-[#91a0ab]">{contract.type} · {contract.parties}</p></div></div></td><td className="px-4 py-3.5 text-[10px] font-medium text-[#81919e]">{contract.updated}</td><td className="px-4 py-3.5"><StatusPill tone={contract.status === "Active" ? "green" : contract.status === "Renewal soon" ? "amber" : "blue"}>{contract.status}</StatusPill></td><td className="px-4 py-3.5"><span className={`text-[10px] font-semibold ${contract.risk === "Clear" ? "text-[#278369]" : contract.risk === "Pending" ? "text-[#9aa7b0]" : "text-[#bc6a55]"}`}>{contract.risk}</span></td><td className="px-6 py-3.5 text-right"><button onClick={() => { setActiveNav("Contracts"); showToast(`${contract.name} selected for review`); }} className="rounded-lg p-1.5 text-[#abb6be] opacity-0 transition hover:bg-[#f0f4f6] hover:text-[#506474] group-hover:opacity-100" aria-label={`Open actions for ${contract.name}`}><MoreHorizontal className="h-4 w-4" /></button></td></tr>)}</tbody></table>{visibleContracts.length === 0 && <div className="px-6 py-10 text-center text-[12px] text-[#8998a4]">No contracts match “{query}”.</div>}</div>
            </section>

            <section id="ask-lens" className="mt-5 overflow-hidden rounded-2xl border border-[#d6e9e3] bg-[#f0faf6] p-5 md:p-6"><div className="flex flex-col gap-5 md:flex-row md:items-center"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#c8f2e4] text-[#267d6b]"><Sparkles className="h-5 w-5" strokeWidth={1.8} /></div><div className="min-w-0 flex-1"><h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#23463f]">Ask ContractLens anything</h2><p className="mt-1 text-[11px] text-[#6f9188]">Get a plain-language answer grounded in your contracts, with a source for every claim.</p></div><div className="w-full md:max-w-[470px]"><div className="flex h-11 items-center gap-2 rounded-xl border border-[#cfe4dd] bg-white px-3 shadow-[0_3px_10px_rgba(53,126,106,0.05)] focus-within:border-[#8fceb9]"><Paperclip className="h-4 w-4 shrink-0 text-[#9ab9b0]" /><input value={question} onChange={(event) => { setQuestion(event.target.value); setShowAnswer(false); }} onKeyDown={(event) => { if (event.key === "Enter") handleQuestion(); }} placeholder="Ask about a term, date, or obligation..." className="min-w-0 flex-1 bg-transparent text-[11px] text-[#29483f] outline-none placeholder:text-[#9eb5ae]" /><button onClick={() => handleQuestion()} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#183f3c] text-white transition hover:bg-[#245e55]" aria-label="Ask ContractLens"><ArrowRight className="h-3.5 w-3.5" /></button></div></div></div>{!showAnswer && <div className="mt-4 flex flex-wrap gap-2 pl-0 md:pl-16">{questionSuggestions.map((suggestion) => <button key={suggestion} onClick={() => handleQuestion(suggestion)} className="rounded-full border border-[#d4e9e1] bg-white/70 px-3 py-1.5 text-[10px] font-medium text-[#63877d] transition hover:border-[#a9d5c7] hover:bg-white">{suggestion}</button>)}</div>}{showAnswer && <div className="mt-5 rounded-xl border border-[#d4e9e1] bg-white/85 p-4 md:ml-16"><div className="flex items-start gap-3"><div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#e1f6ef] text-[#2c806d]"><Check className="h-3.5 w-3.5" /></div><div><p className="text-[11px] font-semibold text-[#31564c]">Based on 3 clauses across 2 contracts</p><p className="mt-1.5 text-[12px] leading-relaxed text-[#58766e]">{question.toLowerCase().includes("renew") ? <>Northstar Logistics renews automatically unless written notice is sent during the <span className="font-bold text-[#31564c]">30-day notice window</span> opening November 2.</> : question.toLowerCase().includes("breach") ? <>Acme Cloud requires notice of a confirmed data breach within <span className="font-bold text-[#31564c]">72 hours</span>, while Orbit Analytics requires notice without undue delay.</> : <>The Acme Cloud agreement allows termination for convenience with <span className="font-bold text-[#31564c]">30 days’ written notice</span>. Northstar requires 60 days and only permits convenience termination after the initial term.</>}</p><button onClick={() => setActiveNav("Contracts")} className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-[#36806f]">View cited clauses <ArrowUpRight className="h-3 w-3" /></button></div></div></div>}</section>

            {openFinding && <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#102333]/35 p-5 backdrop-blur-[2px]" onClick={() => setOpenFinding(null)}><div className="w-full max-w-lg rounded-2xl border border-[#e4eaf0] bg-white p-6 shadow-[0_24px_70px_rgba(22,42,58,0.2)]" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${openFinding.tone === "rose" ? "bg-[#ffe8dc] text-[#cd7357]" : openFinding.tone === "amber" ? "bg-[#fff0cf] text-[#c89137]" : "bg-[#e6efff] text-[#607dcc]"}`}><openFinding.icon className="h-5 w-5" /></div><div><div className="flex items-center gap-2"><h2 className="text-[15px] font-bold text-[#304356]">{openFinding.title}</h2><StatusPill tone={openFinding.tone === "rose" ? "rose" : openFinding.tone === "amber" ? "amber" : "blue"}>{openFinding.severity}</StatusPill></div><p className="mt-1 text-[11px] text-[#8b99a5]">{openFinding.contract} · {openFinding.reference}</p></div></div><button onClick={() => setOpenFinding(null)} className="rounded-lg p-1.5 text-[#9ba9b3] hover:bg-[#f4f7f9] hover:text-[#42586a]" aria-label="Close finding"><X className="h-4 w-4" /></button></div><div className="mt-5 rounded-xl border border-[#edf1f4] bg-[#f8fafb] p-4"><p className="text-[12px] leading-relaxed text-[#5b6e7e]">{openFinding.description}</p><div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-[#67838a]"><FileCheck2 className="h-3.5 w-3.5 text-[#62a895]" /> Source trace available · page 7 · clause {openFinding.reference.split("·")[0]}</div></div><div className="mt-5 flex justify-end gap-2"><button onClick={() => setOpenFinding(null)} className="rounded-lg border border-[#e1e8ed] px-3 py-2 text-[10px] font-bold text-[#70818e] hover:bg-[#f7f9fb]">Keep open</button><button onClick={() => resolveFinding(openFinding.id)} className="rounded-lg bg-[#183448] px-3 py-2 text-[10px] font-bold text-white hover:bg-[#24465d]"><Check className="mr-1 inline h-3.5 w-3.5" />Mark reviewed</button></div></div></div>}
            {helpOpen && <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#102333]/35 p-5 backdrop-blur-[2px]" onClick={() => setHelpOpen(false)}><div className="w-full max-w-md rounded-2xl border border-[#e4eaf0] bg-white p-6 shadow-[0_24px_70px_rgba(22,42,58,0.2)]" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#438b7d]"><Sparkles className="h-4 w-4" /> Lens intelligence</div><h2 className="mt-2 text-[18px] font-bold tracking-[-0.03em] text-[#304356]">How ContractLens works</h2></div><button onClick={() => setHelpOpen(false)} className="rounded-lg p-1.5 text-[#9ba9b3] hover:bg-[#f4f7f9]" aria-label="Close help"><X className="h-4 w-4" /></button></div><div className="mt-5 space-y-3">{["Upload a contract and preserve its sections, pages, and clause boundaries.", "Extract facts and obligations with confidence tied to the source text.", "Review risks and ask questions with every answer linked back to a clause."].map((step, index) => <div key={step} className="flex gap-3 rounded-xl bg-[#f7fafb] p-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c8f2e4] text-[10px] font-bold text-[#277b6b]">{index + 1}</span><p className="text-[11px] leading-relaxed text-[#607484]">{step}</p></div>)}</div><button onClick={() => setHelpOpen(false)} className="mt-5 w-full rounded-xl bg-[#183448] py-2.5 text-[11px] font-bold text-white hover:bg-[#24465d]">Got it</button></div></div>}
            {toast && <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#183448] px-4 py-3 text-[11px] font-semibold text-white shadow-[0_12px_30px_rgba(22,52,72,0.2)]"><CheckCircle2 className="h-4 w-4 text-[#91e8cb]" />{toast}</div>}
            <footer className="flex flex-col items-center justify-between gap-3 px-1 pb-2 pt-7 text-[10px] text-[#9aa7b1] sm:flex-row"><div className="flex items-center gap-2"><LockKeyhole className="h-3 w-3" /> Your workspace is private and encrypted</div><div className="flex items-center gap-4"><button onClick={() => setHelpOpen(true)} className="hover:text-[#59716f]">Help center</button><button onClick={() => showToast("Privacy controls are managed by your workspace admin")} className="hover:text-[#59716f]">Privacy</button><span>ContractLens v0.1</span></div></footer>
          </div>
        </main>
      </div>
    </div>
  );
}
