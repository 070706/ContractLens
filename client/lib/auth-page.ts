import { supabase } from "@/lib/supabase";

export interface AuthPageContent {
  id: string;
  brand_name: string;
  brand_tagline: string;
  eyebrow: string;
  title: string;
  title_accent: string;
  description: string;
  login_eyebrow: string;
  login_title: string;
  login_description: string;
  signup_eyebrow: string;
  signup_title: string;
  signup_description: string;
  email_label: string;
  email_placeholder: string;
  password_label: string;
  password_placeholder: string;
  submit_login_label: string;
  submit_signup_label: string;
  switch_login_label: string;
  switch_signup_label: string;
  success_message: string;
  benefit_one: string;
  benefit_two: string;
  benefit_three: string;
}

export async function loadAuthPage(): Promise<AuthPageContent> {
  const { data, error } = await supabase.from("auth_page_content").select("*").eq("id", "default").single();
  if (error) throw new Error(error.message);
  return data as AuthPageContent;
}
