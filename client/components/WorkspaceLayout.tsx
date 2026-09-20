import { Bell, BrainCircuit, FileText, LayoutDashboard, ListChecks, LogOut, Settings2, ShieldAlert, Sparkles, X, type LucideIcon } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useContractLens } from "./ContractLensContext";
import { loadWorkspaceShell, type WorkspaceNavigationItem, type WorkspaceShellContent } from "@/lib/workspace";

const iconMap: Record<string, LucideIcon> = { LayoutDashboard, FileText, ListChecks, ShieldAlert, Settings2 };

export default function WorkspaceLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { contracts, obligations, alerts, member, loading } = useContractLens();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shell, setShell] = useState<{ content: WorkspaceShellContent; navigation: WorkspaceNavigationItem[] } | null>(null);
  const [shellError, setShellError] = useState<string | null>(null);
  const unreadAlerts = alerts.filter((alert) => !alert.read).length;
  const inContract = location.pathname.startsWith("/contracts/");
  const contractCount = contracts.length;
  const obligationCount = obligations.filter((item) => item.status !== "Completed").length;
  const initials = member?.initials ?? user?.email?.slice(0, 2).toUpperCase() ?? "…";
  const displayName = member?.name ?? user?.user_metadata?.full_name ?? user?.email ?? "";
  const team = member?.team ?? user?.user_metadata?.team ?? "";

  useEffect(() => {
    let active = true;
    void loadWorkspaceShell().then((nextShell) => {
      if (active) setShell(nextShell);
    }).catch((error: Error) => {
      if (active) setShellError(error.message);
    });
    return () => { active = false; };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (shellError) return <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-6 text-center text-sm text-[#526575]">{shellError}</div>;
  if (!shell) return <div className="min-h-screen animate-pulse bg-[#f7f9fc]" />;

  const renderNavigation = (mobile = false) => {
    const workspaceNavigation = shell.navigation.filter((item) => item.section === "workspace");
    const manageNavigation = shell.navigation.filter((item) => item.section === "manage");
    const renderItem = (item: WorkspaceNavigationItem) => {
      const Icon = iconMap[item.icon_name] ?? FileText;
      return <NavLink key={item.id} to={item.path} onClick={() => setMobileOpen(false)} title={collapsed && !mobile ? item.label : undefined} className={({ isActive }) => `group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${isActive ? "bg-[#1e3444] text-[#d5faed] shadow-[inset_3px_0_0_#91e8cb]" : "text-[#9aabba] hover:bg-white/[0.06] hover:text-white"}`}><span className={`flex items-center gap-3 ${collapsed && !mobile ? "w-full justify-center" : ""}`}><Icon className="h-[17px] w-[17px] shrink-0 text-[#71879a]" strokeWidth={1.8} />{(!collapsed || mobile) && <span>{item.label}</span>}</span>{(!collapsed || mobile) && item.id === "contracts" && <span className="text-[11px] text-[#6f8496]">{loading ? "…" : contractCount}</span>}{(!collapsed || mobile) && item.id === "obligations" && <span className="text-[11px] text-[#6f8496]">{loading ? "…" : obligationCount}</span>}{(!collapsed || mobile) && item.id === "alerts" && unreadAlerts > 0 && <span className="rounded-full bg-[#edb873] px-1.5 py-0.5 text-[11px] font-bold text-[#302215]">{unreadAlerts}</span>}</NavLink>;
    };
    return <><div className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#71879a] ${collapsed && !mobile ? "px-0 text-center" : ""}`}>{collapsed && !mobile ? "•••" : shell.content.workspace_label}</div><nav className="space-y-1">{workspaceNavigation.map(renderItem)}</nav><div className={`mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#71879a] ${collapsed && !mobile ? "px-0 text-center" : ""}`}>{collapsed && !mobile ? "•••" : shell.content.manage_label}</div><nav className="space-y-1">{manageNavigation.map(renderItem)}</nav></>;
  };

  return <div className="min-h-screen bg-[#f7f9fc] text-[#162334]"><div className="flex min-h-screen">
    <aside className={`hidden shrink-0 flex-col bg-[#101c2b] px-4 py-5 text-white transition-[width] duration-200 lg:flex ${collapsed ? "w-[88px]" : "w-[248px]"}`}>
      <button onClick={() => setCollapsed((value) => !value)} title={collapsed ? "Expand navigation" : "Collapse navigation"} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} className={`mb-9 flex items-center rounded-xl px-3 text-left transition hover:bg-white/[0.06] ${collapsed ? "justify-center" : "gap-3"}`}><div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#c8f2e4] text-[#123d3a] shadow-[0_6px_16px_rgba(127,226,198,0.18)]"><div className="absolute -right-2 -top-2 h-6 w-6 rounded-full border-[5px] border-[#123d3a]/20" /><BrainCircuit className="relative h-[19px] w-[19px]" strokeWidth={2.2} /></div>{!collapsed && <div><div className="text-[15px] font-bold tracking-[-0.02em]">{shell.content.brand_name}</div><div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8094a4]">{shell.content.brand_tagline}</div></div>}</button>
      {renderNavigation()}
      <div className="mt-auto">{!collapsed && <Link to={shell.content.cta_link} className="mb-5 block rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3.5 transition hover:bg-white/[0.07]"><div className="mb-3 flex items-center justify-between"><span className="flex items-center gap-2 text-[11px] font-semibold text-[#c4d4df]"><Sparkles className="h-3.5 w-3.5 text-[#91e8cb]" />{shell.content.cta_title}</span><span className="rounded-full bg-[#c8f2e4]/15 px-2 py-0.5 text-[9px] font-bold text-[#91e8cb]">BETA</span></div><p className="text-[11px] leading-[1.55] text-[#8498a9]">{shell.content.cta_description}</p><span className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#b9efe0]">{shell.content.cta_link_label} <span>→</span></span></Link>}<div className={`border-t border-white/[0.08] pt-4 ${collapsed ? "space-y-3" : ""}`}><div className={`flex items-center gap-3 px-2 ${collapsed ? "justify-center" : ""}`}><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0d3c1] text-[11px] font-bold text-[#7c483a]">{initials}</div>{!collapsed && <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-semibold text-white">{displayName}</p><p className="truncate text-[10px] text-[#71879a]">{team}</p></div>}</div><button onClick={handleSignOut} title={shell.content.sign_out_label} className={`mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-bold text-[#9aabba] transition hover:bg-[#3a2630] hover:text-[#f4c1b6] ${collapsed ? "justify-center" : ""}`}><LogOut className="h-3.5 w-3.5" />{!collapsed && shell.content.sign_out_label}</button></div></div>
    </aside>
    {mobileOpen && <div className="fixed inset-0 z-40 bg-[#102333]/35 lg:hidden" onClick={() => setMobileOpen(false)}><aside className="h-full w-[270px] bg-[#101c2b] px-4 py-5 text-white shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-8 flex items-center justify-between"><Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c8f2e4] text-[#123d3a]"><BrainCircuit className="h-[19px] w-[19px]" /></div><span className="text-[15px] font-bold">contractlens</span></Link><button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-[#9aabba] hover:bg-white/[0.06]" aria-label="Close navigation"><X className="h-4 w-4" /></button></div>{renderNavigation(true)}<button onClick={handleSignOut} className="mt-8 flex items-center gap-2 border-t border-white/[0.08] pt-4 text-[11px] font-bold text-[#9aabba]"><LogOut className="h-3.5 w-3.5" />{shell.content.sign_out_label}</button></aside></div>}
    <main className="min-w-0 flex-1"><header className="flex h-[72px] items-center justify-between border-b border-[#e8edf2] bg-white/90 px-5 backdrop-blur md:px-8"><button onClick={() => setMobileOpen(true)} className="flex items-center gap-2 lg:hidden" aria-label="Open navigation"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c8f2e4] text-[#123d3a]"><BrainCircuit className="h-4 w-4" /></div><span className="text-[14px] font-bold text-[#183448]">contractlens</span></button><div className="hidden items-center gap-2 text-[12px] font-medium text-[#8492a0] md:flex"><span>{shell.content.workspace_label}</span><span className="text-[#c1cbd3]">/</span><span className="text-[#233345]">{inContract ? title : title}</span></div><div className="ml-auto flex items-center gap-3"><Link to="/contracts" className="hidden h-9 w-[260px] items-center gap-2.5 rounded-xl border border-[#e4eaf0] bg-[#f8fafc] px-3.5 text-[12px] text-[#a4b0ba] sm:flex"><span className="text-[#9ba9b5]">⌕</span> {shell.content.search_placeholder} <span className="ml-auto text-[10px]">{shell.content.shortcut_label}</span></Link><NavLink to="/alerts" aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#e4eaf0] text-[#708091] hover:bg-[#f8fafc]"><Bell className="h-[16px] w-[16px]" strokeWidth={1.8} />{unreadAlerts > 0 && <span className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#ed8d79] ring-2 ring-white" />}</NavLink><div className="hidden h-8 w-px bg-[#e8edf2] md:block" /><Link to="/settings" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0d3c1] text-[10px] font-bold text-[#7c483a]">{initials}</Link></div></header><div className="mx-auto max-w-[1440px] p-5 md:p-8">{children}</div></main>
  </div></div>;
}
