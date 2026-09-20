import { ArrowUpRight, CheckCircle2, ExternalLink, FileCheck2, ShieldAlert } from "lucide-react";

export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "rose" | "blue" | "purple" }) {
  const tones = { neutral: "bg-[#f1f4f7] text-[#617082]", green: "bg-[#e2f7ee] text-[#147a5d]", amber: "bg-[#fff2d8] text-[#a86816]", rose: "bg-[#ffe7e6] text-[#b74d55]", blue: "bg-[#e8efff] text-[#4765bd]", purple: "bg-[#f1edff] text-[#816bc6]" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${tones[tone]}`}>{children}</span>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <section className="relative overflow-hidden rounded-[24px] bg-[#183448] px-6 py-7 shadow-[0_16px_34px_rgba(25,52,72,0.10)] md:px-8 md:py-8"><div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[42px] border-[#8ae3c7]/[0.07]" /><div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center"><div><div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8fdcc7]"><span className="h-1.5 w-1.5 rounded-full bg-[#8fdcc7]" />{eyebrow}</div><h1 className="text-[28px] font-semibold tracking-[-0.04em] text-white md:text-[34px]">{title}<span className="text-[#91e8cb]">.</span></h1><p className="mt-2 max-w-[560px] text-[13px] leading-relaxed text-[#a9bac6]">{description}</p></div>{action && <div className="relative">{action}</div>}</div></section>;
}

export function SourceBadge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f0f5f6] px-2 py-1 text-[10px] font-semibold text-[#69818a]"><FileCheck2 className="h-3 w-3 text-[#65aa96]" />{children}</span>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-[#d7e1e6] bg-white p-10 text-center"><ShieldAlert className="mx-auto h-8 w-8 text-[#b8c7ce]" /><h3 className="mt-3 text-[14px] font-bold text-[#34495a]">{title}</h3><p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-[#8b9aa5]">{description}</p></div>;
}

export function MetricCard({ label, value, detail, icon: Icon, tone = "mint", onClick }: { label: string; value: string; detail: string; icon: React.ElementType; tone?: "mint" | "blue" | "peach" | "lilac"; onClick?: () => void }) {
  const colors = { mint: "bg-[#e5f8f1] text-[#25866d]", blue: "bg-[#eaf0ff] text-[#526ec4]", peach: "bg-[#fff0e8] text-[#c26851]", lilac: "bg-[#f1edff] text-[#816bc6]" };
  return <button onClick={onClick} className="group w-full rounded-2xl border border-[#e7edf1] bg-white p-4 text-left shadow-[0_5px_18px_rgba(34,52,68,0.025)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(34,52,68,0.06)] md:p-5"><div className="flex items-start justify-between"><div className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${colors[tone]}`}><Icon className="h-4 w-4" strokeWidth={1.9} /></div><ArrowUpRight className="h-3.5 w-3.5 text-[#b7c1ca] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#6d9f93]" /></div><div className="mt-4 text-[24px] font-semibold tracking-[-0.04em] text-[#203244] md:text-[26px]">{value}</div><div className="mt-0.5 text-[11px] font-medium text-[#778795]">{label}</div><div className="mt-3 text-[10px] font-semibold text-[#7d909e]">{detail}</div></button>;
}

export function SectionTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#243648]">{title}</h2>{description && <p className="mt-1 text-[11px] text-[#8b99a5]">{description}</p>}</div>{action}</div>;
}
