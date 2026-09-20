import { createContext, useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen animate-pulse bg-[#f7f9fc]" />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
