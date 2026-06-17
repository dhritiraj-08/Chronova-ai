"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Moon, ChevronRight, ChevronLeft, Plus, X, Check, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SUBJECT_COLORS } from "@/lib/utils";

const STEPS = ["Profile", "Subjects", "Schedule", "Goals"];

const EDUCATION_LEVELS = [
  "High School (9-10)", "Higher Secondary (11-12)",
  "Undergraduate", "Postgraduate", "Competitive Exam Prep", "Other"
];

const SAMPLE_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "History", "Geography", "Computer Science", "Economics", "Psychology"
];

const GOAL_OPTIONS = [
  "Score 90%+ in exams", "Get into top college", "Clear competitive exams",
  "Improve focus", "Better time management", "Reduce stress", "Build study habits"
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && !user.user_metadata?.role) {
        supabase.auth.updateUser({
          data: { role: "student" }
        });
      }
    });
  }, [supabase]);
  const [loading, setLoading] = useState(false);

  const [educationLevel, setEducationLevel] = useState("");
  const [age, setAge] = useState("");
  const [subjects, setSubjects] = useState<{ name: string; difficulty: number; color: string }[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [sleepStart, setSleepStart] = useState("23:00");
  const [sleepEnd, setSleepEnd] = useState("07:00");
  const [collegeStart, setCollegeStart] = useState("09:00");
  const [collegeEnd, setCollegeEnd] = useState("15:00");
  const [goals, setGoals] = useState<string[]>([]);

  function addSubject(name: string) {
    if (!name.trim() || subjects.find((s) => s.name === name)) return;
    const color = SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length];
    setSubjects((prev) => [...prev, { name, difficulty: 3, color }]);
    setNewSubject("");
  }

  function removeSubject(name: string) {
    setSubjects((prev) => prev.filter((s) => s.name !== name));
  }

  function toggleGoal(goal: string) {
    setGoals((prev) => prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]);
  }

  function toggleWeak(subj: string) {
    setWeakSubjects((prev) => prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]);
  }

  async function handleFinish() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    await supabase.from("profiles").update({
      education_level: educationLevel,
      age: parseInt(age) || null,
      goals, sleep_start: sleepStart, sleep_end: sleepEnd, onboarded: true,
    }).eq("id", user.id);

    if (subjects.length > 0) {
      await supabase.from("subjects").insert(
        subjects.map((s) => ({
          user_id: user.id, subject_name: s.name,
          difficulty_level: s.difficulty, color: s.color,
          priority: weakSubjects.includes(s.name) ? 3 : 2,
        }))
      );
    }
    router.push("/dashboard");
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }} className="page-bg animate-fade">
      <div className="page-content" style={{ width: "100%", maxWidth: "540px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <Logo size={32} />
        </div>

        {/* Onboarding Container */}
        <div className="card" style={{ padding: "36px", boxShadow: "var(--sh-lg)" }}>

          {/* Step indicator header */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 800, letterSpacing: "-0.015em", color: "var(--c-text-primary)" }}>
                {STEPS[step]} Settings
              </h1>
              <span style={{ fontSize: "12px", color: "var(--c-text-tertiary)", fontWeight: 700 }}>
                STEP {step + 1} OF {STEPS.length}
              </span>
            </div>
            {/* Progress bar */}
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Stepper nodes */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{
                flex: 1, height: "4px", borderRadius: "999px",
                background: i <= step ? "var(--c-accent)" : "rgba(255,255,255,0.035)",
                boxShadow: i <= step ? "0 0 10px var(--c-accent-glow)" : "none",
                transition: "all var(--t-base)"
              }} />
            ))}
          </div>

          {/* ── Step 0: Profile ── */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <label className="form-label">Education level</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {EDUCATION_LEVELS.map((level) => {
                    const selected = educationLevel === level;
                    return (
                      <button key={level} onClick={() => setEducationLevel(level)} style={{
                        padding: "8px 16px", borderRadius: "999px", fontSize: "13px", cursor: "pointer",
                        transition: "all var(--t-base)",
                        background: selected ? "rgba(139, 92, 246, 0.08)" : "transparent",
                        border: selected ? "1px solid rgba(139, 92, 246, 0.25)" : "1px solid var(--c-border-1)",
                        color: selected ? "var(--c-accent-light)" : "var(--c-text-secondary)",
                        fontWeight: selected ? 600 : 400,
                        boxShadow: selected ? "0 4px 12px rgba(139, 92, 246, 0.04)" : "none"
                      }}>{level}</button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="form-label" htmlFor="onboard-age">Age</label>
                <input id="onboard-age" type="number" placeholder="e.g. 18"
                  value={age} onChange={(e) => setAge(e.target.value)}
                  className="input" style={{ maxWidth: "160px" }} min={10} max={40} />
              </div>
            </div>
          )}

          {/* ── Step 1: Subjects ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label className="form-label" style={{ marginBottom: "10px" }}>Quick-add subjects</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                  {SAMPLE_SUBJECTS.map((s) => {
                    const added = !!subjects.find((sub) => sub.name === s);
                    return (
                      <button key={s} onClick={() => addSubject(s)} disabled={added} style={{
                        padding: "7px 14px", borderRadius: "999px", fontSize: "12.5px",
                        cursor: added ? "default" : "pointer",
                        background: added ? "rgba(139, 92, 246, 0.08)" : "rgba(255,255,255,0.02)",
                        border: added ? "1px solid rgba(139, 92, 246, 0.25)" : "1px solid var(--c-border-1)",
                        color: added ? "var(--c-accent-light)" : "var(--c-text-secondary)",
                        transition: "all var(--t-base)",
                        fontWeight: added ? 600 : 400
                      }}>
                        {added ? <Check size={11} style={{ display: "inline", marginRight: "4px" }} /> : <Plus size={11} style={{ display: "inline", marginRight: "4px" }} />}
                        {s}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input id="onboard-subject-input" type="text" placeholder="Add custom subject…"
                    value={newSubject} onChange={(e) => setNewSubject(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSubject(newSubject)}
                    className="input" />
                  <button onClick={() => addSubject(newSubject)} className="btn btn-primary" style={{ padding: "11px 16px", borderRadius: "var(--r-md)" }}>
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {subjects.length > 0 && (
                <div style={{ borderTop: "1px solid var(--c-border-1)", paddingTop: "16px" }}>
                  <label className="form-label" style={{ marginBottom: "10px" }}>Your subjects — tap to mark as weak (needs focus)</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {subjects.map((s) => {
                      const isWeak = weakSubjects.includes(s.name);
                      return (
                        <div key={s.name} style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          padding: "6px 14px", borderRadius: "999px",
                          background: isWeak ? "rgba(244, 63, 94, 0.08)" : `${s.color}16`,
                          border: `1px solid ${isWeak ? "rgba(244, 63, 94, 0.25)" : s.color + "44"}`,
                          boxShadow: isWeak ? "0 4px 12px rgba(244, 63, 94, 0.05)" : "none",
                          transition: "all var(--t-base)"
                        }}>
                          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: isWeak ? "var(--c-orange)" : s.color, boxShadow: isWeak ? "0 0 8px var(--c-orange)" : "none" }} />
                          <button onClick={() => toggleWeak(s.name)} style={{ background: "none", border: "none", color: "var(--c-text-primary)", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
                            {s.name}
                          </button>
                          <button onClick={() => removeSubject(s.name)} style={{ background: "none", border: "none", color: "var(--c-text-tertiary)", cursor: "pointer", display: "flex" }}>
                            <X size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: "11.5px", color: "var(--c-text-tertiary)", marginTop: "10px", fontWeight: 500 }}>Red = weak subject (Chronova schedules these earlier in the day)</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Schedule ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ padding: "20px", background: "rgba(255,255,255,0.015)", borderRadius: "14px", border: "1px solid var(--c-border-1)", backdropFilter: "blur(8px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Moon size={16} color="var(--c-accent-light)" />
                  <label className="form-label" style={{ margin: 0 }}>Sleep schedule</label>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "11px", color: "var(--c-text-tertiary)", fontWeight: 600, marginBottom: "6px" }}>Bedtime</p>
                    <input type="time" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} className="input" />
                  </div>
                  <span style={{ color: "var(--c-text-tertiary)", fontSize: "14px", marginTop: "16px" }}>→</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "11px", color: "var(--c-text-tertiary)", fontWeight: 600, marginBottom: "6px" }}>Wake up</p>
                    <input type="time" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} className="input" />
                  </div>
                </div>
              </div>

              <div style={{ padding: "20px", background: "rgba(255,255,255,0.015)", borderRadius: "14px", border: "1px solid var(--c-border-1)", backdropFilter: "blur(8px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <BookOpen size={16} color="var(--c-secondary-light)" />
                  <label className="form-label" style={{ margin: 0 }}>College / School hours</label>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "11px", color: "var(--c-text-tertiary)", fontWeight: 600, marginBottom: "6px" }}>Start</p>
                    <input type="time" value={collegeStart} onChange={(e) => setCollegeStart(e.target.value)} className="input" />
                  </div>
                  <span style={{ color: "var(--c-text-tertiary)", fontSize: "14px", marginTop: "16px" }}>→</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "11px", color: "var(--c-text-tertiary)", fontWeight: 600, marginBottom: "6px" }}>End</p>
                    <input type="time" value={collegeEnd} onChange={(e) => setCollegeEnd(e.target.value)} className="input" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Goals ── */}
          {step === 3 && (
            <div>
              <label className="form-label" style={{ marginBottom: "14px", display: "block" }}>Select all that apply</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {GOAL_OPTIONS.map((goal) => {
                  const selected = goals.includes(goal);
                  return (
                    <button 
                      key={goal} 
                      onClick={() => toggleGoal(goal)} 
                      style={{
                        display: "flex", alignItems: "center", gap: "14px",
                        padding: "14px 16px", borderRadius: "12px", textAlign: "left",
                        cursor: "pointer", transition: "all var(--t-base)",
                        background: selected ? "rgba(139, 92, 246, 0.08)" : "rgba(255,255,255,0.01)",
                        border: selected ? "1px solid rgba(139, 92, 246, 0.25)" : "1px solid var(--c-border-1)",
                        color: "var(--c-text-primary)",
                        boxShadow: selected ? "0 4px 12px rgba(139, 92, 246, 0.04)" : "none"
                      }}
                    >
                      <div style={{
                        width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
                        background: selected ? "var(--c-accent)" : "rgba(255,255,255,0.035)",
                        border: selected ? "1px solid transparent" : "1px solid var(--c-border-2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all var(--t-fast)",
                        boxShadow: selected ? "0 0 8px var(--c-accent-glow)" : "none"
                      }}>
                        {selected && <Check size={12} color="white" />}
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: 500 }}>{goal}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation controls */}
          <div style={{ display: "flex", gap: "10px", marginTop: "32px" }}>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="btn btn-secondary" style={{ flex: 1, padding: "12px" }}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="btn btn-primary" style={{ flex: 1, padding: "12px" }}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={loading} className="btn btn-primary" style={{ flex: 1, padding: "12px" }}>
                {loading ? <><span className="btn-spinner" /> Setting up…</> : <><Sparkles size={16} /> Finish setup</>}
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: "12.5px", color: "var(--c-text-tertiary)", marginTop: "24px", fontWeight: 500 }}>
          Your data is private and never shared.
        </p>
      </div>
    </div>
  );
}
