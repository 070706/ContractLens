export type ContractStatus = "Active" | "Renewal soon" | "Processing";
export type ObligationStatus = "Pending" | "Completed" | "Overdue";

export interface Contract {
  id: string;
  name: string;
  type: string;
  parties: string;
  status: ContractStatus;
  risk: "Low" | "Medium" | "High" | "Pending";
  expiration: string;
  renewal: string;
  updated: string;
  icon: string;
  color: string;
}

export interface Obligation {
  id: string;
  contractId: string;
  party: string;
  title: string;
  deadline: string;
  frequency: string;
  priority: "High" | "Medium" | "Low";
  status: ObligationStatus;
  source: string;
}

export interface AlertItem {
  id: string;
  type: "Overdue" | "Upcoming" | "Review";
  title: string;
  detail: string;
  contractId: string;
  read: boolean;
}

export const initialContracts: Contract[] = [
  { id: "acme-cloud", name: "Acme Cloud Services Agreement", type: "Vendor agreement", parties: "Acme Inc. · Your company", status: "Active", risk: "Medium", expiration: "Dec 31, 2026", renewal: "Nov 30, 2026", updated: "Today, 9:42 AM", icon: "AC", color: "bg-[#dff7ef] text-[#0d775f]" },
  { id: "northstar", name: "Northstar Logistics MSA", type: "Master service agreement", parties: "Northstar · Your company", status: "Renewal soon", risk: "High", expiration: "Dec 14, 2024", renewal: "Nov 02, 2024", updated: "Yesterday", icon: "NL", color: "bg-[#e5edff] text-[#415cb8]" },
  { id: "orbit-dpa", name: "Orbit Analytics DPA", type: "Data processing addendum", parties: "Orbit Analytics · Your company", status: "Active", risk: "Low", expiration: "Jun 30, 2026", renewal: "May 31, 2026", updated: "Oct 17, 2024", icon: "OA", color: "bg-[#f2e7ff] text-[#8754bd]" },
  { id: "mosaic-sow", name: "Mosaic Studio SOW #03", type: "Statement of work", parties: "Mosaic Studio · Your company", status: "Processing", risk: "Pending", expiration: "Mar 31, 2025", renewal: "Mar 01, 2025", updated: "Oct 12, 2024", icon: "MS", color: "bg-[#fff0d9] text-[#a56a19]" },
];

export const initialObligations: Obligation[] = [
  { id: "obl-1", contractId: "acme-cloud", party: "Vendor", title: "Submit quarterly security questionnaire", deadline: "Oct 24, 2024", frequency: "Quarterly", priority: "High", status: "Pending", source: "Section 7.4 · Page 8" },
  { id: "obl-2", contractId: "northstar", party: "Customer", title: "Send non-renewal notice", deadline: "Nov 02, 2024", frequency: "One-time", priority: "High", status: "Pending", source: "Section 12.1 · Page 14" },
  { id: "obl-3", contractId: "orbit-dpa", party: "Vendor", title: "Deliver quarterly uptime report", deadline: "Nov 14, 2024", frequency: "Quarterly", priority: "Medium", status: "Pending", source: "Schedule B · Page 4" },
  { id: "obl-4", contractId: "acme-cloud", party: "Customer", title: "Make platform subscription payment", deadline: "Nov 30, 2024", frequency: "Monthly", priority: "Medium", status: "Pending", source: "Section 4.2 · Page 5" },
  { id: "obl-5", contractId: "orbit-dpa", party: "Your company", title: "Delete personal data after termination", deadline: "Jun 30, 2026", frequency: "One-time", priority: "Low", status: "Completed", source: "Section 9 · Page 7" },
];

export const initialAlerts: AlertItem[] = [
  { id: "alert-1", type: "Overdue", title: "Vendor SLA report was due yesterday", detail: "Orbit Analytics DPA · Assigned to Finance", contractId: "orbit-dpa", read: false },
  { id: "alert-2", type: "Upcoming", title: "Renewal notice required in 12 days", detail: "Northstar Logistics MSA · Nov 02, 2024", contractId: "northstar", read: false },
  { id: "alert-3", type: "Review", title: "Automatic renewal clause needs review", detail: "Acme Cloud Services Agreement · Section 8.2", contractId: "acme-cloud", read: false },
];

export const contractClauses = [
  { id: "clause-1", number: "2.1", title: "Term and expiration", category: "Renewal", risk: "Low", page: "3", text: "This Agreement commences on January 1, 2024 and continues until December 31, 2026, unless earlier terminated in accordance with Section 8." },
  { id: "clause-2", number: "4.2", title: "Payment terms", category: "Payment", risk: "Low", page: "5", text: "Customer shall pay all undisputed invoices within thirty (30) days of receipt. Late amounts may accrue interest at one percent per month." },
  { id: "clause-3", number: "7.4", title: "Service levels", category: "SLA", risk: "Medium", page: "8", text: "Vendor will provide a quarterly security questionnaire and maintain commercially reasonable safeguards for the services." },
  { id: "clause-4", number: "8.2", title: "Termination for convenience", category: "Termination", risk: "High", page: "10", text: "Either party may terminate for convenience upon written notice where a material business reason exists, as determined by the notifying party." },
  { id: "clause-5", number: "11.1", title: "Limitation of liability", category: "Liability", risk: "High", page: "13", text: "Except for excluded claims, each party's aggregate liability shall not exceed fees paid during the twelve months preceding the event giving rise to the claim." },
];

export const activityItems = [
  { action: "AI summary generated", detail: "Acme Cloud Services Agreement", time: "Today, 9:42 AM", icon: "spark" },
  { action: "Obligation created", detail: "Quarterly security questionnaire", time: "Today, 9:41 AM", icon: "check" },
  { action: "Version compared", detail: "Northstar Logistics MSA", time: "Yesterday, 4:18 PM", icon: "compare" },
  { action: "Source viewed", detail: "Orbit Analytics DPA · Page 7", time: "Yesterday, 2:06 PM", icon: "source" },
];
