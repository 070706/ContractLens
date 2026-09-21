import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  GitCompareArrows,
  MessageSquareText,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { useContractLens } from "@/components/ContractLensContext";
import {
  PageHeader,
  SectionTitle,
  SourceBadge,
  StatusPill,
} from "@/components/MvpUi";

const tabs = [
  "Overview",
  "Clauses",
  "Obligations",
  "Timeline",
  "Risks",
  "Versions",
  "AI Assistant",
  "Sources",
  "Audit",
];

export default function ContractDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { contracts, obligations, completeObligation, extractions } =
    useContractLens();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const contract = contracts.find((item) => item.id === id) ?? contracts[0];
  const activeTab = searchParams.get("tab") ?? "Overview";
  const contractObligations = obligations.filter(
    (item) => item.contractId === contract.id,
  );
  const setTab = (tab: string) =>
    setSearchParams(
      tab === "Overview" ? {} : { tab: tab.toLowerCase().replace(" ", "-") },
    );
  const normalizedTab = activeTab
    .replace("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const currentTab = tabs.includes(activeTab)
    ? activeTab
    : (tabs.find((tab) => tab.toLowerCase().replace(" ", "-") === activeTab) ??
      "Overview");
  const ask = () => {
    if (!question.trim()) return;
    setAnswer(
      question.toLowerCase().includes("expire")
        ? "The agreement expires on December 31, 2026, unless ended earlier under Section 8."
        : question.toLowerCase().includes("payment")
          ? "Customer payments are due within thirty days of receiving an undisputed invoice."
          : "I found related language in Sections 7.4 and 8.2. The vendor must provide quarterly security reporting, and either party may terminate for convenience with written notice where a material business reason exists.",
    );
  };
  return (
    <WorkspaceLayout title="Contracts">
      <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold text-[#83939e]">
        <Link to="/contracts" className="hover:text-[#3b8272]">
          Contracts
        </Link>
        <ArrowRight className="h-3 w-3" />
        <span className="text-[#304758]">{contract.name}</span>
      </div>
      <PageHeader
        eyebrow="Contract detail"
        title={contract.name}
        description={`${contract.type} · ${contract.parties}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/contracts/upload?version=${contract.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 text-[11px] font-bold text-white hover:bg-white/[0.14]"
            >
              <FileText className="h-4 w-4" /> Upload version
            </Link>
            <Link
              to={`/compare?contract=${contract.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#c8f2e4] px-4 text-[11px] font-bold text-[#123d3a] hover:bg-[#e0faf1]"
            >
              <GitCompareArrows className="h-4 w-4" /> Compare
            </Link>
          </div>
        }
      />
      <div className="mt-5 flex gap-1 overflow-x-auto rounded-2xl border border-[#e7edf1] bg-white p-1.5 shadow-[0_5px_18px_rgba(34,52,68,0.025)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-[10px] font-bold transition md:px-4 ${currentTab === tab ? "bg-[#183448] text-white" : "text-[#7e909c] hover:bg-[#f4f8f9] hover:text-[#3f5666]"}`}
          >
            {tab}
          </button>
        ))}
      </div>
      {currentTab === "Overview" && (
        <Overview
          contract={contract}
          obligations={contractObligations}
          extraction={extractions[contract.id]}
        />
      )}
      {currentTab === "Clauses" && <Clauses contractId={contract.id} />}
      {currentTab === "Obligations" && (
        <ObligationsTab
          obligations={contractObligations}
          onComplete={completeObligation}
        />
      )}
      {currentTab === "Timeline" && (
        <Timeline obligations={contractObligations} />
      )}
      {currentTab === "Risks" && <Risks />}
      {currentTab === "Versions" && <Versions contractId={contract.id} />}
      {currentTab === "AI Assistant" && (
        <Assistant
          question={question}
          setQuestion={setQuestion}
          answer={answer}
          ask={ask}
        />
      )}
      {currentTab === "Sources" && <Sources contractId={contract.id} />}
      {currentTab === "Audit" && <Audit />}
    </WorkspaceLayout>
  );
}

