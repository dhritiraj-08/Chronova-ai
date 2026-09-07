"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
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
  const [errorCode, setErrorCode] = useState<string | undefined>(undefined);
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
    setErrorCode(undefined);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Failed to create account");
        setErrorCode(data.code);
        setLoading(false);
        return;
      }

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

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="page-bg animate-fade">
      <div className="page-content" style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
        
        {/* Left panel (form side) */}
        <div style={{
          flex: "0 0 420px",
          display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "48px 36px",
          borderRight: "1px solid var(--c-border-1)",
          background: "var(--c-surface-0)",
          position: "relative",
          zIndex: 10
        }} className="responsive-auth-left">
          
          {/* Logo */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", marginBottom: "36px" }}>
            <Logo size={24} />
          </Link>

          {/* Heading */}
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, letterSpacing: "-0.015em", color: "var(--c-text-primary)" }}>
              Create account
            </h1>
            <p style={{ fontSize: "12.5px", color: "var(--c-text-secondary)", marginTop: "2px" }}>
              Free to start. No credit card required.
            </p>
          </div>

          {/* Role selector tabs */}
          <div style={{ display: "flex", gap: "4px", background: "var(--c-surface-2)", borderRadius: "var(--r-md)", padding: "3px", border: "1px solid var(--c-border-1)", marginBottom: "20px" }}>
            {(["student", "institution"] as const).map(r => (
              <button 
                type="button"
                key={r} 
                onClick={() => setRole(r)} 
                style={{
                  flex: 1, padding: "6px 12px", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer",
                  fontSize: "12px", fontWeight: 500, transition: "all var(--t-fast)",
                  background: role === r ? "var(--c-surface-3)" : "transparent",
                  color: role === r ? "var(--c-text-primary)" : "var(--c-text-secondary)"
                }}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)} Portal
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {error && (
              <div className="alert alert-error" style={{ padding: "8px 12px", fontSize: "12px" }}>
                {errorCode === "email_exists" ? (
                  <span>
                    This email is already registered. Please{" "}
                    <Link href="/login" style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}>
                      sign in instead
                    </Link>.
                  </span>
                ) : (
                  <span>{error}</span>
                )}
              </div>
            )}

            <div>
              <label className="form-label" htmlFor="signup-name">Full name</label>
              <div className="input-group">
                <User size={14} className="input-icon" />
                <input id="signup-name" type="text" className="input" placeholder="Arjun Mehta"
                  value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="signup-email">Email</label>
              <div className="input-group">
                <Mail size={14} className="input-icon" />
                <input id="signup-email" type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="signup-password">Password</label>
              <div className="input-group">
                <Lock size={14} className="input-icon" />
                <input id="signup-password" type={showPw ? "text" : "password"} className="input"
                  placeholder="At least 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={8} autoComplete="new-password"
                  style={{ paddingRight: "36px" }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--c-text-tertiary)", display: "flex" }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={loading || !email || !password || !name}
              className="btn btn-primary"
              style={{ width: "100%", padding: "10px", marginTop: "4px", justifyContent: "center", fontSize: "13px" }}
            >
              {loading ? "Creating..." : <>Create account <ArrowRight size={13} style={{ marginLeft: "2px" }} /></>}
            </button>
          </form>

          <p style={{ marginTop: "16px", fontSize: "11px", color: "var(--c-text-tertiary)", textAlign: "center", lineHeight: 1.5 }}>
            By creating an account you agree to our{" "}
            <a href="#" style={{ color: "var(--c-text-secondary)", textDecoration: "underline" }}>Terms</a>{" "}and{" "}
            <a href="#" style={{ color: "var(--c-text-secondary)", textDecoration: "underline" }}>Privacy Policy</a>.
          </p>

          <p style={{ marginTop: "20px", fontSize: "12.5px", color: "var(--c-text-tertiary)", textAlign: "center" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--c-text-primary)", textDecoration: "none", fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Right panel (brand side) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px", position: "relative", overflow: "hidden" }} className="responsive-auth-right">
          <div style={{ position: "relative", zIndex: 1, maxWidth: "420px", width: "100%" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--c-text-tertiary)", marginBottom: "16px" }}>
              What you get on day one
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "32px", padding: "6px", background: "var(--c-surface-1)", border: "1px solid var(--c-border-1)" }} className="card">
              {[
                { title: "A personalised weekly schedule", sub: "Built around your subjects, sleep, and college hours" },
                { title: "AI chat that understands context", sub: "Say 'I'm tired' — it adapts. Say 'exam in 3 days' — it focuses." },
                { title: "Burnout protection built in", sub: "Recovery windows are non-negotiable. Sleep is respected." },
                { title: "Analytics that surface patterns", sub: "See your study hours, consistency, and goal progress weekly." },
              ].map(({ title, sub }) => (
                <div key={title} style={{
                  padding: "10px 14px", borderRadius: "var(--r-md)",
                  background: "transparent",
                  border: "1px solid transparent",
                  transition: "all var(--t-fast)", cursor: "default"
                }}
                  onMouseEnter={e => { 
                    (e.currentTarget as HTMLElement).style.background = "var(--c-surface-2)"; 
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border-1)"; 
                  }}
                  onMouseLeave={e => { 
                    (e.currentTarget as HTMLElement).style.background = "transparent"; 
                    (e.currentTarget as HTMLElement).style.borderColor = "transparent"; 
                  }}
                >
                  <p style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--c-text-primary)" }}>{title}</p>
                  <p style={{ fontSize: "11.5px", color: "var(--c-text-secondary)", lineHeight: 1.5, marginTop: "2px" }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Trust signal */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--c-success)", flexShrink: 0 }} />
              <p style={{ fontSize: "12px", color: "var(--c-text-secondary)" }}>
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
            padding: 32px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
