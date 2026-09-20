import { supabase } from "@/lib/supabase";

export interface DashboardContent {
  eyebrow: string;
  title_template: string;
  description: string;
  upload_label: string;
  deadlines_title: string;
  deadlines_description: string;
  renewals_title: string;
  renewals_description: string;
  contracts_title: string;
  contracts_description: string;
  status_title: string;
  obligation_status_title: string;
  activity_title: string;
}

export interface DashboardMetric {
  id: string;
  label: string;
  detail: string;
  metric_key: string;
  icon_name: string;
  tone: "mint" | "blue" | "peach" | "lilac";
  sort_order: number;
}

export async function loadDashboardContent() {
  const [contentResult, metricsResult] = await Promise.all([
    supabase.from("dashboard_content").select("*").eq("id", "default").single(),
    supabase.from("dashboard_metrics").select("*").order("sort_order", { ascending: true }),
  ]);
  if (contentResult.error) throw new Error(contentResult.error.message);
  if (metricsResult.error) throw new Error(metricsResult.error.message);
  return {
    content: contentResult.data as DashboardContent,
    metrics: (metricsResult.data ?? []) as DashboardMetric[],
  };
}
