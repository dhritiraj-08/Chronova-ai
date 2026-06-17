"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Moon, Bell, Shield, User } from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>({ name: "", education_level: "", sleep_start: "23:00", sleep_end: "07:00" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => data && setProfile(data));
    });
  }, [supabase]);

  async function saveSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ name: profile.name, sleep_start: profile.sleep_start, sleep_end: profile.sleep_end }).eq("id", user.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-accent)" }}>Account</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, marginTop: "4px", letterSpacing: "-0.02em" }}>Settings</h1>
      </div>

      {[
        {
          icon: User, title: "Profile", color: "var(--c-accent)", bg: "var(--c-accent-dim)",
          content: (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: "14px" }}>
              <div>
                <label className="form-label" htmlFor="settings-name">Full Name</label>
                <input id="settings-name" className="input" value={profile?.name || ""} onChange={e => setProfile((p: any) => ({ ...p, name: e.target.value }))} placeholder="Your name" />
              </div>
              <div>
                <label className="form-label" htmlFor="settings-education">Education Level</label>
                <input id="settings-education" className="input" value={profile?.education_level || ""} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
              </div>
            </div>
          )
        },
        {
          icon: Moon, title: "Sleep Schedule", color: "var(--c-secondary)", bg: "var(--c-secondary-dim)",
          content: (
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="settings-sleep-start">Bedtime</label>
                <input id="settings-sleep-start" type="time" className="input" value={profile?.sleep_start || "23:00"} onChange={e => setProfile((p: any) => ({ ...p, sleep_start: e.target.value }))} />
              </div>
              <span style={{ color: "var(--c-text-tertiary)", marginTop: "20px" }}>to</span>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="settings-sleep-end">Wake Up</label>
                <input id="settings-sleep-end" type="time" className="input" value={profile?.sleep_end || "07:00"} onChange={e => setProfile((p: any) => ({ ...p, sleep_end: e.target.value }))} />
              </div>
            </div>
          )
        },
        {
          icon: Bell, title: "Notifications", color: "var(--c-success)", bg: "rgba(34,197,94,0.08)",
          content: (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: "12px" }}>
              {["Study reminders", "Break reminders", "Daily summary", "Motivational tips"].map(n => (
                <label key={n} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: "var(--c-accent)", width: "16px", height: "16px", borderRadius: "4px" }} />
                  <span style={{ fontSize: "14px", color: "var(--c-text-secondary)" }}>{n}</span>
                </label>
              ))}
            </div>
          )
        },
        {
          icon: Shield, title: "Privacy & Security", color: "var(--c-orange)", bg: "var(--c-orange-dim)",
          content: (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: "14px" }}>
              <p style={{ fontSize: "13.5px", color: "#4b5563", lineHeight: 1.6 }}>Your data is encrypted and never sold to third parties.</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button className="btn btn-secondary" style={{ fontSize: "13px", background: "#ffffff", borderColor: "rgba(17,17,21,0.12)", color: "#111115" }}>Change Password</button>
                <button style={{ padding: "8px 16px", borderRadius: "var(--r-md)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#b91c1c", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>Delete Account</button>
              </div>
            </div>
          )
        }
      ].map(({ icon: Icon, title, color, bg, content }, index) => {
        const isPaper = index % 2 === 1;
        return (
          <div key={title} className={isPaper ? "card-paper" : "card"} style={{ padding: "24px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: isPaper ? "rgba(99, 102, 241, 0.08)" : bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Icon size={16} color={isPaper ? "var(--c-accent)" : color} />
              </div>
              <h2 style={{ fontSize: "15.5px", fontWeight: 700, color: isPaper ? "var(--c-text-paper)" : "var(--c-text-primary)" }}>{title}</h2>
            </div>
            {content}
          </div>
        );
      })}

      <button id="save-settings-btn" onClick={saveSettings} className="btn btn-primary" style={{ width: "100%", padding: "12px", justifyContent: "center", fontSize: "14px", fontWeight: 600 }}>
        <Save size={15} /> {saved ? "✓ Saved!" : "Save Changes"}
      </button>
    </div>
  );
}
