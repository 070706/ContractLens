import { ArrowLeft, ArrowRight, BrainCircuit, Check, Eye, EyeOff, LockKeyhole, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { loadAuthPage, type AuthPageContent } from "@/lib/auth-page";
import { useAuth } from "@/components/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const isSignup = new URLSearchParams(location.search).get("mode") === "signup";
  const [content, setContent] = useState<AuthPageContent | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [signup, setSignup] = useState(isSignup);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void loadAuthPage().then((nextContent) => {
      if (active) setContent(nextContent);
    }).catch((loadError: Error) => {
      if (active) setContentError(loadError.message);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!authLoading && user) navigate("/dashboard", { replace: true });
  }, [authLoading, navigate, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content) return;
    setError(null);
    setResetMessage(null);
    setSubmitted(true);
    const result = signup
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      setSubmitted(false);
      setError(result.error.message);
      return;
    }
    if (signup && !result.data.session) return;
    navigate("/dashboard");
  };

  const handleReset = async () => {
    if (!email) {
      setError(content?.email_label ?? "Email is required");
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` });
    if (resetError) setError(resetError.message);
    else setResetMessage(content?.success_message ?? "Check your email");
  };

  const handleGoogle = async () => {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/dashboard` } });
    if (oauthError) setError(oauthError.message);
  };

  if (contentError) return <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-6 text-center text-sm text-[#526575]">{contentError}</div>;
  if (!content) return <div className="min-h-screen animate-pulse bg-[#f7f9fc]" />;

  return <div className="min-h-screen bg-[#f7f9fc] text-[#162334]"><div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
    <section className="relative hidden overflow-hidden bg-[#183448] p-12 lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-24 -top-20 h-96 w-96 rounded-full border-[46px] border-[#91e8cb]/[0.06]" /><Link to="/" className="relative flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c8f2e4] text-[#123d3a]"><BrainCircuit className="h-[19px] w-[19px]" /></div><div><div className="text-[15px] font-bold text-white">{content.brand_name}</div><div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8094a4]">{content.brand_tagline}</div></div></Link><div className="relative max-w-[440px]"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#91e8cb]"><Sparkles className="h-3.5 w-3.5" /> {content.eyebrow}</div><h1 className="text-[45px] font-bold leading-[1.05] tracking-[-0.06em] text-white">{content.title}<br /><span className="text-[#91e8cb]">{content.title_accent}</span></h1><p className="mt-6 text-[14px] leading-relaxed text-[#a9bac6]">{content.description}</p><div className="mt-8 space-y-3 text-[11px] font-semibold text-[#d0e2e5]">{[content.benefit_one, content.benefit_two, content.benefit_three].map((benefit) => <div key={benefit} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#91e8cb]" /> {benefit}</div>)}</div></div><div className="relative flex items-center gap-2 text-[10px] text-[#8298a7]"><LockKeyhole className="h-3.5 w-3.5" /> {content.brand_tagline}</div></section>
    <section className="flex flex-col px-5 py-6 md:px-12 lg:px-20"><div className="flex items-center justify-between lg:justify-end"><Link to="/" className="flex items-center gap-2 text-[11px] font-bold text-[#78909d] lg:hidden"><ArrowLeft className="h-3.5 w-3.5" /> {content.brand_name}</Link><Link to="/" className="hidden items-center gap-2 text-[11px] font-bold text-[#78909d] lg:flex"><ArrowLeft className="h-3.5 w-3.5" /> {content.brand_name}</Link></div><div className="mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center py-12"><div className="mb-8"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#63a993]">{signup ? content.signup_eyebrow : content.login_eyebrow}</div><h2 className="mt-3 text-[30px] font-bold tracking-[-0.05em] text-[#183448]">{signup ? content.signup_title : content.login_title}</h2><p className="mt-2 text-[13px] text-[#83939e]">{signup ? content.signup_description : content.login_description}</p></div><button onClick={handleGoogle} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#dfe7eb] bg-white text-[12px] font-bold text-[#496170] transition hover:border-[#c3d8d2] hover:bg-[#fbfefd]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4285f4] text-[10px] font-bold text-white">G</span> Continue with Google</button><div className="my-6 flex items-center gap-3 text-[10px] font-semibold text-[#a5b1b9]"><div className="h-px flex-1 bg-[#e8edf0]" /> OR CONTINUE WITH EMAIL <div className="h-px flex-1 bg-[#e8edf0]" /></div><form onSubmit={handleSubmit} className="space-y-4">{signup && <label className="block"><span className="mb-1.5 block text-[11px] font-bold text-[#526575]">Full name</span><input required value={fullName} onChange={(event) => setFullName(event.target.value)} type="text" className="h-11 w-full rounded-xl border border-[#dfe7eb] bg-white px-3.5 text-[12px] text-[#304758] outline-none transition focus:border-[#8bcab7] focus:ring-2 focus:ring-[#c8f2e4]" /></label>}<label className="block"><span className="mb-1.5 block text-[11px] font-bold text-[#526575]">{content.email_label}</span><input required value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder={content.email_placeholder} className="h-11 w-full rounded-xl border border-[#dfe7eb] bg-white px-3.5 text-[12px] text-[#304758] outline-none transition placeholder:text-[#b0bbc2] focus:border-[#8bcab7] focus:ring-2 focus:ring-[#c8f2e4]" /></label><label className="block"><div className="mb-1.5 flex items-center justify-between"><span className="text-[11px] font-bold text-[#526575]">{content.password_label}</span>{!signup && <button type="button" onClick={handleReset} className="text-[10px] font-bold text-[#5c9c8a] hover:text-[#286d5d]">Forgot password?</button>}</div><div className="relative"><input required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} placeholder={content.password_placeholder} className="h-11 w-full rounded-xl border border-[#dfe7eb] bg-white px-3.5 pr-11 text-[12px] text-[#304758] outline-none transition placeholder:text-[#b0bbc2] focus:border-[#8bcab7] focus:ring-2 focus:ring-[#c8f2e4]" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 text-[#9babb4]" aria-label="Toggle password visibility">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>{error && <p className="rounded-lg bg-[#fff4f1] px-3 py-2 text-[11px] text-[#b85b4d]">{error}</p>}{resetMessage && <p className="rounded-lg bg-[#effaf6] px-3 py-2 text-[11px] text-[#3b8272]">{resetMessage}</p>}{submitted && signup && <p className="rounded-lg bg-[#effaf6] px-3 py-2 text-[11px] text-[#3b8272]">{content.success_message}</p>}<button type="submit" disabled={submitted} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#183448] text-[12px] font-bold text-white shadow-[0_8px_18px_rgba(24,52,72,0.14)] transition hover:bg-[#244b61] disabled:cursor-wait disabled:opacity-70">{submitted ? content.success_message : signup ? content.submit_signup_label : content.submit_login_label}<ArrowRight className="h-4 w-4" /></button></form><p className="mt-7 text-center text-[11px] text-[#8b9aa4]"><button onClick={() => setSignup((value) => !value)} className="font-bold text-[#4a9b87] hover:text-[#286d5d]">{signup ? content.switch_login_label : content.switch_signup_label}</button></p></div><p className="text-center text-[10px] text-[#a5b0b7]">{content.brand_tagline}</p></section>
  </div></div>;
}
