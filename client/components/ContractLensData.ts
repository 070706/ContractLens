export type ContractStatus = "Active" | "Renewal soon" | "Processing";
export type ObligationStatus = "Pending" | "Completed" | "Overdue";
export type AlertType = "Overdue" | "Upcoming" | "Review";

export interface Contract {
  id: string;
  name: string;
  type: string;
  parties: string;
  status: ContractStatus;
  risk: "Low" | "Medium" | "High" | "Pending";
  effectiveDate: string | null;
  expiration: string | null;
  renewal: string | null;
  updated: string;
  icon: string;
  color: string;
}

export interface ContractExtractionData {
  contract: {
    title?: string | null;
    reference_id?: string | null;
    contract_type?: string | null;
  };
  parties: Array<{
    name: string;
    role: string;
    party_type?: string | null;
    source?: SourceReference;
  }>;
  dates: {
    effective_date?: ExtractedValue;
    expiration_date?: ExtractedValue;
    initial_term?: ExtractedValue;
  };
  renewal: {
    type?: string | null;
    period?: string | null;
    notice_period?: string | null;
    conditions?: string | null;
    source?: SourceReference;
  };
  payment_terms: {
    amount?: string | null;
    currency?: string | null;
    frequency?: string | null;
    payment_period?: string | null;
    invoice_timing?: string | null;
    late_payment_terms?: string | null;
    source?: SourceReference;
  };
  termination: {
    for_convenience?: string | null;
    for_cause?: string | null;
    notice_period?: string | null;
    cure_period?: string | null;
    special_conditions?: string[];
    source?: SourceReference;
  };
  service_obligations: Array<{
    responsible_party: string;
    obligation: string;
    details: string;
    source?: SourceReference;
  }>;
  summary: string;
}
export interface SourceReference {
  page?: number | null;
  section?: string | null;
  clause?: string | null;
  text?: string | null;
}
export interface ExtractedValue {
  value?: string | null;
  source?: SourceReference;
}

export interface Clause {
  id: string;
  contractId: string;
  number: string;
  title: string;
  category: string;
  risk: "Low" | "Medium" | "High";
  page: number | null;
  text: string;
  humanReviewRequired: boolean;
}

export interface ContractVersion {
  id: string;
  contractId: string;
  label: string;
  date: string;
  current: boolean;
}

export interface Obligation {
  id: string;
  contractId: string;
  party: string;
  title: string;
  deadline: string | null;
  frequency: string;
  priority: "High" | "Medium" | "Low";
  status: ObligationStatus;
  source: string;
}

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  detail: string;
  contractId: string | null;
  read: boolean;
}

export interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  time: string;
  icon: string;
}

export interface WorkspaceMember {
  name: string;
  email: string;
  role: string;
  team: string;
  initials: string;
}

export interface WorkspaceSettings {
  notificationDays: number[];
  organization: string;
  aiSummaryStyle: string;
}
