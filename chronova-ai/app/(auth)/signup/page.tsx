"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Globe } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"student" | "institution">("student");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard");
      }
    });
  }, [router, supabase]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      // Auto-create session after registration by logging them in immediately
      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
      if (loginErr) {
        setError("Account created, but could not log in automatically. Please try signing in.");
        setLoading(false);
        return;
      }

      router.push(role === "institution" ? "/admin" : "/onboarding");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${role === "institution" ? "/admin?role=institution" : "/onboarding?role=student"}` },
    });
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="page-bg animate-fade">
      <div className="page-content" style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
        
        {/* ── Left panel (form side) ── */}
        <div style={{
          flex: "0 0 440px",
          display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "60px 48px",
          borderRight: "1px solid var(--c-border-1)",
          background: "rgba(8, 9, 15, 0.72)",
          backdropFilter: "blur(24px)",
          position: "relative",
          zIndex: 10
        }} className="responsive-auth-left">
          
          {/* Logo */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", marginBottom: "48px" }}>
            <Logo size={28} />
          </Link>

          {/* Heading */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--c-text-primary)" }}>
              Create account
            </h1>
            <p style={{ fontSize: "14px", color: "var(--c-text-secondary)", marginTop: "4px" }}>
              Free to start. No credit card required.
            </p>
          </div>

          {/* Role selector tabs */}
          <div style={{ display: "flex", gap: "6px", background: "rgba(15,17,26,0.6)", borderRadius: "10px", padding: "4px", border: "1px solid var(--c-border-1)", marginBottom: "24px" }}>
            {(["student", "institution"] as const).map(r => (
              <button 
                type="button"
                key={r} 
                onClick={() => setRole(r)} 
                style={{
                  flex: 1, padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                  fontSize: "13px", fontWeight: 700, transition: "all var(--t-fast)",
                  background: role === r ? "var(--c-surface-3)" : "transparent",
                  color: role === r ? "var(--c-text-primary)" : "var(--c-text-tertiary)",
                  boxShadow: role === r ? "0 4px 12px rgba(139,92,246,0.06)" : "none"
                }}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)} Portal
              </button>
            ))}
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            className="btn btn-secondary"
            style={{ width: "100%", padding: "11px", marginBottom: "24px", justifyContent: "center", gap: "10px", borderRadius: "10px" }}
          >
            <Globe size={16} color="var(--c-secondary-light)" />
            Continue with Google
          </button>

          <div className="divider-text" style={{ marginBottom: "24px" }}>or continue with email</div>

          {/* Form */}
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {error && <div className="alert alert-error"><span>{error}</span></div>}

            <div>
              <label className="form-label" htmlFor="signup-name">Full name</label>
              <div className="input-group">
                <User size={15} className="input-icon" />
                <input id="signup-name" type="text" className="input" placeholder="Arjun Mehta"
                  value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="signup-email">Email</label>
              <div className="input-group">
                <Mail size={15} className="input-icon" />
                <input id="signup-email" type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="signup-password">Password</label>
              <div className="input-group">
                <Lock size={15} className="input-icon" />
                <input id="signup-password" type={showPw ? "text" : "password"} className="input"
                  placeholder="At least 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={8} autoComplete="new-password"
                  style={{ paddingRight: "44px" }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--c-text-tertiary)", display: "flex" }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={loading || !email || !password || !name}
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px", marginTop: "8px", justifyContent: "center", fontSize: "14px", fontWeight: 600, borderRadius: "10px" }}
            >
              {loading ? <span className="btn-spinner" /> : <>Create account <ArrowRight size={15} style={{ marginLeft: "4px" }} /></>}
            </button>
          </form>

          <p style={{ marginTop: "16px", fontSize: "11.5px", color: "var(--c-text-tertiary)", textAlign: "center", lineHeight: 1.6 }}>
            By creating an account you agree to our{" "}
            <a href="#" style={{ color: "var(--c-text-secondary)", textDecoration: "underline" }}>Terms</a>{" "}and{" "}
            <a href="#" style={{ color: "var(--c-text-secondary)", textDecoration: "underline" }}>Privacy Policy</a>.
          </p>

          <p style={{ marginTop: "24px", fontSize: "13.5px", color: "var(--c-text-tertiary)", textAlign: "center" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--c-accent-light)", textDecoration: "none", fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* ── Right panel (brand side) ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px", position: "relative", overflow: "hidden" }} className="responsive-auth-right">
          <div style={{ position: "absolute", top: "25%", left: "35%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: "480px", width: "100%" }}>
            {/* What you get */}
            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-accent-light)", marginBottom: "20px" }}>
              What you get on day one
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "40px", padding: "8px", background: "rgba(15,17,26,0.45)", border: "1px solid var(--c-border-1)" }} className="card">
              {[
                { title: "A personalised weekly schedule", sub: "Built around your subjects, sleep, and college hours" },
                { title: "AI chat that understands context", sub: "Say 'I'm tired' — it adapts. Say 'exam in 3 days' — it focuses." },
                { title: "Burnout protection built in", sub: "Recovery windows are non-negotiable. Sleep is respected." },
                { title: "Analytics that surface patterns", sub: "See your study hours, consistency, and goal progress weekly." },
              ].map(({ title, sub }) => (
                <div key={title} style={{
                  padding: "16px 20px", borderRadius: "12px",
                  background: "transparent",
                  border: "1px solid transparent",
                  transition: "all var(--t-base)", cursor: "default"
                }}
                  onMouseEnter={e => { 
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; 
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border-1)"; 
                  }}
                  onMouseLeave={e => { 
                    (e.currentTarget as HTMLElement).style.background = "transparent"; 
                    (e.currentTarget as HTMLElement).style.borderColor = "transparent"; 
                  }}
                >
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--c-text-primary)" }}>{title}</p>
                  <p style={{ fontSize: "13px", color: "var(--c-text-secondary)", lineHeight: 1.55, marginTop: "4px" }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Trust signal */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--c-success)", boxShadow: "0 0 8px var(--c-success)", flexShrink: 0 }} />
              <p style={{ fontSize: "13px", color: "var(--c-text-secondary)", fontWeight: 500 }}>
                Trusted by <strong style={{ color: "var(--c-text-primary)" }}>50,000+ students</strong> and <strong style={{ color: "var(--c-text-primary)" }}>2,100 schools</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .responsive-auth-right {
            display: none !important;
          }
          .responsive-auth-left {
            flex: 1 !important;
            border-right: none !important;
            padding: 40px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