function Overview({
  contract,
  obligations,
  extraction,
}: {
  contract: NonNullable<
    ReturnType<typeof useContractLens>["contracts"]
  >[number];
  obligations: ReturnType<typeof useContractLens>["obligations"];
  extraction:
    ReturnType<typeof useContractLens>["extractions"][string] | undefined;
}) {
  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-5">
        <div className="rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6">
          <SectionTitle title="Contract information" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Info label="Contract name" value={contract.name} />
            <Info label="Contract type" value={contract.type} />
            <Info
              label="Status"
              value={
                <StatusPill
                  tone={contract.status === "Active" ? "green" : "amber"}
                >
                  {contract.status}
                </StatusPill>
              }
            />
            <Info
              label="Risk level"
              value={
                <StatusPill
                  tone={
                    contract.risk === "High"
                      ? "rose"
                      : contract.risk === "Medium"
                        ? "amber"
                        : "green"
                  }
                >
                  {contract.risk}
                </StatusPill>
              }
            />
          </div>
        </div>
        <div className="rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6">
          <SectionTitle title="Parties" />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[#f7fafb] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#9aa8b2]">
                Vendor
              </p>
              <p className="mt-2 text-[11px] font-bold text-[#405768]">
                {contract.parties.split(" · ")[0]}
              </p>
            </div>
            <div className="rounded-xl bg-[#f7fafb] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#9aa8b2]">
                Customer
              </p>
              <p className="mt-2 text-[11px] font-bold text-[#405768]">
                Your company
              </p>
            </div>
            <div className="rounded-xl bg-[#f7fafb] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#9aa8b2]">
                Relationship
              </p>
              <p className="mt-2 text-[11px] font-bold text-[#405768]">
                {contract.type}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#d6e9e3] bg-[#f0faf6] p-5 md:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#c8f2e4] text-[#267d6b]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-[#23463f]">
                Executive summary
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[#64877d]">
                {extraction?.summary ||
                  "Analysis is not available for this contract yet."}
              </p>
              <div className="mt-3">
                <SourceBadge>
                  Sections 2.1, 7.4, 8.2 · Pages 3, 8, 10
                </SourceBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div className="rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6">
          <SectionTitle title="Important dates" />
          <div className="mt-5 space-y-3">
            {[
              [
                "Effective date",
                extraction?.dates.effective_date?.value ||
                  contract.effectiveDate ||
                  "Not specified",
              ],
              ["Expiration date", contract.expiration],
              [
                "Initial term",
                extraction?.dates.initial_term?.value || "Not specified",
              ],
              [
                "Renewal notice",
                extraction?.renewal.notice_period || "Not specified",
              ],
              [
                "Termination notice",
                extraction?.termination.notice_period || "Not specified",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-[#f0f3f5] pb-3 last:border-0 last:pb-0"
              >
                <span className="text-[11px] text-[#81919e]">{label}</span>
                <span className="text-[11px] font-bold text-[#405768]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6">
          <SectionTitle title="Payment terms" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Info
              label="Amount"
              value={extraction?.payment_terms.amount || "Not specified"}
            />
            <Info
              label="Currency"
              value={extraction?.payment_terms.currency || "Not specified"}
            />
            <Info
              label="Frequency"
              value={extraction?.payment_terms.frequency || "Not specified"}
            />
            <Info
              label="Due"
              value={
                extraction?.payment_terms.payment_period || "Not specified"
              }
            />
          </div>
        </div>
        <div className="rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6">
          <SectionTitle
            title="Required actions"
            action={
              <span className="rounded-full bg-[#e2f7ee] px-2 py-1 text-[9px] font-bold text-[#147a5d]">
                {obligations.length} tracked
              </span>
            }
          />
          <div className="mt-4 space-y-3">
            {obligations.slice(0, 3).map((item) => (
              <div key={item.id} className="flex gap-2.5">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#fff2d8] text-[#b57c31]">
                  <Clock3 className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#536978]">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[9px] text-[#9aa8b2]">
                    {item.party} · {item.deadline}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#9aa8b2]">
        {label}
      </p>
      <div className="mt-1.5 text-[11px] font-semibold text-[#405768]">
        {value}
      </div>
    </div>
  );
}
function Clauses({ contractId }: { contractId: string }) {
  const { clauses } = useContractLens();
  const [filter, setFilter] = useState("All");
  const filtered = clauses.filter(
    (clause) =>
      clause.contractId === contractId &&
      (filter === "All" || clause.category === filter),
  );
  return (
    <div className="mt-5 rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6">
      <SectionTitle
        title="Extracted clauses"
        description="Click any clause to verify its original text and source location."
        action={
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="h-8 rounded-lg border border-[#e4eaf0] bg-white px-2 text-[10px] font-bold text-[#718391]"
          >
            <option>All</option>
            {["Payment", "Renewal", "Termination", "SLA", "Liability"].map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
        }
      />
      <div className="mt-5 space-y-3">
        {filtered.map((clause) => (
          <details
            key={clause.id}
            className="group rounded-xl border border-[#edf1f4] bg-[#fbfcfd] p-4"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3">
              <span className="text-[10px] font-bold text-[#4d9a87]">
                Clause {clause.number}
              </span>
              <span className="flex-1 text-[12px] font-bold text-[#405768]">
                {clause.title}
              </span>
              <StatusPill
                tone={
                  clause.risk === "High"
                    ? "rose"
                    : clause.risk === "Medium"
                      ? "amber"
                      : "green"
                }
              >
                {clause.risk}
              </StatusPill>
              <span className="text-[10px] text-[#9aa8b2]">
                Page {clause.page}
              </span>
            </summary>
            <div className="mt-4 border-t border-[#e8eef0] pt-4">
              <p className="text-[12px] leading-relaxed text-[#637785]">
                {clause.text}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <SourceBadge>
                  Page {clause.page} · Section {clause.number}
                </SourceBadge>
                <span className="text-[10px] font-bold text-[#c16e5b]">
                  {clause.risk === "High"
                    ? "Human review required"
                    : "AI extracted"}
                </span>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
function ObligationsTab({
  obligations,
  onComplete,
}: {
  obligations: ReturnType<typeof useContractLens>["obligations"];
  onComplete: (id: string) => void;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6">
      <SectionTitle
        title="Contract obligations"
        description="Actions attributed to each party with source references."
      />
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-[#edf1f4] text-[9px] font-bold uppercase tracking-[0.12em] text-[#a0acb5]">
              <th className="pb-3">Party</th>
              <th className="pb-3">Obligation</th>
              <th className="pb-3">Deadline</th>
              <th className="pb-3">Frequency</th>
              <th className="pb-3">Priority</th>
              <th className="pb-3">Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {obligations.map((item) => (
              <tr
                key={item.id}
                className="border-b border-[#f0f3f5] last:border-0"
              >
                <td className="py-4 text-[10px] font-bold text-[#536978]">
                  {item.party}
                </td>
                <td className="py-4 text-[11px] font-semibold text-[#405768]">
                  {item.title}
                  <div className="mt-1 text-[9px] font-normal text-[#9aa8b2]">
                    {item.source}
                  </div>
                </td>
                <td className="py-4 text-[10px] text-[#81919e]">
                  {item.deadline}
                </td>
                <td className="py-4 text-[10px] text-[#81919e]">
                  {item.frequency}
                </td>
                <td className="py-4">
                  <StatusPill
                    tone={
                      item.priority === "High"
                        ? "rose"
                        : item.priority === "Medium"
                          ? "amber"
                          : "blue"
                    }
                  >
                    {item.priority}
                  </StatusPill>
                </td>
                <td className="py-4">
                  <StatusPill
                    tone={
                      item.status === "Completed"
                        ? "green"
                        : item.status === "Overdue"
                          ? "rose"
                          : "amber"
                    }
                  >
                    {item.status}
                  </StatusPill>
                </td>
                <td className="py-4">
                  {item.status !== "Completed" && (
                    <button
                      onClick={() => onComplete(item.id)}
                      className="rounded-lg border border-[#dcebe6] px-2 py-1.5 text-[9px] font-bold text-[#418675] hover:bg-[#effaf6]"
                    >
                      Mark complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Timeline({
  obligations,
}: {
  obligations: ReturnType<typeof useContractLens>["obligations"];
}) {
  return (
    <div className="mt-5 rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-7">
      <SectionTitle
        title="Contract timeline"
        description="Calculated from extracted dates and notice periods."
      />
      <div className="relative mt-8 space-y-7 pl-8 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-[#c8e7dd]">
        {[
          {
            title: "Contract signed",
            detail: "January 01, 2024",
            icon: CheckCircle2,
          },
          ...obligations.slice(0, 3).map((item) => ({
            title: item.title,
            detail: item.deadline,
            icon: CalendarClock,
          })),
          { title: "Expiration", detail: "December 31, 2026", icon: FileText },
        ].map((event, index) => (
          <div
            key={`${event.title}-${index}`}
            className="relative flex items-center gap-4"
          >
            <div className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full border-4 border-white bg-[#c8f2e4] text-[#31836f]">
              <event.icon className="h-3 w-3" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#405768]">
                {event.title}
              </p>
              <p className="mt-1 text-[10px] text-[#8c9ba7]">{event.detail}</p>
            </div>
            <span className="ml-auto rounded-full bg-[#f1f5f6] px-2.5 py-1 text-[9px] font-bold text-[#7a8d98]">
              {index === 0 ? "Fact" : index === 4 ? "Calculated" : "Deadline"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
function Risks() {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      {[
        {
          title: "Automatic renewal",
          level: "High",
          body: "The agreement automatically renews unless notice is provided 30 days before expiration.",
          source: "Section 12.1 | Page 14",
        },
        {
          title: "Ambiguous termination language",
          level: "High",
          body: "The material business reason threshold is not defined, which could create disagreement about convenience termination.",
          source: "Section 8.2 | Page 10",
        },
        {
          title: "Liability cap",
          level: "Medium",
          body: "The cap is limited to fees paid in the prior twelve months, with broad exclusions that need review.",
          source: "Section 11.1 | Page 13",
        },
      ].map((risk) => (
        <div
          key={risk.title}
          className="rounded-2xl border border-[#f1dfd5] bg-[#fffaf7] p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe8dc] text-[#cd7357]">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <h3 className="text-[13px] font-bold text-[#5c4837]">
                {risk.title}
              </h3>
            </div>
            <StatusPill tone={risk.level === "High" ? "rose" : "amber"}>
              {risk.level}
            </StatusPill>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-[#806f61]">
            {risk.body}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <SourceBadge>{risk.source}</SourceBadge>
            <button className="text-[10px] font-bold text-[#b26b55]">
              View clause <ArrowRight className="inline h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
function Versions({ contractId }: { contractId: string }) {
  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
      <div className="rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6">
        <SectionTitle
          title="Versions"
          description="Upload a new version to compare material changes."
        />
        <div className="mt-5 space-y-2">
          {[
            "Version 3 · Current",
            "Version 2 · Oct 03, 2024",
            "Version 1 · Jan 01, 2024",
          ].map((version, index) => (
            <button
              key={version}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${index === 0 ? "border-[#bfe1d6] bg-[#effaf6]" : "border-[#edf1f4]"}`}
            >
              <span>
                <span className="block text-[11px] font-bold text-[#405768]">
                  {version}
                </span>
                <span className="mt-1 block text-[9px] text-[#9aa8b2]">
                  {index === 0 ? "Uploaded today" : "Archived document"}
                </span>
              </span>
              {index === 0 && <StatusPill tone="green">Current</StatusPill>}
            </button>
          ))}
        </div>
        <Link
          to={`/compare?contract=${contractId}`}
          className="mt-5 flex h-10 items-center justify-center gap-2 rounded-xl bg-[#183448] text-[11px] font-bold text-white hover:bg-[#244b61]"
        >
          <GitCompareArrows className="h-4 w-4" /> Compare versions
        </Link>
      </div>
      <div className="rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6">
        <SectionTitle
          title="Material change preview"
          description="AI explains what changed beyond a text diff."
        />
        <div className="mt-5 rounded-xl border border-[#e1eaf4] bg-[#f7faff] p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#637dbd]">
            Termination
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-white p-3">
              <p className="text-[9px] font-bold uppercase text-[#9aa8b2]">
                Version 2
              </p>
              <p className="mt-2 text-[12px] font-bold text-[#405768]">
                30 days notice
              </p>
            </div>
            <div className="rounded-lg bg-white p-3">
              <p className="text-[9px] font-bold uppercase text-[#9aa8b2]">
                Version 3
              </p>
              <p className="mt-2 text-[12px] font-bold text-[#405768]">
                60 days notice
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-[#dfe8f2] pt-3">
            <p className="text-[11px] font-bold text-[#425979]">
              Notice period increased from 30 → 60 days
            </p>
            <p className="mt-1 text-[10px] text-[#8395ad]">
              Customer must provide notice earlier. Human review recommended.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
function Assistant({
  question,
  setQuestion,
  answer,
  ask,
}: {
  question: string;
  setQuestion: (value: string) => void;
  answer: string;
  ask: () => void;
}) {
  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.7fr]">
      <div className="rounded-2xl border border-[#d6e9e3] bg-[#f0faf6] p-5 md:p-7">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#438b7d]">
          <Sparkles className="h-4 w-4" /> Contract-specific AI assistant
        </div>
        <h2 className="mt-3 text-[20px] font-bold tracking-[-0.03em] text-[#23463f]">
          Ask about this agreement.
        </h2>
        <p className="mt-2 text-[12px] text-[#6f9188]">
          Answers are grounded in this contract only. If the information is not
          present, ContractLens will say so.
        </p>
        <div className="mt-6 flex h-11 items-center gap-2 rounded-xl border border-[#cfe4dd] bg-white px-3">
          <Search className="h-4 w-4 text-[#9ab9b0]" />
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && ask()}
            placeholder="When does this contract expire?"
            className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#9eb5ae]"
          />
          <button
            onClick={ask}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#183f3c] text-white"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "When does this contract expire?",
            "What are our payment obligations?",
            "Can the vendor terminate?",
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setQuestion(suggestion);
              }}
              className="rounded-full border border-[#d4e9e1] bg-white/70 px-3 py-1.5 text-[10px] font-medium text-[#63877d]"
            >
              {suggestion}
            </button>
          ))}
        </div>
        {answer && (
          <div className="mt-6 rounded-xl border border-[#d4e9e1] bg-white p-4">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#e1f6ef] text-[#2c806d]">
                <Check className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[12px] leading-relaxed text-[#58766e]">
                  {answer}
                </p>
                <div className="mt-3">
                  <SourceBadge>Section 2.1 · Page 3</SourceBadge>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6">
        <SectionTitle title="Suggested questions" />
        <div className="mt-5 space-y-2">
          {[
            "What are our payment obligations?",
            "Can the vendor terminate the contract?",
            "What happens if the SLA is missed?",
            "When must we send the renewal notice?",
          ].map((item) => (
            <button
              key={item}
              onClick={() => setQuestion(item)}
              className="flex w-full items-center justify-between rounded-xl border border-[#edf1f4] p-3 text-left text-[11px] font-semibold text-[#607484] hover:bg-[#f7fafb]"
            >
              {item}
              <ArrowRight className="h-3.5 w-3.5 text-[#9badb6]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
function Sources({ contractId }: { contractId: string }) {
  const { clauses } = useContractLens();
  const contractClauses = clauses.filter((clause) => clause.contractId === contractId);
  return (
    <div className="mt-5 rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6">
      <SectionTitle
        title="Source explorer"
        description="The original language behind every extracted insight."
      />
      <div className="mt-5 space-y-3">
        {contractClauses.map((clause) => (
          <div
            key={clause.id}
            className="rounded-xl border border-[#edf1f4] p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[#405768]">
                {clause.title}
              </span>
              <SourceBadge>
                Page {clause.page} · Clause {clause.number}
              </SourceBadge>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-[#748692]">
              “{clause.text}”
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
function Audit() {
  return (
    <div className="mt-5 rounded-2xl border border-[#e7edf1] bg-white p-5 md:p-6">
      <SectionTitle
        title="Audit trail"
        description="A chronological record of workspace actions."
      />
      <div className="mt-5 space-y-0">
        {[
          "Contract uploaded",
          "Document processed",
          "Summary generated",
          "Obligation created",
          "Version compared",
          "AI question asked",
          "Source viewed",
        ].map((item, index) => (
          <div
            key={item}
            className="relative flex gap-3 border-l border-[#d9ebe5] pb-5 pl-6 last:pb-0"
          >
            <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-[#8acdb9] ring-4 ring-white" />
            <div>
              <p className="text-[11px] font-bold text-[#526a78]">{item}</p>
              <p className="mt-1 text-[9px] text-[#9aa8b2]">
                {index < 2 ? "Today" : "Oct 20, 2024"} · ContractLens system
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
