import { supabase } from "@/lib/supabase";

export interface WorkspaceShellContent {
  brand_name: string;
  brand_tagline: string;
  workspace_label: string;
  manage_label: string;
  cta_title: string;
  cta_description: string;
  cta_link_label: string;
  cta_link: string;
  search_placeholder: string;
  shortcut_label: string;
  sign_out_label: string;
  settings_label: string;
}

export interface WorkspaceNavigationItem {
  id: string;
  label: string;
  path: string;
  icon_name: string;
  section: "workspace" | "manage";
  sort_order: number;
}

export async function loadWorkspaceShell() {
  const [contentResult, navigationResult] = await Promise.all([
    supabase.from("workspace_shell_content").select("*").eq("id", "default").single(),
    supabase.from("workspace_navigation").select("*").order("sort_order", { ascending: true }),
  ]);
  if (contentResult.error) throw new Error(contentResult.error.message);
  if (navigationResult.error) throw new Error(navigationResult.error.message);
  return {
    content: contentResult.data as WorkspaceShellContent,
    navigation: (navigationResult.data ?? []) as WorkspaceNavigationItem[],
  };
}
