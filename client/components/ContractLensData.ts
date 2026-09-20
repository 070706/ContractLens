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
