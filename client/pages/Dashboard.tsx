import { AlertTriangle, ArrowRight, BarChart3, CalendarClock, CheckCircle2, Clock3, FileText, FolderOpen, GitCompareArrows, ListChecks, ShieldAlert, Sparkles, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { useAuth } from "@/components/AuthContext";
import { useContractLens } from "@/components/ContractLensContext";
import { MetricCard, PageHeader, SectionTitle, StatusPill } from "@/components/MvpUi";
import { loadDashboardContent, type DashboardContent, type DashboardMetric } from "@/lib/dashboard";

const iconMap: Record<string, LucideIcon> = { FolderOpen, CheckCircle2, Clock3, ListChecks, AlertTriangle, ShieldAlert };

export default function Dashboard() {
  const { user } = useAuth();
  const { contracts, obligations, alerts, clauses, activities, loading } = useContractLens();
  const [content, setContent] = useState<DashboardContent | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void loadDashboardContent().then((dashboard) => {
      if (active) {
        setContent(dashboard.content);
        setMetrics(dashboard.metrics);
      }
    }).catch((error: Error) => {
      if (active) setContentError(error.message);
    });
    return () => { active = false; };
  }, []);

  const pending = obligations.filter((item) => item.status === "Pending").length;
  const overdue = obligations.filter((item) => item.status === "Overdue").length;
  const activeContracts = contracts.filter((item) => item.status === "Active").length;
  const expiringSoon = contracts.filter((item) => item.status === "Renewal soon").length;
  const reviewItems = clauses.filter((item) => item.humanReviewRequired).length;
  const totalContracts = contracts.length;
  const activePercent = totalContracts ? Math.round(activeContracts / totalContracts * 100) : 0;
  const renewalPercent = totalContracts ? Math.round(expiringSoon / totalContracts * 100) : 0;
  const processingPercent = Math.max(0, 100 - activePercent - renewalPercent);
  const totalObligations = obligations.length;
  const completedPercent = totalObligations ? Math.round(obligations.filter((item) => item.status === "Completed").length / totalObligations * 100) : 0;
  const pendingPercent = totalObligations ? Math.round(pending / totalObligations * 100) : 0;
  const overduePercent = Math.max(0, 100 - completedPercent - pendingPercent);
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";
  const metricValues: Record<string, number> = { totalContracts, activeContracts, expiringSoon, pendingObligations: pending, overdueObligations: overdue, reviewItems };
  const metricDetails: Record<string, string> = { totalContracts: `${totalContracts}`, activeContracts: `${activePercent}%`, expiringSoon: `${expiringSoon}`, pendingObligations: `${pending}`, overdueObligations: `${overdue}`, reviewItems: `${reviewItems}` };
  const renewals = useMemo(() => contracts.filter((contract) => contract.renewal).slice(0, 3), [contracts]);
  const attentionItems = useMemo(() => alerts.filter((alert) => alert.type === "Review" || alert.type === "Overdue").slice(0, 3), [alerts]);

  if (contentError) return <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-6 text-center text-sm text-[#526575]">{contentError}</div>;
  if (!content) return <div className="min-h-screen animate-pulse bg-[#f7f9fc]" />;

  return <WorkspaceLayout title={content.title_template.replace("{name}", displayName)}><PageHeader eyebrow={content.eyebrow} title={content.title_template.replace("{name}", displayName)} description={content.description} action={<Link to="/contracts/upload" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#c8f2e4] px-4 text-[12px] font-bold text-[#123d3a] hover:bg-[#e0faf1]">{content.upload_label} <ArrowRight className="h-4 w-4" /></Link>} />
    <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{metrics.map((metric) => { const Icon = iconMap[metric.icon_name] ?? FileText; return <MetricCard key={metric.id} label={metric.label} value={loading ? "…" : String(metricValues[metric.metric_key] ?? 0)} detail={metricDetails[metric.metric_key] ?? metric.detail} icon={Icon} tone={metric.tone} />; })}</section>
    <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><div className="rounded-2xl border border-[#e7edf1] bg-white p-5 shadow-[0_5px_18px_rgba(34,52,68,0.025)] md:p-6"><SectionTitle title={content.deadlines_title} description={content.deadlines_description} action={<Link to="/obligations" className="text-[10px] font-bold text-[#3b8272]">View all →</Link>} /><div className="mt-5 divide-y divide-[#edf1f4]">{obligations.slice(0, 4).map((item) => { const deadline = item.deadline ?? "—"; const parts = deadline.split(" "); return <div key={item.id} className="flex items-center gap-3 py-3.5 first:pt-0"><div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-[#f7f9fb] text-center leading-none"><span className="text-[8px] font-bold text-[#98a5b0]">{parts[0]}</span><span className="mt-1 text-[14px] font-bold text-[#384b5d]">{parts[1]?.replace(",", "")}</span></div><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-semibold text-[#304356]">{item.title}</p><p className="mt-1 truncate text-[10px] text-[#8c9ba7]">{item.party} · {item.source}</p></div><StatusPill tone={item.priority === "High" ? "rose" : item.priority === "Medium" ? "amber" : "blue"}>{item.priority}</StatusPill></div>; })}</div></div><div className="rounded-2xl border border-[#e7edf1] bg-white p-5 shadow-[0_5px_18px_rgba(34,52,68,0.025)] md:p-6"><SectionTitle title={content.renewals_title} description={content.renewals_description} /><div className="mt-5 space-y-3">{renewals.map((contract) => <Link key={contract.id} to={`/contracts/${contract.id}`} className="block rounded-xl border border-[#f2e3ca] bg-[#fffaf3] p-4"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#b17a32]">{contract.status}</span><CalendarClock className="h-4 w-4 text-[#d49a4a]" /></div><p className="mt-3 text-[12px] font-bold text-[#5c4837]">{contract.name}</p><p className="mt-1 text-[10px] text-[#a28b73]">{contract.renewal}</p></Link>)}</div></div></section>
    <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]"><div className="rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6"><SectionTitle title={content.contracts_title} description={content.contracts_description} action={<Link to="/contracts" className="text-[10px] font-bold text-[#3b8272]">Open portfolio →</Link>} /><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[540px] text-left"><thead><tr className="border-b border-[#edf1f4] text-[9px] font-bold uppercase tracking-[0.12em] text-[#a0acb5]"><th className="pb-3">Contract</th><th className="pb-3">Status</th><th className="pb-3">Risk</th></tr></thead><tbody>{contracts.slice(0, 4).map((contract) => <tr key={contract.id} className="border-b border-[#f0f3f5] last:border-0"><td className="py-3"><Link to={`/contracts/${contract.id}`} className="flex items-center gap-2.5"><div className={`flex h-8 w-8 items-center justify-center rounded-lg text-[9px] font-bold ${contract.color}`}>{contract.icon}</div><div><p className="text-[11px] font-bold text-[#33485b]">{contract.name}</p><p className="mt-0.5 text-[9px] text-[#91a0ab]">{contract.type}</p></div></Link></td><td><StatusPill tone={contract.status === "Active" ? "green" : contract.status === "Renewal soon" ? "amber" : "blue"}>{contract.status}</StatusPill></td><td className="text-[10px] font-semibold text-[#bc6a55]">{contract.risk}</td></tr>)}</tbody></table></div></div><div className="rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6"><SectionTitle title="Needs your attention" description="Potential risks surfaced by ContractLens" /><div className="mt-5 space-y-3">{attentionItems.map((alert) => <Link key={alert.id} to={alert.contractId ? `/contracts/${alert.contractId}?tab=risks` : "/alerts"} className="group block rounded-xl border border-[#f2e3ca] bg-[#fffaf3] p-3.5"><div className="flex gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#ffe8dc] text-[#cd7357]"><AlertTriangle className="h-3.5 w-3.5" /></div><div className="flex-1"><p className="text-[11px] font-bold text-[#5c4837]">{alert.title}</p><p className="mt-1 text-[10px] text-[#a28b73]">{alert.detail}</p></div><ArrowRight className="h-3.5 w-3.5 text-[#bda486]" /></div></Link>)}</div></div></section>
    <section className="mt-5 grid gap-5 lg:grid-cols-3"><div className="rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6"><SectionTitle title={content.status_title} /><div className="mt-5 flex items-center gap-5"><div className="relative flex h-28 w-28 items-center justify-center rounded-full" style={{ background: `conic-gradient(#5eaa95 0 ${activePercent}%, #e4a76b ${activePercent}% ${activePercent + renewalPercent}%, #829bd6 ${activePercent + renewalPercent}% 100%)` }}><div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-center"><div><div className="text-[20px] font-bold text-[#304758]">{loading ? "…" : contracts.length}</div><div className="text-[8px] font-bold uppercase text-[#9aa8b2]">total</div></div></div></div><div className="space-y-2 text-[10px] font-semibold text-[#70818e]"><div><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#5eaa95]" />Active {activePercent}%</div><div><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#e4a76b]" />Renewing {renewalPercent}%</div><div><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#829bd6]" />Processing {processingPercent}%</div></div></div></div><div className="rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6"><SectionTitle title={content.obligation_status_title} /><div className="mt-6 space-y-4">{[["Completed", completedPercent, "bg-[#6bb39d]"], ["Pending", pendingPercent, "bg-[#e7b16f]"], ["Overdue", overduePercent, "bg-[#da7d73]"]].map(([label, value, color]) => <div key={String(label)}><div className="mb-1.5 flex justify-between text-[10px] font-semibold text-[#718391]"><span>{label}</span><span>{value}%</span></div><div className="h-2 rounded-full bg-[#f0f3f5]"><div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} /></div></div>)}</div></div><div className="rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6"><SectionTitle title={content.activity_title} action={<BarChart3 className="h-4 w-4 text-[#9aa8b2]" />} /><div className="mt-4 space-y-3.5">{activities.map((item) => <div key={item.id} className="flex gap-2.5"><div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#e5f8f1] text-[#4d9e89]"><Sparkles className="h-3 w-3" /></div><div><p className="text-[10px] font-semibold text-[#536978]">{item.action}</p><p className="mt-0.5 text-[9px] text-[#9aa8b2]">{item.detail} · {item.time}</p></div></div>)}</div></div></section>
  </WorkspaceLayout>;
}
