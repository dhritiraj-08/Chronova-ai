"use client";

import { useState, useEffect } from "react";
import { 
  Clock, Flame, Play, Pause, RotateCcw, Sparkles, Plus, 
  ArrowRight, BookOpen, AlertCircle, CheckCircle2, Circle, 
  Brain, HeartPulse, User, MessageSquare, Calendar, Zap, 
  ChevronRight, Award, Trash2 
} from "lucide-react";
import Link from "next/link";
import { useScheduleStore } from "@/lib/store/scheduleStore";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const { 
    events, 
    streak, 
    exams,
    currentMood,
    setCurrentMood,
    scheduleChanges,
    toggleEventDone,
    markEventMissed,
    userName,
    loadFromDatabase,
    isLoading
  } = useScheduleStore();

  const [activeTimerSessionId, setActiveTimerSessionId] = useState<string | number>("");
  const [triggerTimerPlay, setTriggerTimerPlay] = useState(false);

  useEffect(() => {
    loadFromDatabase();
  }, [loadFromDatabase]);

  const now = new Date();
  const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0 (Mon) to 6 (Sun)
  const todayEvents = events
    .filter(e => e.day === todayIdx)
    .sort((a, b) => a.start - b.start);

  const doneCount = todayEvents.filter(e => e.done).length;
  const progressPct = todayEvents.length > 0 ? Math.round((doneCount / todayEvents.length) * 100) : 0;

  // Format decimal hour to HH:MM
  function fmtHour(h: number) {
    const hr = Math.floor(h);
    const min = String(Math.round((h % 1) * 60)).padStart(2, "0");
    const ampm = hr >= 12 ? "PM" : "AM";
    const displayHr = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
    return `${displayHr}:${min} ${ampm}`;
  }

  // Next upcoming session
  const currentDecimalHour = now.getHours() + now.getMinutes() / 60;
  const nextSession = todayEvents.find(e => !e.done && e.start > currentDecimalHour) || todayEvents.find(e => !e.done);

  // Next upcoming exam
  const sortedExams = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date().getTime());
  const upcomingExam = sortedExams.find(ex => new Date(ex.date).getTime() >= new Date().setHours(0,0,0,0));

  // AI Recommendation based on study status & mood
  let aiRecommendation = "You have an optimal schedule today. Start with a 5-minute breathing exercise before your first subject.";
  if (currentMood === "Tired") {
    aiRecommendation = "Energy level is low. We suggest scaling down study blocks slightly and adding 10-minute active recovery breaks.";
  } else if (currentMood === "Stressed") {
    aiRecommendation = "Higher stress levels detected. Focus on revision and practice exercises rather than digesting new concepts.";
  } else if (todayEvents.length > 4 && doneCount === 0) {
    aiRecommendation = "Busy schedule today! Focus on ticking off your first Mathematics session. Avoid cognitive fatigue by taking frequent breaks.";
  } else if (todayEvents.length > 0 && doneCount === todayEvents.length) {
    aiRecommendation = "Outstanding progress! You have completed all today's missions. Enjoy your recovery and rest.";
  }

  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  const handleStartToday = () => {
    if (nextSession) {
      setActiveTimerSessionId(nextSession.id);
      setTriggerTimerPlay(true);
      const timerWidget = document.getElementById("pomodoro-card");
      timerWidget?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/chat";
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", minHeight: "60vh", alignItems: "center", justifyContent: "center", color: "var(--c-text-secondary)" }}>
        <div style={{ fontSize: "13px", fontWeight: 500 }}>Loading Chronova Home...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }} className="animate-fade">
      {/* Top Welcome Panel */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }} className="animate-up">
        <div>
          <p style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--c-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>
            {dateStr}
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "var(--c-text-primary)", letterSpacing: "-0.02em" }}>
            {greeting}, {userName || "Beast"}
          </h2>
          <p style={{ fontSize: "12.5px", color: "var(--c-text-secondary)", marginTop: "2px" }}>
            Let's conquer your academic milestones today.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="card" style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", background: "var(--c-surface-1)", boxShadow: "var(--sh-sm)" }}>
            <Flame size={14} color="var(--c-orange)" />
            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--c-text-primary)" }}>{streak || 0}d streak</span>
          </div>

          <button 
            id="start-today-btn"
            onClick={handleStartToday} 
            className="btn btn-primary" 
            style={{ fontSize: "12.5px", padding: "8px 16px", borderRadius: "var(--r-md)", background: "var(--c-accent)", color: "#FFFFFF", border: "1px solid var(--c-accent)" }}
          >
            Start Focus <ArrowRight size={13} style={{ marginLeft: "2px" }} />
          </button>
        </div>
      </div>

      {/* Redesigned 3-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 0.9fr", gap: "20px" }} className="mobile-column-flex">
        
        {/* Column 1: Today's Focus */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Today's AI Recommendation */}
          <div className="card" style={{
            padding: "16px",
            background: "var(--c-accent-dim)",
            borderColor: "var(--c-accent-border)",
            borderRadius: "var(--r-lg)",
            display: "flex", gap: "12px", alignItems: "flex-start",
            boxShadow: "var(--sh-sm)"
          }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--c-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Brain size={14} color="var(--c-accent)" />
            </div>
            <div>
              <p style={{ fontSize: "9.5px", fontWeight: 700, color: "var(--c-accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Circadian Coach Recommendation
              </p>
              <p style={{ fontSize: "12.5px", color: "var(--c-text-secondary)", marginTop: "2px", lineHeight: 1.45 }}>
                {aiRecommendation}
              </p>
            </div>
          </div>

          {/* Today's Focus List */}
          <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "var(--sh-sm)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-border-1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--c-text-primary)", fontFamily: "var(--font-display)" }}>Today's Focus</h3>
                <p style={{ fontSize: "11px", color: "var(--c-text-tertiary)", marginTop: "1px" }}>
                  {todayEvents.length > 0 ? `${doneCount} of ${todayEvents.length} completed` : "Academic guidance list"}
                </p>
              </div>
              {todayEvents.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div className="progress-track" style={{ width: "60px", height: "4px" }}>
                    <div className="progress-bar" style={{ width: `${progressPct}%`, background: "var(--c-accent)" }} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--c-text-secondary)" }}>{progressPct}%</span>
                </div>
              )}
            </div>

            {/* Checklist Items */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {todayEvents.length === 0 ? (
                /* Onboarding Guidance Checklist instead of blank card */
                <div style={{ padding: "8px 0" }}>
                  <div style={{ padding: "12px 20px" }}>
                    <p style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--c-text-secondary)", marginBottom: "12px" }}>
                      Let's configure your study workspace to kick off revision:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {[
                        { label: "Tell Chronova about your subjects", href: "/settings", desc: "Select subjects and configure difficulty levels" },
                        { label: "Build your first study schedule", href: "/calendar", desc: "AI Optimize your weekly study and classes grid" },
                        { label: "Add your first upcoming exam milestone", href: "/exams", desc: "Start visual readiness progress tracking" }
                      ].map((item, idx) => (
                        <Link key={idx} href={item.href} style={{ textDecoration: "none" }}>
                          <div 
                            style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 12px", borderRadius: "var(--r-md)", border: "1px solid var(--c-border-1)", transition: "all var(--t-fast)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "var(--c-surface-0)"; e.currentTarget.style.borderColor = "var(--c-accent-border)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--c-border-1)"; }}
                          >
                            <div style={{ width: "16px", height: "16px", borderRadius: "var(--r-sm)", border: "1px solid var(--c-border-2)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1px", color: "var(--c-text-tertiary)", fontSize: "10px", fontWeight: 700 }}>
                              {idx + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--c-text-primary)" }}>{item.label}</p>
                              <p style={{ fontSize: "11px", color: "var(--c-text-tertiary)", marginTop: "1px" }}>{item.desc}</p>
                            </div>
                            <ChevronRight size={13} color="var(--c-text-tertiary)" style={{ marginTop: "3px" }} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                todayEvents.map((ev) => (
                  <div 
                    key={ev.id}
                    onClick={() => toggleEventDone(ev.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--c-border-1)",
                      cursor: "pointer",
                      transition: "background var(--t-fast)",
                      opacity: ev.done ? 0.6 : 1
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--c-surface-0)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {ev.done ? (
                      <CheckCircle2 size={16} color="var(--c-success)" style={{ flexShrink: 0 }} />
                    ) : (
                      <Circle size={16} color="var(--c-text-tertiary)" style={{ flexShrink: 0 }} />
                    )}
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--c-text-primary)", textDecoration: ev.done ? "line-through" : "none" }} className="truncate">
                        {ev.title}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--c-text-tertiary)", marginTop: "1px" }}>
                        {fmtHour(ev.start)} – {fmtHour(ev.end)}
                      </p>
                    </div>

                    {!ev.done && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); markEventMissed(ev.id); }}
                        className="btn btn-secondary"
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: "var(--r-sm)",
                          borderColor: "var(--c-orange-border)",
                          background: "var(--c-orange-dim)",
                          color: "var(--c-orange)",
                          cursor: "pointer"
                        }}
                      >
                        Reschedule
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Next Session card */}
          <div className="card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "var(--sh-sm)" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "var(--r-md)", background: "var(--c-accent-dim)", border: "1px solid var(--c-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Zap size={14} color="var(--c-accent)" />
            </div>
            {nextSession ? (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "9px", color: "var(--c-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Next Session</p>
                  <p style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--c-text-primary)", marginTop: "1px" }} className="truncate">
                    {nextSession.title}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--c-text-secondary)", marginTop: "1px" }}>
                    at {fmtHour(nextSession.start)}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setActiveTimerSessionId(nextSession.id);
                    setTriggerTimerPlay(true);
                  }}
                  className="btn btn-icon animate-pulse" 
                  style={{ width: "30px", height: "30px", background: "var(--c-accent)", color: "white" }}
                  title="Focus Now"
                >
                  <Play size={11} fill="currentColor" />
                </button>
              </>
            ) : (
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "9px", color: "var(--c-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Next Session</p>
                <p style={{ fontSize: "12px", color: "var(--c-text-secondary)", marginTop: "1px" }}>
                  No upcoming study sessions. Go to planner to optimize your schedule.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Focus Timer */}
          <FocusTimer 
            id="pomodoro-card"
            todayEvents={todayEvents} 
            toggleEventDone={toggleEventDone} 
            activeSessionId={activeTimerSessionId}
            setActiveSessionId={setActiveTimerSessionId}
            triggerPlay={triggerTimerPlay}
            setTriggerPlay={setTriggerTimerPlay}
          />

          {/* Timeline View */}
          <div className="card" style={{ padding: "16px 20px", boxShadow: "var(--sh-sm)" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "12px" }}>
              Timeline View
            </h3>
            {todayEvents.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", paddingLeft: "14px", borderLeft: "1.5px solid var(--c-border-2)" }}>
                {todayEvents.map((ev) => {
                  const active = nextSession?.id === ev.id;
                  return (
                    <div key={ev.id} style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute", left: "-19px", top: "5px",
                        width: "8px", height: "8px", borderRadius: "50%",
                        background: ev.done ? "var(--c-success)" : active ? "var(--c-accent)" : "var(--c-surface-3)",
                        border: active ? "2px solid var(--c-base)" : "none",
                        boxShadow: active ? "0 0 0 2px var(--c-accent)" : "none"
                      }} />
                      <div>
                        <p style={{ fontSize: "12.5px", fontWeight: 650, color: ev.done ? "var(--c-text-tertiary)" : "var(--c-text-primary)", textDecoration: ev.done ? "line-through" : "none" }}>
                          {ev.title} {active && <span style={{ fontSize: "8.5px", background: "var(--c-accent-dim)", border: "1px solid var(--c-accent-border)", color: "var(--c-accent)", padding: "1px 5px", borderRadius: "4px", marginLeft: "6px", fontWeight: 700 }}>Active</span>}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--c-text-tertiary)", marginTop: "1px" }}>
                          {fmtHour(ev.start)} ({Math.round((ev.end - ev.start) * 60)}m)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: "8px 0", display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", textAlign: "center" }}>
                <Calendar size={24} color="var(--c-text-tertiary)" />
                <p style={{ fontSize: "12px", color: "var(--c-text-secondary)", lineHeight: 1.4, maxWidth: "220px" }}>
                  Timeline is empty. Customize and schedule study slots in the calendar planner.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Insights & Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Study Target Completion Progress Ring */}
          <div className="card" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "var(--sh-sm)" }}>
            <h3 style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--c-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Daily Study Target</h3>
            
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* SVG Ring Progress */}
              <div style={{ position: "relative", width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {(() => {
                  const targetHours = 4.0;
                  const completedHours = todayEvents.filter(e => e.done).reduce((acc, e) => acc + (e.end - e.start), 0);
                  const pct = Math.min(100, Math.round((completedHours / targetHours) * 100));
                  const r = 22;
                  const circ = 2 * Math.PI * r;
                  const offset = circ - (pct / 100) * circ;
                  return (
                    <>
                      <svg width="56" height="56" viewBox="0 0 50 50" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="25" cy="25" r={r} stroke="var(--c-surface-2)" strokeWidth="4.5" fill="transparent" />
                        <circle cx="25" cy="25" r={r} stroke="var(--c-accent)" strokeWidth="4.5" fill="transparent"
                          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s" }} />
                      </svg>
                      <span style={{ position: "absolute", fontSize: "11px", fontWeight: 800, color: "var(--c-text-primary)" }}>{pct}%</span>
                    </>
                  );
                })()}
              </div>

              <div>
                {(() => {
                  const completedHours = todayEvents.filter(e => e.done).reduce((acc, e) => acc + (e.end - e.start), 0);
                  return (
                    <>
                      <p style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--c-text-primary)" }}>{completedHours.toFixed(1)} hrs completed</p>
                      <p style={{ fontSize: "11px", color: "var(--c-text-secondary)", marginTop: "1px" }}>Target: 4.0 hours daily study</p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Upcoming Exam readiness count down */}
          <div className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "var(--sh-sm)" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "var(--r-md)", background: "var(--c-orange-dim)", border: "1px solid var(--c-orange-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Award size={14} color="var(--c-orange)" />
            </div>
            {upcomingExam ? (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "9px", color: "var(--c-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Upcoming Exam</p>
                  <p style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--c-text-primary)", marginTop: "1px" }} className="truncate">
                    {upcomingExam.name}
                  </p>
                  <p style={{ fontSize: "10.5px", color: "var(--c-text-secondary)", marginTop: "1px" }}>
                    {upcomingExam.date} ({Math.max(0, Math.ceil((new Date(upcomingExam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}d remaining)
                  </p>
                </div>
                <Link href="/exams">
                  <button className="btn btn-icon" style={{ width: "26px", height: "26px" }}>
                    <ChevronRight size={12} />
                  </button>
                </Link>
              </>
            ) : (
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "9px", color: "var(--c-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Upcoming Exam</p>
                <p style={{ fontSize: "12px", color: "var(--c-text-secondary)", marginTop: "1px" }}>
                  No upcoming exams. Register your exams to generate revision logs.
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="card" style={{ padding: "14px 16px", boxShadow: "var(--sh-sm)" }}>
            <h3 style={{ fontSize: "9.5px", fontWeight: 700, color: "var(--c-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {[
                { href: "/chat",     icon: MessageSquare, label: "Ask Academic Mentor", sub: "Request timetable changes" },
                { href: "/calendar", icon: Calendar,      label: "Optimize Schedule", sub: "Tweak class & study slots" },
                { href: "/settings", icon: HeartPulse,    label: "Workspace Preference", sub: "Toggle academic tags & styles" },
              ].map(({ href, icon: Icon, label, sub }) => (
                <Link key={label} href={href} style={{ textDecoration: "none" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px", borderRadius: "var(--r-md)", transition: "background var(--t-fast)", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--c-surface-0)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: "26px", height: "26px", borderRadius: "var(--r-sm)", background: "var(--c-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={12} color="var(--c-text-secondary)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--c-text-primary)" }}>{label}</p>
                      <p style={{ fontSize: "10px", color: "var(--c-text-tertiary)" }} className="truncate">{sub}</p>
                    </div>
                    <ChevronRight size={11} color="var(--c-text-tertiary)" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Achievement Badges Panel */}
          <div className="card" style={{ padding: "14px 16px", boxShadow: "var(--sh-sm)" }}>
            <h3 style={{ fontSize: "9.5px", fontWeight: 700, color: "var(--c-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Academic Achievements</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { title: "Bookworm", desc: "Configured study subjects", icon: BookOpen, color: "var(--c-accent)", active: events.length > 0 },
                { title: "Early Bird", desc: "Complete 1 morning study block", icon: Sparkles, color: "var(--c-secondary)", active: todayEvents.some(e => e.done && e.start < 12) },
                { title: "Consistency Hero", desc: "Maintain 3d streak", icon: Flame, color: "var(--c-orange)", active: streak >= 3 },
                { title: "Exam Challenger", desc: "Configure an exam syllabus", icon: Award, color: "var(--c-success)", active: exams.length > 0 }
              ].map((badge, idx) => (
                <div 
                  key={idx} 
                  style={{
                    padding: "8px", 
                    borderRadius: "var(--r-md)", 
                    border: "1px solid " + (badge.active ? "var(--c-border-2)" : "var(--c-border-1)"),
                    background: badge.active ? "var(--c-surface-0)" : "transparent",
                    opacity: badge.active ? 1 : 0.45,
                    display: "flex", flexDirection: "column", gap: "4px",
                    transition: "all var(--t-fast)"
                  }}
                  title={badge.desc}
                >
                  <div style={{ width: "24px", height: "24px", borderRadius: "var(--r-sm)", background: badge.active ? badge.color + "1A" : "var(--c-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <badge.icon size={12} color={badge.active ? badge.color : "var(--c-text-tertiary)"} />
                  </div>
                  <p style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--c-text-primary)" }}>{badge.title}</p>
                  <p style={{ fontSize: "9px", color: "var(--c-text-tertiary)", lineHeight: 1.2 }}>{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .mobile-column-flex {
            display: flex !important;
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}

/* Redesigned Pomodoro Focus Timer Widget */
interface TimerProps {
  id?: string;
  todayEvents: any[];
  toggleEventDone: (id: string | number) => void;
  activeSessionId: string | number;
  setActiveSessionId: (id: string | number) => void;
  triggerPlay: boolean;
  setTriggerPlay: (val: boolean) => void;
}

function FocusTimer({ 
  id,
  todayEvents, 
  toggleEventDone,
  activeSessionId,
  setActiveSessionId,
  triggerPlay,
  setTriggerPlay
}: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [completedBanner, setCompletedBanner] = useState("");

  const uncompletedSessions = todayEvents.filter(e => !e.done);

  useEffect(() => {
    if (triggerPlay) {
      setTimerActive(true);
      setTriggerPlay(false);
    }
  }, [triggerPlay, setTriggerPlay]);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setTimerActive(false);
      if (!isBreakMode) {
        if (activeSessionId) {
          toggleEventDone(activeSessionId);
          const completedSlot = todayEvents.find(e => e.id === activeSessionId);
          setCompletedBanner(`Finished: ${completedSlot?.title || "Focus block"}!`);
          setActiveSessionId("");
        } else {
          setCompletedBanner("Session completed!");
        }
        setIsBreakMode(true);
        setTimeRemaining(5 * 60);
      } else {
        setCompletedBanner("Break completed!");
        setIsBreakMode(false);
        setTimeRemaining(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, isBreakMode, activeSessionId, todayEvents, toggleEventDone, setActiveSessionId]);

  useEffect(() => {
    if (completedBanner) {
      const t = setTimeout(() => setCompletedBanner(""), 4000);
      return () => clearTimeout(t);
    }
  }, [completedBanner]);

  const toggleTimer = () => setTimerActive(!timerActive);
  
  const resetTimer = () => {
    setTimerActive(false);
    setIsBreakMode(false);
    setTimeRemaining(25 * 60);
    setCompletedBanner("");
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, "0")}`;

  const totalTime = isBreakMode ? 5 * 60 : 25 * 60;
  const progressPct = (timeRemaining / totalTime) * 100;
  const circleRadius = 30;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <div id={id} className="card" style={{ padding: "16px 20px", position: "relative", overflow: "hidden" }}>
      <h3 style={{ fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--c-text-primary)" }}>
        Focus Timer
      </h3>
      <p style={{ fontSize: "11px", color: "var(--c-text-tertiary)", marginTop: "1px" }}>
        {isBreakMode ? "Rest and take a deep breath" : "Maintain study consistency"}
      </p>

      {completedBanner && (
        <div style={{
          position: "absolute", inset: "0 0 auto 0", background: "var(--c-accent-dim)",
          borderBottom: "1px solid var(--c-accent-border)", padding: "8px 12px", zIndex: 10, display: "flex", gap: "4px", alignItems: "center"
        }} className="animate-up">
          <Sparkles size={12} color="var(--c-accent-light)" />
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--c-accent-light)" }}>{completedBanner}</span>
        </div>
      )}

      {/* Circle Loader */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "12px 0", position: "relative" }}>
        <svg width="84" height="84" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={circleRadius} stroke="rgba(255,255,255,0.015)" strokeWidth="4" fill="transparent" />
          <circle cx="50" cy="50" r={circleRadius} stroke={isBreakMode ? "var(--c-success)" : "var(--c-accent)"} strokeWidth="4" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.35s" }} />
        </svg>

        <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontSize: "16px", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--c-text-primary)", letterSpacing: "-0.01em" }}>{timeStr}</span>
          <span style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, color: isBreakMode ? "var(--c-success)" : "var(--c-accent-light)" }}>
            {isBreakMode ? "Break" : "Focus"}
          </span>
        </div>
      </div>

      {/* Linked study session dropdown */}
      <div style={{ marginBottom: "10px" }}>
        <label className="form-label" style={{ fontSize: "10px", fontWeight: 600 }} htmlFor="timer-link-session">Link to Focus Session</label>
        <select 
          id="timer-link-session"
          value={activeSessionId} 
          onChange={e => setActiveSessionId(e.target.value)} 
          disabled={timerActive || isBreakMode}
          className="input" 
          style={{ padding: "6px 10px", background: "var(--c-surface-2)", color: "var(--c-text-secondary)", fontSize: "12px" }}
        >
          <option value="">-- General Study --</option>
          {uncompletedSessions.map(s => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={toggleTimer} className="btn btn-primary" style={{ flex: 1, fontSize: "12px", padding: "8px", borderRadius: "var(--r-md)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
          {timerActive ? <><Pause size={12} /> Pause</> : <><Play size={12} fill="currentColor" /> Focus</>}
        </button>
        <button onClick={resetTimer} className="btn btn-secondary" style={{ padding: "8px", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center" }} title="Reset Timer">
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
}
