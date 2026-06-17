"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Globe } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      const errMsg = error.message.toLowerCase();
      if (errMsg.includes("email not confirmed") || errMsg.includes("email not verified")) {
        try {
          const confirmRes = await fetch("/api/auth/confirm-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const confirmData = await confirmRes.json();

          if (confirmRes.ok && confirmData.success) {
            // Retry login since the email is now confirmed
            const retry = await supabase.auth.signInWithPassword({ email, password });
            if (retry.error) {
              setError(retry.error.message);
              setLoading(false);
            } else {
              await supabase.auth.updateUser({
                data: { role }
              });
              router.push(role === "institution" ? "/admin?role=institution" : "/dashboard?role=student");
            }
          } else {
            setError(confirmData.error || error.message);
            setLoading(false);
          }
        } catch (err: any) {
          setError(err.message || error.message);
          setLoading(false);
        }
      } else {
        setError(error.message);
        setLoading(false);
      }
    } else {
      await supabase.auth.updateUser({
        data: { role }
      });
      router.push(role === "institution" ? "/admin?role=institution" : "/dashboard?role=student");
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${role === "institution" ? "/admin?role=institution" : "/dashboard?role=student"}` },
    });
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="page-bg animate-fade">
      <div className="page-content" style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
        
        {/* ── Left panel ── */}
        <div style={{
          flex: "0 0 440px", display: "flex", flexDirection: "column",
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
              Welcome back
            </h1>
            <p style={{ fontSize: "14px", color: "var(--c-text-secondary)", marginTop: "4px" }}>
              Sign in to your account to continue
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
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="form-label" htmlFor="login-email">Email</label>
              <div className="input-group">
                <Mail size={15} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label className="form-label" htmlFor="login-password">Password</label>
                <a href="#" style={{ fontSize: "12px", color: "var(--c-accent-light)", textDecoration: "none", fontWeight: 600 }}>Forgot password?</a>
              </div>
              <div className="input-group">
                <Lock size={15} className="input-icon" />
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  className="input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--c-text-tertiary)", display: "flex" }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading || !email || !password}
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px", marginTop: "8px", justifyContent: "center", fontSize: "14px", fontWeight: 600, borderRadius: "10px" }}
            >
              {loading ? <span className="btn-spinner" /> : <>Sign in <ArrowRight size={15} style={{ marginLeft: "4px" }} /></>}
            </button>
          </form>

          <p style={{ marginTop: "32px", fontSize: "13.5px", color: "var(--c-text-tertiary)", textAlign: "center" }}>
            Don't have an account?{" "}
            <Link href="/signup" style={{ color: "var(--c-accent-light)", textDecoration: "none", fontWeight: 600 }}>
              Sign up free
            </Link>
          </p>
        </div>

        {/* ── Right panel ── */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center", padding: "60px",
          position: "relative", overflow: "hidden"
        }} className="responsive-auth-right">
          
          {/* Ambient glow */}
          <div style={{ position: "absolute", top: "30%", left: "40%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: "480px", width: "100%" }}>
            {/* Quote card */}
            <div className="card" style={{
              padding: "36px",
              marginBottom: "24px",
              boxShadow: "var(--sh-lg)"
            }}>
              <p style={{ fontSize: "17.5px", fontWeight: 500, lineHeight: 1.7, color: "var(--c-text-primary)", marginBottom: "28px", letterSpacing: "-0.01em", fontStyle: "italic" }}>
                "I used to rewrite my schedule every Sunday. Now Chronova does it — and honestly does it better."
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "var(--c-accent-dim)", border: "1px solid var(--c-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13.5px", fontWeight: 700, color: "var(--c-accent-light)" }}>AM</div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--c-text-primary)" }}>Arjun Mehta</p>
                  <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", fontWeight: 500 }}>JEE Aspirant · Delhi</p>
                </div>
              </div>
            </div>

            {/* Mini stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[
                { value: "50K+", label: "Active students" },
                { value: "94%", label: "Report better grades" },
                { value: "4.9★", label: "Average rating" },
                { value: "2,100+", label: "Schools trust us" },
              ].map(({ value, label }) => (
                <div key={label} className="card" style={{ padding: "18px 20px" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 850, color: "var(--c-text-primary)", letterSpacing: "-0.02em", marginBottom: "4px" }}>{value}</p>
                  <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", fontWeight: 500 }}>{label}</p>
                </div>
              ))}
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
