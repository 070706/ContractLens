import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { supabase, DEMO_WORKSPACE_ID } from "@/lib/supabase";
import { ActivityItem, AlertItem, Clause, Contract, ContractVersion, Obligation, WorkspaceMember, WorkspaceSettings } from "./ContractLensData";

type Row = Record<string, any>;

interface ContractLensContextValue {
  contracts: Contract[];
  obligations: Obligation[];
  alerts: AlertItem[];
  clauses: Clause[];
  versions: ContractVersion[];
  activities: ActivityItem[];
  member: WorkspaceMember | null;
  settings: WorkspaceSettings | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addContract: (contract: Omit<Contract, "updated">) => Promise<Contract | null>;
  completeObligation: (id: string) => Promise<void>;
  markAlertRead: (id: string) => Promise<void>;
  dismissAlert: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<WorkspaceSettings>) => Promise<void>;
}

const ContractLensContext = createContext<ContractLensContextValue | null>(null);

const displayDate = (value: string | null | undefined) => value ? format(new Date(`${value.slice(0, 10)}T00:00:00`), "MMM dd, yyyy") : null;
const displayTime = (value: string | null | undefined) => value ? format(new Date(value), "MMM dd, yyyy · h:mm a") : "";

function mapContract(row: Row): Contract {
  return { id: row.id, name: row.name, type: row.contract_type, parties: row.parties, status: row.status, risk: row.risk, effectiveDate: displayDate(row.effective_date), expiration: displayDate(row.expiration_date), renewal: displayDate(row.renewal_date), updated: displayTime(row.updated_at), icon: row.icon, color: row.color_class };
}
function mapObligation(row: Row): Obligation {
  return { id: row.id, contractId: row.contract_id, party: row.party, title: row.title, deadline: displayDate(row.deadline), frequency: row.frequency, priority: row.priority, status: row.status, source: row.source_reference };
}

export function ContractLensProvider({ children }: { children: React.ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [versions, setVersions] = useState<ContractVersion[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [member, setMember] = useState<WorkspaceMember | null>(null);
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    const [contractsResult, obligationsResult, alertsResult, clausesResult, versionsResult, activitiesResult, memberResult, settingsResult] = await Promise.all([
      supabase.from("contracts").select("*").eq("workspace_id", DEMO_WORKSPACE_ID).order("updated_at", { ascending: false }),
      supabase.from("obligations").select("*").eq("workspace_id", DEMO_WORKSPACE_ID).order("deadline", { ascending: true }),
      supabase.from("alerts").select("*").eq("workspace_id", DEMO_WORKSPACE_ID).is("dismissed_at", null).order("created_at", { ascending: false }),
      supabase.from("contract_clauses").select("*").order("page_number", { ascending: true }),
      supabase.from("contract_versions").select("*").order("version_date", { ascending: false }),
      supabase.from("activities").select("*").eq("workspace_id", DEMO_WORKSPACE_ID).order("created_at", { ascending: false }).limit(20),
      supabase.from("workspace_members").select("*").eq("workspace_id", DEMO_WORKSPACE_ID).limit(1).maybeSingle(),
      supabase.from("workspace_settings").select("*").eq("workspace_id", DEMO_WORKSPACE_ID).maybeSingle(),
    ]);
    const failed = [contractsResult, obligationsResult, alertsResult, clausesResult, versionsResult, activitiesResult, memberResult, settingsResult].find((result) => result.error);
    if (failed?.error) setError(failed.error.message);
    setContracts((contractsResult.data ?? []).map(mapContract));
    setObligations((obligationsResult.data ?? []).map(mapObligation));
    setAlerts((alertsResult.data ?? []).map((row: Row) => ({ id: row.id, type: row.alert_type, title: row.title, detail: row.detail, contractId: row.contract_id, read: row.is_read })));
    setClauses((clausesResult.data ?? []).map((row: Row) => ({ id: row.id, contractId: row.contract_id, number: row.clause_number, title: row.title, category: row.category, risk: row.risk, page: row.page_number, text: row.source_text, humanReviewRequired: row.human_review_required })));
    setVersions((versionsResult.data ?? []).map((row: Row) => ({ id: row.id, contractId: row.contract_id, label: row.version_label, date: displayDate(row.version_date) ?? "", current: row.is_current })));
    setActivities((activitiesResult.data ?? []).map((row: Row) => ({ id: row.id, action: row.action, detail: row.detail, time: displayTime(row.created_at), icon: row.icon })));
    const memberRow = memberResult.data as Row | null;
    setMember(memberRow ? { name: memberRow.name, email: memberRow.email, role: memberRow.role, team: memberRow.team, initials: memberRow.initials } : null);
    const settingsRow = settingsResult.data as Row | null;
    setSettings(settingsRow ? { notificationDays: settingsRow.notification_days, organization: settingsRow.organization, aiSummaryStyle: settingsRow.ai_summary_style } : null);
    setLoading(false);
  };

  useEffect(() => { void refresh(); }, []);

  const value = useMemo<ContractLensContextValue>(() => ({
    contracts,
    obligations,
    alerts,
    clauses,
    versions,
    activities,
    member,
    settings,
    loading,
    error,
    refresh,
    addContract: async (contract) => {
      const { data, error: insertError } = await supabase.from("contracts").insert({ workspace_id: DEMO_WORKSPACE_ID, name: contract.name, contract_type: contract.type, parties: contract.parties, status: contract.status, risk: contract.risk, effective_date: contract.effectiveDate, expiration_date: contract.expiration, renewal_date: contract.renewal, icon: contract.icon, color_class: contract.color }).select().single();
      if (insertError || !data) { setError(insertError?.message ?? "Unable to add contract"); return null; }
      await refresh();
      return mapContract(data);
    },
    completeObligation: async (id) => { const { error: updateError } = await supabase.from("obligations").update({ status: "Completed", completed_at: new Date().toISOString() }).eq("id", id); if (updateError) setError(updateError.message); await refresh(); },
    markAlertRead: async (id) => { const { error: updateError } = await supabase.from("alerts").update({ is_read: true }).eq("id", id); if (updateError) setError(updateError.message); await refresh(); },
    dismissAlert: async (id) => { const { error: updateError } = await supabase.from("alerts").update({ dismissed_at: new Date().toISOString() }).eq("id", id); if (updateError) setError(updateError.message); await refresh(); },
    updateSettings: async (next) => { const payload: Row = {}; if (next.notificationDays) payload.notification_days = next.notificationDays; if (next.organization) payload.organization = next.organization; if (next.aiSummaryStyle) payload.ai_summary_style = next.aiSummaryStyle; const { error: updateError } = await supabase.from("workspace_settings").update(payload).eq("workspace_id", DEMO_WORKSPACE_ID); if (updateError) setError(updateError.message); await refresh(); },
  }), [activities, alerts, clauses, contracts, error, loading, member, obligations, refresh, settings, versions]);

  return <ContractLensContext.Provider value={value}>{children}</ContractLensContext.Provider>;
}

export function useContractLens() {
  const context = useContext(ContractLensContext);
  if (!context) throw new Error("useContractLens must be used inside ContractLensProvider");
  return context;
}
