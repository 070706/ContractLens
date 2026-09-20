import { supabase } from "@/lib/supabase";

export interface HomepageSettings {
  id: string;
  brand_name: string;
  brand_tagline: string;
  footer_text: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  hero_primary_label: string;
  hero_primary_href: string;
  hero_secondary_label: string;
  hero_secondary_href: string;
  hero_proof_one: string;
  hero_proof_two: string;
  features_eyebrow: string;
  features_title: string;
  features_description: string;
  workflow_eyebrow: string;
  workflow_title: string;
  workflow_description: string;
  security_eyebrow: string;
  security_title: string;
  security_description: string;
  security_cta_label: string;
  security_cta_href: string;
}

export interface HomepageNavItem {
  id: string;
  item_type: "nav" | "secondary_action" | "primary_action" | "mobile_action";
  label: string;
  href: string;
  sort_order: number;
}

export interface HomepageFeature {
  id: string;
  icon_name: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface HomepageWorkflowStep {
  id: string;
  step_number: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface HomepagePreview {
  id: string;
  contract_name: string;
  contract_status: string;
  renewal_label: string;
  renewal_value: string;
  renewal_detail: string;
  obligations_label: string;
  obligations_value: string;
  obligations_detail: string;
  review_label: string;
  review_value: string;
  review_detail: string;
  timeline_title: string;
  timeline_action_label: string;
  ask_label: string;
  change_label: string;
  change_detail: string;
}

export interface HomepagePreviewEvent {
  id: string;
  preview_id: string;
  event_date: string;
  event_title: string;
  event_type: string;
  sort_order: number;
}

export interface HomepageFooterItem {
  id: string;
  label: string;
  href: string | null;
  sort_order: number;
}

export interface HomepageData {
  settings: HomepageSettings;
  navItems: HomepageNavItem[];
  features: HomepageFeature[];
  workflowSteps: HomepageWorkflowStep[];
  preview: HomepagePreview;
  previewEvents: HomepagePreviewEvent[];
  footerItems: HomepageFooterItem[];
}

export async function loadHomepage(): Promise<HomepageData> {
  const [settingsResult, navResult, featuresResult, workflowResult, previewResult, eventsResult, footerResult] = await Promise.all([
    supabase.from("homepage_settings").select("*").eq("id", "default").single(),
    supabase.from("homepage_nav_items").select("*").order("sort_order", { ascending: true }),
    supabase.from("homepage_features").select("*").order("sort_order", { ascending: true }),
    supabase.from("homepage_workflow_steps").select("*").order("sort_order", { ascending: true }),
    supabase.from("homepage_preview").select("*").eq("id", "default").single(),
    supabase.from("homepage_preview_events").select("*").order("sort_order", { ascending: true }),
    supabase.from("homepage_footer_items").select("*").order("sort_order", { ascending: true }),
  ]);

  const failed = [settingsResult, navResult, featuresResult, workflowResult, previewResult, eventsResult, footerResult].find((result) => result.error);
  if (failed?.error) throw new Error(failed.error.message);

  return {
    settings: settingsResult.data as HomepageSettings,
    navItems: (navResult.data ?? []) as HomepageNavItem[],
    features: (featuresResult.data ?? []) as HomepageFeature[],
    workflowSteps: (workflowResult.data ?? []) as HomepageWorkflowStep[],
    preview: previewResult.data as HomepagePreview,
    previewEvents: (eventsResult.data ?? []) as HomepagePreviewEvent[],
    footerItems: (footerResult.data ?? []) as HomepageFooterItem[],
  };
}
