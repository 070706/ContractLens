import { Bell, ChevronDown, FileText, LayoutDashboard, ListChecks, Settings2, ShieldAlert, Sparkles, BrainCircuit } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useContractLens } from "./ContractLensContext";

const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Contracts", path: "/contracts", icon: FileText },
  { label: "Obligations", path: "/obligations", icon: ListChecks },
  { label: "Alerts", path: "/alerts", icon: ShieldAlert },
];

export default function WorkspaceLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const location = useLocation();
  const { contracts, obligations, alerts, markAlertRead } = useContractLens();
  const unreadAlerts = alerts.filter((alert) => !alert.read).length;
  const inContract = location.pathname.startsWith("/contracts/");

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#162334]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[248px] shrink-0 flex-col bg-[#101c2b] px-4 py-5 text-white lg:flex">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 pb-9">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[#c8f2e4] text-[#123d3a]"><div className="absolute -right-2 -top-2 h-6 w-6 rounded-full border-[5px] border-[#123d3a]/20" /><BrainCircuit className="relative h-[19px] w-[19px]" strokeWidth={2.2} /></div>
            <div><div className="text-[15px] font-bold tracking-[-0.02em]">contractlens</div><div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8094a4]">contract intelligence</div></div>
          </Link>
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#71879a]">Workspace</div>
          <nav className="space-y-1">
            {navigation.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} className={({ isActive }) => `group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${isActive ? "bg-[#1e3444] text-[#d5faed] shadow-[inset_3px_0_0_#91e8cb]" : "text-[#9aabba] hover:bg-white/[0.06] hover:text-white"}`}><span className="flex items-center gap-3"><Icon className="h-[17px] w-[17px] text-[#71879a]" strokeWidth={1.8} />{label}</span>{label === "Contracts" && <span className="text-[11px] text-[#6f8496]">{contracts.length + 20}</span>}{label === "Obligations" && <span className="text-[11px] text-[#6f8496]">{obligations.filter((item) => item.status !== "Completed").length + 14}</span>}{label === "Alerts" && unreadAlerts > 0 && <span className="rounded-full bg-[#edb873] px-1.5 py-0.5 text-[11px] font-bold text-[#302215]">{unreadAlerts}</span>}</NavLink>)}
          </nav>
          <div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#71879a]">Manage</div>
          <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${isActive ? "bg-[#1e3444] text-[#d5faed]" : "text-[#9aabba] hover:bg-white/[0.06] hover:text-white"}`}><Settings2 className="h-[17px] w-[17px] text-[#71879a]" strokeWidth={1.8} />Settings</NavLink>
          <div className="mt-auto">
            <Link to="/contracts/upload" className="mb-5 block rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3.5 transition hover:bg-white/[0.07]"><div className="mb-3 flex items-center justify-between"><span className="flex items-center gap-2 text-[11px] font-semibold text-[#c4d4df]"><Sparkles className="h-3.5 w-3.5 text-[#91e8cb]" />Lens intelligence</span><span className="rounded-full bg-[#c8f2e4]/15 px-2 py-0.5 text-[9px] font-bold text-[#91e8cb]">BETA</span></div><p className="text-[11px] leading-[1.55] text-[#8498a9]">Upload a document and trace every insight to its clause.</p><span className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#b9efe0]">Upload a contract <span>→</span></span></Link>
            <div className="flex items-center gap-3 border-t border-white/[0.08] px-2 pt-4"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0d3c1] text-[11px] font-bold text-[#7c483a]">AS</div><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-semibold text-white">Avery Singh</p><p className="truncate text-[10px] text-[#71879a]">Operations team</p></div></div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-[#e8edf2] bg-white/90 px-5 backdrop-blur md:px-8"><div className="flex items-center gap-3 lg:hidden"><Link to="/dashboard" className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c8f2e4] text-[#123d3a]"><BrainCircuit className="h-4 w-4" /></div><span className="text-[14px] font-bold text-[#183448]">contractlens</span></Link></div><div className="hidden items-center gap-2 text-[12px] font-medium text-[#8492a0] md:flex"><span>Workspace</span><span className="text-[#c1cbd3]">/</span><span className="text-[#233345]">{inContract ? "Contract detail" : title}</span></div><div className="ml-auto flex items-center gap-3"><Link to="/contracts" className="hidden h-9 w-[260px] items-center gap-2.5 rounded-xl border border-[#e4eaf0] bg-[#f8fafc] px-3.5 text-[12px] text-[#a4b0ba] sm:flex"><span className="text-[#9ba9b5]">⌕</span> Search contracts... <span className="ml-auto text-[10px]">⌘ K</span></Link><div className="relative"><NavLink to="/alerts" className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#e4eaf0] text-[#708091] hover:bg-[#f8fafc]"><Bell className="h-[16px] w-[16px]" strokeWidth={1.8} />{unreadAlerts > 0 && <span className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#ed8d79] ring-2 ring-white" />}</NavLink></div><div className="hidden h-8 w-px bg-[#e8edf2] md:block" /><Link to="/settings" className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0d3c1] text-[10px] font-bold text-[#7c483a]">AS</div><ChevronDown className="hidden h-3.5 w-3.5 text-[#8c9aa6] sm:block" /></Link></div></header>
          <div className="mx-auto max-w-[1500px] px-5 pb-12 pt-6 md:px-8 md:pt-8 xl:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
