"use client";

import { useState, useEffect } from "react";
import {
  Clock, Flame, TrendingUp, CheckCircle2, Circle,
  ChevronRight, Calendar, MessageSquare, Sparkles,
  ArrowUpRight, BookOpen, Moon, Zap, Play, Pause, RotateCcw,
  HeartPulse, CalendarDays, Award, Plus, Trash2, Check, X
} from "lucide-react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { useScheduleStore } from "@/lib/store/scheduleStore";

/* ── Demo data ── */
const AI_TIP = "You've studied 2 heavy subjects (Math + Physics) consecutively today. Consider starting Chemistry with a 5-minute break and a quick concept recap — your retention will be 23% higher.";

const TAG_COLORS: Record<string, string> = {
  Study:  "var(--c-accent-dim)",
  Class:  "var(--c-secondary-dim)",
  Review: "var(--c-orange-dim)",
};

const TAG_TEXT: Record<string, string> = {
  Study:  "var(--c-accent-light)",
  Class:  "var(--c-secondary-light)",
  Review: "var(--c-orange)",
};

export default function DashboardPage() {
  const { 
    events, 
    toggleEventDone,
    xp,
    level,
    streak,
    exams,
    revisions,
    moodHistory,
    currentMood,
    scheduleChanges,
    notifications,
    burnoutMode,
    sleepHistory,
    setCurrentMood,
    setBurnoutMode,
    addExam,
    toggleChapterCompleted,
    generateRevisionPlan,
    addRevisionQueue,
    completeRevisionItem,
    markEventMissed,
    markNotificationRead
  } = useScheduleStore();

  const [activeTab, setActiveTab] = useState<"focus" | "exams" | "spaced" | "health" | "achievements">("focus");

  const now = new Date();
  const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const todayEvents = events.filter(e => e.day === todayIdx);

  function fmtHour(h: number) {
    const hr = Math.floor(h);
    const min = String(Math.round((h % 1) * 60)).padStart(2, "0");
    return `${hr}:${min}`;
  }

  const sessions = todayEvents.map(e => {
    let tag = "Study";
    const lowerTitle = e.title.toLowerCase();
    if (lowerTitle.includes("college") || lowerTitle.includes("class") || lowerTitle.includes("school")) {
      tag = "Class";
    } else if (lowerTitle.includes("revision") || lowerTitle.includes("review") || lowerTitle.includes("recap") || lowerTitle.includes("practice")) {
      tag = "Review";
    }

    return {
      id: e.id,
      subject: e.title,
      from: fmtHour(e.start),
      to: fmtHour(e.end),
      done: e.done,
      tag
    };
  });

  const doneCount = sessions.filter(s => s.done).length;
  const progress = sessions.length > 0 ? Math.round((doneCount / sessions.length) * 100) : 0;

  const completedHours = todayEvents
    .filter(e => e.done)
    .reduce((acc, e) => acc + (e.end - e.start), 0);

  const remainingCount = todayEvents.filter(e => !e.done).length;

  const STATS = [
    {
      label: "Study hours today",
      value: `${completedHours.toFixed(1)}h`,
      change: `Target: 6.0h`,
      up: completedHours >= 6,
      icon: Clock,
      color: "var(--c-accent)"
    },
    {
      label: "Current streak",
      value: `${streak} days`,
      change: "Personal best: 12",
      up: null,
      icon: Flame,
      color: "var(--c-secondary)"
    },
    {
      label: "Productivity score",
      value: sessions.length > 0 ? `${progress}%` : "0%",
      change: sessions.length > 0 ? `${doneCount} of ${sessions.length} done` : "No sessions today",
      up: progress >= 75 ? true : progress <= 40 && sessions.length > 0 ? false : null,
      icon: TrendingUp,
      color: "var(--c-success)"
    },
    {
      label: "Sessions remaining",
      value: `${remainingCount}`,
      change: `${doneCount} completed today`,
      up: null,
      icon: BookOpen,
      color: "var(--c-info)"
    },
  ];

  const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const WEEKLY_BARS = DAYS_SHORT.map((dayName, idx) => {
    const dayHours = events
      .filter(e => e.day === idx && e.done)
      .reduce((acc, e) => acc + (e.end - e.start), 0);
    return {
      day: dayName,
      hours: dayHours,
      target: 6,
      today: idx === todayIdx
    };
  });

  const subjectList = ["Mathematics", "Physics", "Chemistry", "Biology"];
  const subjectColors = ["var(--c-accent-light)", "var(--c-success)", "var(--c-orange)", "var(--c-secondary-light)"];
  
  const SUBJECT_PROGRESS = subjectList.map((name, i) => {
    const doneHours = events
      .filter(e => e.title.toLowerCase().includes(name.toLowerCase()) && e.done)
      .reduce((acc, e) => acc + (e.end - e.start), 0);
    const totalHours = events
      .filter(e => e.title.toLowerCase().includes(name.toLowerCase()))
      .reduce((acc, e) => acc + (e.end - e.start), 0);
      
    return {
      name,
      done: Math.round(doneHours),
      total: Math.max(Math.round(totalHours), 1),
      color: subjectColors[i]
    };
  });

  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <div style={{ maxWidth: "1160px" }} className="animate-fade">

      {/* ── Header with Level, XP & Streak ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }} className="animate-up">
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--c-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
            {dayName}, {dateStr}
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, color: "var(--c-text-primary)", letterSpacing: "-0.025em" }}>
            {greeting}, Student 👋
          </h2>
        </div>

        {/* Gamification Indicator */}
        <div className="card" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: "14px", background: "rgba(15,17,26,0.45)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", fontWeight: 700 }}>
              <span style={{ color: "var(--c-accent-light)" }}>Level {level}</span>
              <span style={{ color: "var(--c-text-tertiary)" }}>{xp}/{level * 500} XP</span>
            </div>
            <div className="progress-track" style={{ width: "130px", height: "5px", background: "rgba(255,255,255,0.05)" }}>
              <div className="progress-bar" style={{ width: `${(xp / (level * 500)) * 100}%` }} />
            </div>
          </div>
          <div style={{ borderLeft: "1px solid var(--c-border-1)", paddingLeft: "14px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Flame size={15} color="var(--c-orange)" />
            <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--c-text-primary)" }}>{streak}d streak</span>
          </div>
        </div>
      </div>

      {/* ── Sub-tabs navigation bar ── */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--c-border-1)", paddingBottom: "12px", marginBottom: "24px", overflowX: "auto" }}>
        {[
          { id: "focus", label: "Focus Dashboard", icon: Zap },
          { id: "exams", label: "Exam Planner", icon: CalendarDays },
          { id: "spaced", label: "Spaced Repetition", icon: BrainIcon },
          { id: "health", label: "Health & Mood OS", icon: HeartPulse },
          { id: "achievements", label: "Achievements & AI", icon: Award },
        ].map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "10px",
              border: active ? "1px solid rgba(139, 92, 246, 0.25)" : "1px solid transparent",
              background: active ? "rgba(139, 92, 246, 0.08)" : "transparent",
              color: active ? "var(--c-accent-light)" : "var(--c-text-secondary)",
              fontWeight: active ? 700 : 500, fontSize: "13.5px", cursor: "pointer", transition: "all var(--t-fast)",
              whiteSpace: "nowrap"
            }}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Views Rendering ── */}

      {activeTab === "focus" && (
        <div className="animate-fade">
          {/* AI Insight Banner */}
          <div style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, var(--c-accent-dim), rgba(15,17,26,0.35))",
            border: "1px solid var(--c-accent-border)",
            borderRadius: "16px",
            display: "flex", gap: "16px", alignItems: "flex-start",
            marginBottom: "28px",
            boxShadow: "0 8px 32px rgba(139, 92, 246, 0.05)",
            backdropFilter: "blur(12px)",
            position: "relative"
          }} className="animate-up-1">
            <span style={{
              position: "absolute", top: "16px", right: "16px",
              width: "8px", height: "8px", borderRadius: "50%",
              background: "var(--c-accent)",
              boxShadow: "0 0 10px var(--c-accent)"
            }} className="animate-pulse" />

            <div style={{
              width: "38px", height: "38px", borderRadius: "10px",
              background: "var(--c-accent-dim)", border: "1px solid var(--c-accent-border)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <Sparkles size={17} color="var(--c-accent-light)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--c-accent-light)", marginBottom: "6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Chronova Insight
              </p>
              <p style={{ fontSize: "14px", color: "var(--c-text-secondary)", lineHeight: 1.65 }}>{AI_TIP}</p>
            </div>
            <Link href="/chat" style={{ marginLeft: "12px", alignSelf: "center", flexShrink: 0 }}>
              <button className="btn btn-secondary" style={{ fontSize: "12.5px", padding: "8px 16px", borderRadius: "var(--r-md)" }}>
                Ask Coach <ChevronRight size={14} style={{ marginLeft: "2px" }} />
              </button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="dashboard-stats-grid animate-up-2" style={{ marginBottom: "28px" }}>
            {STATS.map(({ label, value, change, up, icon: Icon, color }, index) => {
              const isPaper = index === 0;
              return (
                <div key={label} className={isPaper ? "card-paper card-paper-hover" : "card card-hover"} style={{ padding: "24px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                    <p style={{ fontSize: "11px", color: isPaper ? "#4b5563" : "var(--c-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "9px",
                      background: isPaper ? "#ffffff" : "var(--c-surface-3)",
                      border: isPaper ? "1px solid rgba(12,13,18,0.12)" : "1px solid var(--c-border-1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <Icon size={16} color={isPaper ? "var(--c-accent)" : "var(--c-text-primary)"} />
                    </div>
                  </div>
                  <p style={{
                    color: isPaper ? "var(--c-text-paper)" : "var(--c-text-primary)",
                    fontFamily: "var(--font-display)",
                    fontSize: "36px",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    marginBottom: "8px"
                  }}>{value}</p>
                  <p style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: isPaper
                      ? (up === true ? "#047857" : up === false ? "#b91c1c" : "#4b5563")
                      : (up === true ? "var(--c-success)" : up === false ? "var(--c-danger)" : "var(--c-text-tertiary)")
                  }}>
                    {up === true ? "↑ " : up === false ? "↓ " : ""}{change}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Main Grid */}
          <div className="dashboard-main-grid animate-up-3">
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Daily Focus Load Index */}
              {(() => {
                const scheduledHoursToday = todayEvents.reduce((acc, e) => acc + (e.end - e.start), 0);
                let loadTitle = "Optimal Load";
                let loadMsg = "Your load is optimal. Keep studying!";
                let loadBadge = "Balanced Schedule";
                let loadColor = "var(--c-secondary)";
                let loadBg = "rgba(6, 182, 212, 0.05)";
                let loadBorder = "rgba(6, 182, 212, 0.15)";
                
                if (scheduledHoursToday > 8) {
                  loadTitle = "High Study Load";
                  loadMsg = `Careful! You have scheduled a heavy study load of ${scheduledHoursToday.toFixed(1)}h today. Remember to use the Pomodoro timer, take 10-minute breaks, and protect your sleep after 10 PM.`;
                  loadBadge = "Burnout Risk Alert";
                  loadColor = "var(--c-orange)";
                  loadBg = "rgba(244, 63, 94, 0.05)";
                  loadBorder = "rgba(244, 63, 94, 0.18)";
                } else if (scheduledHoursToday >= 4 && scheduledHoursToday <= 8) {
                  loadTitle = "Optimal Study Load";
                  loadMsg = `Balanced focus load of ${scheduledHoursToday.toFixed(1)}h today. This is the optimal range for cognitive energy and long-term memory consolidation. Start with your heaviest subject!`;
                  loadBadge = "Optimal Focus";
                  loadColor = "var(--c-secondary-light)";
                  loadBg = "rgba(6, 182, 212, 0.05)";
                  loadBorder = "rgba(6, 182, 212, 0.18)";
                } else if (scheduledHoursToday < 4 && scheduledHoursToday > 0) {
                  loadTitle = "Light Study Load";
                  loadMsg = `You have scheduled ${scheduledHoursToday.toFixed(1)}h of studies today. This is a perfect day for active recall recaps, flashcard reviews, or organized self-study.`;
                  loadBadge = "Active Recovery";
                  loadColor = "var(--c-success)";
                  loadBg = "rgba(16, 185, 129, 0.05)";
                  loadBorder = "rgba(16, 185, 129, 0.18)";
                } else {
                  loadTitle = "Rest Day Scheduled";
                  loadMsg = "No study sessions are scheduled for today. Enjoy your recovery, clear your mind, or ask the AI Coach to suggest a light concept recap plan!";
                  loadBadge = "Mental Recovery";
                  loadColor = "var(--c-text-secondary)";
                  loadBg = "rgba(148, 163, 184, 0.05)";
                  loadBorder = "rgba(148, 163, 184, 0.15)";
                }

                return (
                  <div className="card animate-up-1" style={{ padding: "18px 20px", display: "flex", gap: "14px", alignItems: "flex-start", borderLeft: `4px solid ${loadColor}`, background: loadBg, borderColor: loadBorder }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Zap size={16} color={loadColor} />
                    </div>
                    <div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 750, color: "var(--c-text-primary)" }}>{loadTitle}</h4>
                        <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--c-border-1)", color: loadColor, fontWeight: 700, textTransform: "uppercase" }}>{loadBadge}</span>
                      </div>
                      <p style={{ fontSize: "12.5px", color: "var(--c-text-secondary)", marginTop: "4px", lineHeight: 1.5 }}>{loadMsg}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Today's Sessions list */}
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--c-border-1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--c-text-primary)" }}>Today's sessions</h3>
                    <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginTop: "2px" }}>{doneCount} of {sessions.length} complete</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "90px" }}>
                      <div className="progress-track">
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--c-accent-light)", minWidth: "34px", textAlign: "right" }}>{progress}%</span>
                  </div>
                </div>

                <div>
                  {sessions.map((s, i) => (
                    <div
                      key={s.id}
                      onClick={() => toggleEventDone(s.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: "16px",
                        padding: "15px 24px",
                        borderBottom: i < sessions.length - 1 ? "1px solid var(--c-border-1)" : "none",
                        cursor: "pointer",
                        transition: "all var(--t-base)",
                        opacity: s.done ? 0.5 : 1,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      {s.done
                        ? <CheckCircle2 size={19} color="var(--c-success)" style={{ flexShrink: 0, transition: "transform var(--t-fast)" }} />
                        : <Circle size={19} color="var(--c-border-2)" style={{ flexShrink: 0, transition: "transform var(--t-fast)" }} />
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "14px", fontWeight: 600, textDecoration: s.done ? "line-through" : "none", color: s.done ? "var(--c-text-tertiary)" : "var(--c-text-primary)", transition: "all var(--t-base)" }}>
                          {s.subject}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginTop: "2px" }}>
                          {s.from} – {s.to}
                        </p>
                      </div>

                      {/* Add Adaptive Rescheduling X button trigger */}
                      {!s.done && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); markEventMissed(s.id); }}
                          className="btn btn-ghost"
                          style={{ fontSize: "11px", color: "var(--c-orange)", padding: "4px 8px", borderRadius: "6px" }}
                          title="Reschedule session"
                        >
                          Missed
                        </button>
                      )}

                      <span style={{
                        padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700,
                        background: TAG_COLORS[s.tag] || "var(--c-surface-3)",
                        color: TAG_TEXT[s.tag] || "var(--c-text-tertiary)",
                        border: `1px solid ${TAG_TEXT[s.tag]}1e`
                      }}>
                        {s.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Hours Bar Chart */}
              <div className="card" style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--c-text-primary)" }}>Study hours this week</h3>
                    <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginTop: "2px" }}>vs 6h daily target</p>
                  </div>
                  <Link href="/analytics">
                    <button className="btn btn-ghost" style={{ fontSize: "12.5px", padding: "6px 12px" }}>
                      Full analytics <ArrowUpRight size={13} style={{ marginLeft: "2px" }} />
                    </button>
                  </Link>
                </div>

                <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "100px", padding: "0 10px" }}>
                  {WEEKLY_BARS.map(({ day, hours, target, today }) => (
                    <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "100%", height: "70px", display: "flex", alignItems: "flex-end", position: "relative" }}>
                        <div style={{ position: "absolute", bottom: `${(target / 10) * 70}px`, left: 0, right: 0, height: "1px", borderTop: "1px dashed var(--c-border-2)", opacity: 0.3 }} />
                        <div style={{
                          width: "100%",
                          height: `${(hours / 10) * 70}px`,
                          borderRadius: "6px 6px 0 0",
                          background: today 
                            ? "linear-gradient(180deg, var(--c-accent), rgba(139,92,246,0.3))" 
                            : hours >= target 
                              ? "linear-gradient(180deg, var(--c-secondary), rgba(6,182,212,0.3))" 
                              : "linear-gradient(180deg, var(--c-surface-3), rgba(32,38,60,0.3))",
                          border: today 
                            ? "1px solid var(--c-accent-border)" 
                            : hours >= target 
                              ? "1px solid var(--c-secondary-border)" 
                              : "1px solid var(--c-border-1)",
                          borderBottom: "none",
                          boxShadow: today ? "0 0 14px var(--c-accent-glow)" : "none",
                          transition: "height 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                        }} />
                      </div>
                      <p style={{ fontSize: "11px", color: today ? "var(--c-accent-light)" : "var(--c-text-tertiary)", fontWeight: today ? 700 : 500 }}>{day}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Pomodoro Timer */}
              <FocusTimer todayEvents={todayEvents} toggleEventDone={toggleEventDone} />

              {/* Subject Progress */}
              <div className="card" style={{ padding: "20px 24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--c-text-primary)", marginBottom: "18px" }}>Subject progress</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {SUBJECT_PROGRESS.map(({ name, done, total, color }) => {
                    const pct = Math.round((done / total) * 100);
                    return (
                      <div key={name}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--c-text-secondary)" }}>{name}</span>
                          <span style={{ fontSize: "12.5px", fontWeight: 700, color }}>{done}/{total} hrs</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card" style={{ padding: "18px 20px" }}>
                <h3 style={{ fontSize: "11px", fontWeight: 700, color: "var(--c-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px", paddingLeft: "4px" }}>Quick actions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {[
                    { href: "/chat",     icon: MessageSquare, label: "Chat with AI coach",      sub: "Ask syllabus advice" },
                    { href: "/calendar", icon: Calendar,      label: "View full calendar",       sub: "Week planner grid" },
                    { href: "/chat",     icon: Moon,          label: "I need a lighter day",     sub: "Adjust session weights" },
                    { href: "/chat",     icon: Zap,           label: "I missed a session",       sub: "Auto-reschedule timeline" },
                  ].map(({ href, icon: Icon, label, sub }) => (
                    <Link key={label} href={href} style={{ textDecoration: "none" }}>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px", borderRadius: "10px", transition: "all var(--t-base)", cursor: "pointer" }}
                        className="quick-action-item"
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                          const iconWrap = (e.currentTarget as HTMLElement).querySelector('.icon-wrapper') as HTMLElement;
                          if (iconWrap) {
                            iconWrap.style.background = "var(--c-accent-dim)";
                            iconWrap.style.borderColor = "var(--c-accent-border)";
                          }
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          const iconWrap = (e.currentTarget as HTMLElement).querySelector('.icon-wrapper') as HTMLElement;
                          if (iconWrap) {
                            iconWrap.style.background = "var(--c-surface-2)";
                            iconWrap.style.borderColor = "transparent";
                          }
                        }}
                      >
                        <div 
                          className="icon-wrapper"
                          style={{ 
                            width: "36px", height: "36px", borderRadius: "10px", 
                            background: "var(--c-surface-2)", border: "1px solid transparent",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            transition: "all var(--t-base)"
                          }}
                        >
                          <Icon size={16} color="var(--c-accent-light)" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--c-text-primary)" }}>{label}</p>
                          <p style={{ fontSize: "11.5px", color: "var(--c-text-tertiary)", marginTop: "2px" }}>{sub}</p>
                        </div>
                        <ChevronRight size={14} color="var(--c-text-tertiary)" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Exam Planner Tab View ── */}
      {activeTab === "exams" && (
        <div className="animate-fade" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}>
          {/* Exam List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card" style={{ padding: "20px 24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 750, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>Active Exams</h3>
              <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginBottom: "20px" }}>Generate revision plans and track your readiness</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {exams.map(exam => {
                  const daysRemaining = Math.max(0, Math.ceil((new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                  const readiness = Math.round((exam.completedChapters / exam.chapters) * 100);
                  return (
                    <div key={exam.id} style={{ padding: "18px", border: "1px solid var(--c-border-1)", background: "rgba(255,255,255,0.015)", borderRadius: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: exam.priority === "High" ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.05)", border: exam.priority === "High" ? "1px solid rgba(244,63,94,0.3)" : "1px solid var(--c-border-1)", color: exam.priority === "High" ? "var(--c-orange)" : "var(--c-text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>
                            {exam.priority} Priority
                          </span>
                          <h4 style={{ fontSize: "16px", fontWeight: 750, color: "var(--c-text-primary)", marginTop: "6px" }}>{exam.name}</h4>
                          <p style={{ fontSize: "12.5px", color: "var(--c-text-secondary)", marginTop: "2px" }}>Subject: {exam.subject} &middot; Exam Date: {exam.date}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--c-accent-light)" }}>{daysRemaining} days</span>
                          <p style={{ fontSize: "11px", color: "var(--c-text-tertiary)" }}>remaining</p>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px", alignItems: "center", borderTop: "1px solid var(--c-border-1)", paddingTop: "12px" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontSize: "12.5px", color: "var(--c-text-secondary)", fontWeight: 600 }}>Readiness Score</span>
                            <span style={{ fontSize: "12.5px", color: "var(--c-accent-light)", fontWeight: 750 }}>{readiness}%</span>
                          </div>
                          <div className="progress-track" style={{ height: "6px" }}>
                            <div style={{ width: `${readiness}%`, height: "100%", background: "var(--c-accent)", borderRadius: "999px" }} />
                          </div>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", color: "var(--c-text-secondary)", fontWeight: 600 }}>Chapters:</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button 
                              onClick={() => toggleChapterCompleted(exam.id, Math.max(0, exam.completedChapters - 1))}
                              style={{ width: "24px", height: "24px", borderRadius: "6px", background: "var(--c-surface-3)", border: "1px solid var(--c-border-1)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
                            >-</button>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--c-text-primary)" }}>{exam.completedChapters}/{exam.chapters}</span>
                            <button 
                              onClick={() => toggleChapterCompleted(exam.id, Math.min(exam.chapters, exam.completedChapters + 1))}
                              style={{ width: "24px", height: "24px", borderRadius: "6px", background: "var(--c-surface-3)", border: "1px solid var(--c-border-1)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
                            >+</button>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: "8px" }}>
                        {exam.revisionPlanGenerated ? (
                          <span style={{ fontSize: "12px", color: "var(--c-success)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                            ✓ AI revision plan generated & milestones added to calendar
                          </span>
                        ) : (
                          <button 
                            onClick={() => generateRevisionPlan(exam.id)}
                            className="btn btn-primary" style={{ fontSize: "12.5px", padding: "8px 14px", width: "100%" }}
                          >
                            Generate AI Revision Plan & Milestones
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Add Exam form */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 750, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "18px" }}>Add New Exam</h3>
            <form onSubmit={e => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = new FormData(form);
              addExam({
                name: data.get("name") as string,
                subject: data.get("subject") as string,
                date: data.get("date") as string,
                chapters: parseInt(data.get("chapters") as string) || 8,
                completedChapters: 0,
                priority: data.get("priority") as any
              });
              form.reset();
            }} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Exam Title</label>
                <input name="name" required className="input" placeholder="e.g. Physics Midterm Exam" style={{ background: "rgba(15,17,26,0.6)", color: "white", border: "1px solid var(--c-border-1)" }} />
              </div>
              <div>
                <label className="form-label">Subject</label>
                <select name="subject" className="input" style={{ background: "rgba(15,17,26,0.6)", color: "white", border: "1px solid var(--c-border-1)" }}>
                  <option value="Mathematics" style={{ background: "#0b0c10" }}>Mathematics</option>
                  <option value="Physics" style={{ background: "#0b0c10" }}>Physics</option>
                  <option value="Chemistry" style={{ background: "#0b0c10" }}>Chemistry</option>
                  <option value="Biology" style={{ background: "#0b0c10" }}>Biology</option>
                </select>
              </div>
              <div>
                <label className="form-label">Exam Date</label>
                <input name="date" type="date" required className="input" style={{ background: "rgba(15,17,26,0.6)", color: "white", border: "1px solid var(--c-border-1)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="form-label">Chapters</label>
                  <input name="chapters" type="number" required defaultValue={8} className="input" style={{ background: "rgba(15,17,26,0.6)", color: "white", border: "1px solid var(--c-border-1)" }} />
                </div>
                <div>
                  <label className="form-label">Priority</label>
                  <select name="priority" className="input" style={{ background: "rgba(15,17,26,0.6)", color: "white", border: "1px solid var(--c-border-1)" }}>
                    <option value="Low" style={{ background: "#0b0c10" }}>Low</option>
                    <option value="Medium" style={{ background: "#0b0c10" }}>Medium</option>
                    <option value="High" style={{ background: "#0b0c10" }}>High</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: "10px", padding: "10px" }}>
                Schedule Exam Plan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Spaced Repetition Tab View ── */}
      {activeTab === "spaced" && (
        <div className="animate-fade" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}>
          {/* Active reviews */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 750, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>Spaced Repetition Queue</h3>
            <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginBottom: "20px" }}>Scientific retention intervals: reviews scheduled at Day 1, 3, 7, 14, and 30.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {revisions.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "rgba(255,255,255,0.015)", border: "1px solid var(--c-border-1)", borderRadius: "12px" }}>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--c-text-primary)" }}>{item.title}</h4>
                    <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginTop: "3px" }}>
                      Subject: {item.subject} &middot; Next Review: {item.nextReviewDate} &middot; Memory Retention: <span style={{ color: item.retentionScore > 80 ? "var(--c-success)" : "var(--c-orange)", fontWeight: 700 }}>{item.retentionScore}%</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => completeRevisionItem(item.id)}
                    className="btn btn-primary" style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    Complete Review
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Side stats & quick queue */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card" style={{ padding: "20px 24px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "12px" }}>Retention Index Score</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--c-secondary-light)" }}>
                    {revisions.length > 0 ? Math.round(revisions.reduce((acc, r) => acc + r.retentionScore, 0) / revisions.length) : 0}%
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: "13.5px", color: "var(--c-text-secondary)", fontWeight: 600 }}>Active Memory Score</p>
                  <p style={{ fontSize: "11.5px", color: "var(--c-text-tertiary)", marginTop: "2px" }}>Keep up reviews to increase total index percentage.</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: "20px 24px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "14px" }}>Queue New Review</h3>
              <form onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = new FormData(form);
                addRevisionQueue(data.get("title") as string, data.get("subject") as string);
                form.reset();
              }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "11px" }}>Concept Title</label>
                  <input name="title" required className="input" placeholder="e.g. Mathematics integration laws" style={{ background: "rgba(15,17,26,0.6)", color: "white", border: "1px solid var(--c-border-1)" }} />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "11px" }}>Subject</label>
                  <select name="subject" className="input" style={{ background: "rgba(15,17,26,0.6)", color: "white", border: "1px solid var(--c-border-1)" }}>
                    <option value="Mathematics" style={{ background: "#0b0c10" }}>Mathematics</option>
                    <option value="Physics" style={{ background: "#0b0c10" }}>Physics</option>
                    <option value="Chemistry" style={{ background: "#0b0c10" }}>Chemistry</option>
                    <option value="Biology" style={{ background: "#0b0c10" }}>Biology</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-secondary" style={{ marginTop: "6px" }}>
                  Add to queue
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Health & Mood OS Tab View ── */}
      {activeTab === "health" && (() => {
        let moodScore = 30;
        if (currentMood === "Burned Out") moodScore = 95;
        else if (currentMood === "Stressed") moodScore = 75;
        else if (currentMood === "Tired") moodScore = 60;
        else if (currentMood === "Normal") moodScore = 30;
        else if (currentMood === "Motivated") moodScore = 15;
        else if (currentMood === "Focused") moodScore = 10;

        const sleepDebt = sleepHistory.some(s => s.hours < 6);
        let finalBurnoutScore = moodScore + (sleepDebt ? 10 : 0);
        if (burnoutMode) finalBurnoutScore = Math.max(10, finalBurnoutScore - 40);
        finalBurnoutScore = Math.min(100, Math.max(0, finalBurnoutScore));

        let riskLabel = "Low Risk";
        let riskColor = "var(--c-success)";
        let riskDesc = "Your fatigue index is low. Study intervals and sleep duration are balanced.";

        if (finalBurnoutScore > 75) {
          riskLabel = "High Risk";
          riskColor = "var(--c-orange)";
          riskDesc = "Consecutive heavy loads and sleep debt detected. High risk of exhaustion. We strongly recommend enabling Recovery Mode.";
        } else if (finalBurnoutScore > 45) {
          riskLabel = "Medium Risk";
          riskColor = "#eab308";
          riskDesc = "Mild study exhaustion building up. Reduce study loads tomorrow and protect rest periods.";
        }

        const moodScoresMap: Record<string, number> = { "Burned Out": 1, "Stressed": 2, "Tired": 3, "Normal": 4, "Motivated": 5, "Focused": 6 };
        const moodChartData = moodHistory.map(h => ({
          date: h.date.slice(-5),
          score: moodScoresMap[h.mood] || 4,
          mood: h.mood
        }));

        return (
          <div className="animate-fade" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px" }}>
            {/* Left Column: Fatigue OS & mood log */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="card" style={{ padding: "20px 24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 750, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "18px" }}>Exhaustion & Burnout monitor</h3>
                
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "18px" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: `${riskColor}10`, border: `3px solid ${riskColor}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "20px", fontWeight: 850, color: "var(--c-text-primary)" }}>{finalBurnoutScore}</span>
                    <span style={{ fontSize: "8px", textTransform: "uppercase", fontWeight: 700, color: riskColor }}>Fatigue</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: riskColor }}>{riskLabel}</span>
                    <p style={{ fontSize: "12.5px", color: "var(--c-text-secondary)", marginTop: "4px", lineHeight: 1.45 }}>{riskDesc}</p>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--c-border-1)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--c-text-primary)" }}>Timetable Recovery Mode</h4>
                    <p style={{ fontSize: "11.5px", color: "var(--c-text-tertiary)", marginTop: "2px" }}>Caps study hours, increases rest breaks automatically</p>
                  </div>
                  <button 
                    onClick={() => setBurnoutMode(!burnoutMode)}
                    style={{
                      padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                      fontSize: "12px", fontWeight: 700, transition: "all var(--t-fast)",
                      background: burnoutMode ? "var(--c-success)" : "rgba(255,255,255,0.05)",
                      color: burnoutMode ? "white" : "var(--c-text-secondary)"
                    }}
                  >
                    {burnoutMode ? "Active" : "Enable"}
                  </button>
                </div>
              </div>

              {/* Mood Questionnaire */}
              <div className="card" style={{ padding: "20px 24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 750, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>How are you feeling today?</h3>
                <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginBottom: "18px" }}>AI Coach will adjust your schedule to match your mood</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {[
                    { label: "Focused", icon: "⚡" },
                    { label: "Motivated", icon: "🔥" },
                    { label: "Normal", icon: "😊" },
                    { label: "Tired", icon: "😴" },
                    { label: "Stressed", icon: "😰" },
                    { label: "Burned Out", icon: "🚨" },
                  ].map(m => {
                    const selected = currentMood === m.label;
                    return (
                      <button 
                        key={m.label} 
                        onClick={() => setCurrentMood(m.label)}
                        style={{
                          padding: "10px", borderRadius: "10px", cursor: "pointer", fontSize: "12.5px",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                          background: selected ? "rgba(139, 92, 246, 0.08)" : "rgba(15,17,26,0.4)",
                          border: selected ? "1px solid rgba(139, 92, 246, 0.25)" : "1px solid var(--c-border-1)",
                          color: selected ? "var(--c-accent-light)" : "var(--c-text-secondary)",
                          fontWeight: selected ? 700 : 500,
                          transition: "all var(--t-fast)"
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>{m.icon}</span>
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Chart and changes log */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="card" style={{ padding: "20px 24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "12px" }}>Daily Mood Log History</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={moodChartData}>
                    <defs>
                      <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--c-accent)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--c-accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" tick={{ fill: "var(--c-text-tertiary)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[1, 6]} ticks={[1,2,3,4,5,6]} tickFormatter={(v) => ["", "🚨", "😰", "😴", "😊", "🔥", "⚡"][v]} tick={{ fill: "var(--c-text-tertiary)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: any, name: any, props: any) => [props.payload.mood, "Mood"]} contentStyle={{ background: "rgba(15,17,26,0.9)", border: "1px solid var(--c-border-2)", borderRadius: "8px", color: "var(--c-text-primary)" }} />
                    <Area type="monotone" dataKey="score" stroke="var(--c-accent)" strokeWidth={2.5} fill="url(#moodGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Changes widget */}
              <div className="card" style={{ padding: "20px 24px", flex: 1 }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "12px" }}>Adaptive Schedule Changes</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "180px", overflowY: "auto" }}>
                  {scheduleChanges.map(change => (
                    <div key={change.id} style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--c-border-1)", paddingBottom: "8px" }}>
                      <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--c-border-1)", color: "var(--c-accent-light)", fontWeight: 700, height: "fit-content", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        {change.changeType}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "12.5px", color: "var(--c-text-secondary)", lineHeight: 1.4 }}>{change.reason}</p>
                        <p style={{ fontSize: "10px", color: "var(--c-text-tertiary)", marginTop: "2px" }}>{change.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Achievements & Gamification Tab View ── */}
      {activeTab === "achievements" && (
        <div className="animate-fade" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
          {/* Achievements Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Productivity Score Engine Card */}
            <div className="card" style={{ padding: "20px 24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 750, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>Productivity Score Engine</h3>
              <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginBottom: "16px" }}>Dynamic performance calculation based on study metrics</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "20px", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px", background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "14px" }}>
                  <span style={{ fontSize: "40px", fontWeight: 900, color: "var(--c-accent-light)" }}>78</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--c-text-secondary)", textTransform: "uppercase", marginTop: "2px" }}>Overall Score</span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { label: "Focus Score", val: 82, color: "var(--c-accent)" },
                    { label: "Consistency Score", val: 85, color: "var(--c-success)" },
                    { label: "Discipline Score", val: 70, color: "var(--c-orange)" },
                    { label: "Revision Score", val: revisions.length > 0 ? Math.round(revisions.reduce((acc, r) => acc + r.retentionScore, 0) / revisions.length) : 65, color: "var(--c-secondary)" },
                  ].map(cat => (
                    <div key={cat.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
                        <span style={{ color: "var(--c-text-secondary)", fontWeight: 500 }}>{cat.label}</span>
                        <span style={{ color: "var(--c-text-primary)", fontWeight: 700 }}>{cat.val}%</span>
                      </div>
                      <div className="progress-track" style={{ height: "4px" }}>
                        <div style={{ width: `${cat.val}%`, height: "100%", background: cat.color, borderRadius: "999px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Academic Milestones */}
            <div className="card" style={{ padding: "20px 24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 750, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "18px" }}>Academic Milestones</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { name: "Early Bird", desc: "Complete a study session before 8:00 AM", progress: 100, unlocked: true },
                  { name: "Consistency Master", desc: "Maintain a study streak of 5+ consecutive days", progress: 100, unlocked: true },
                  { name: "Revision Expert", desc: "Complete 5 spaced repetition reviews successfully", progress: 40, unlocked: false },
                  { name: "Focus Champion", desc: "Accumulate 15 focus study hours today", progress: 60, unlocked: false },
                ].map(ach => (
                  <div key={ach.name} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px", background: "rgba(255,255,255,0.015)", border: "1px solid var(--c-border-1)", borderRadius: "10px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: ach.unlocked ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.02)", border: ach.unlocked ? "1px solid rgba(139,92,246,0.2)" : "1px solid var(--c-border-1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Award size={18} color={ach.unlocked ? "var(--c-accent-light)" : "var(--c-text-tertiary)"} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--c-text-primary)" }}>{ach.name}</span>
                        <span style={{ fontSize: "11px", color: ach.unlocked ? "var(--c-success)" : "var(--c-text-tertiary)" }}>{ach.unlocked ? "Unlocked" : `${ach.progress}%`}</span>
                      </div>
                      <p style={{ fontSize: "11.5px", color: "var(--c-text-tertiary)", marginTop: "2px" }}>{ach.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges showcase */}
            <div className="card" style={{ padding: "20px 24px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "14px" }}>Unlocked Badges</h3>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {[
                  { name: "Early Bird", label: "🌅 Early Bird" },
                  { name: "Consistency", label: "🔥 Consistency" },
                  { name: "Focus", label: "🎯 Focus Master" },
                ].map(badge => (
                  <div key={badge.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 14px", background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(255,255,255,0.01))", border: "1px solid var(--c-accent-border)", borderRadius: "10px" }}>
                    <span style={{ fontSize: "20px" }}>{badge.label.split(" ")[0]}</span>
                    <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--c-text-primary)" }}>{badge.label.split(" ").slice(1).join(" ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI insights and smart notifications feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* AI Insights Card */}
            <div className="card" style={{ padding: "20px 24px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "14px" }}>AI Insights Center</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  "You perform best between 7 AM and 10 AM, with 88% average retention score.",
                  "Mathematics receives 35% more focus than Biology this week.",
                  "Physics completion rate increased by 22% vs. last week.",
                ].map((ins, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <Sparkles size={14} color="var(--c-accent-light)" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <p style={{ fontSize: "12.5px", color: "var(--c-text-secondary)", lineHeight: 1.4 }}>{ins}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart notifications */}
            <div className="card" style={{ padding: "20px 24px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "14px" }}>Smart Notifications Feed</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto" }}>
                {notifications.map(notif => (
                  <div key={notif.id} style={{ padding: "10px", borderBottom: "1px solid var(--c-border-1)", display: "flex", flexDirection: "column", gap: "6px", opacity: notif.read ? 0.6 : 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12.5px", color: "var(--c-text-primary)", fontWeight: 500 }}>{notif.text}</span>
                      <span style={{ fontSize: "10px", color: "var(--c-text-tertiary)" }}>{notif.time}</span>
                    </div>
                    {notif.actionText && (
                      <button 
                        onClick={() => {
                          if (notif.actionType === "recovery") {
                            setBurnoutMode(true);
                          } else if (notif.actionType === "reschedule") {
                            const firstUncompleted = events.find(e => !e.done);
                            if (firstUncompleted) markEventMissed(firstUncompleted.id);
                          }
                          markNotificationRead(notif.id);
                        }}
                        className="btn btn-primary" style={{ alignSelf: "flex-start", fontSize: "11px", padding: "4px 10px" }}
                      >
                        {notif.actionText}
                      </button>
                    )}
                    {!notif.read && (
                      <button 
                        onClick={() => markNotificationRead(notif.id)}
                        style={{ alignSelf: "flex-end", background: "none", border: "none", color: "var(--c-text-tertiary)", fontSize: "10px", cursor: "pointer" }}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right column */}
      {activeTab === "focus" && (
        <div style={{ display: "none" }} /> // Hidden block to preserve grid alignment in sub-layout
      )}

      <style jsx global>{`
        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .dashboard-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-main-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .dashboard-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

interface FocusTimerProps {
  todayEvents: any[];
  toggleEventDone: (id: string | number) => void;
}

function FocusTimer({ todayEvents, toggleEventDone }: FocusTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | number>("");
  const [completedBanner, setCompletedBanner] = useState("");

  const uncompletedSessions = todayEvents.filter(e => !e.done);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setTimerActive(false);
      if (!isBreakMode) {
        if (selectedSessionId) {
          toggleEventDone(selectedSessionId);
          const completedSlot = todayEvents.find(e => e.id === selectedSessionId);
          setCompletedBanner(`Finished: ${completedSlot?.title || "Session"}! marked done. 🌟`);
          setSelectedSessionId("");
        } else {
          setCompletedBanner("Study session completed! marked done. 🌟");
        }
        setIsBreakMode(true);
        setTimeRemaining(5 * 60);
      } else {
        setCompletedBanner("Break completed! Time to get back to focus. ⚡");
        setIsBreakMode(false);
        setTimeRemaining(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, isBreakMode, selectedSessionId, todayEvents, toggleEventDone]);

  useEffect(() => {
    if (completedBanner) {
      const t = setTimeout(() => setCompletedBanner(""), 6000);
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

  const skipTimer = () => {
    if (timerActive) {
      setTimeRemaining(3);
    }
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, "0")}`;

  const totalTime = isBreakMode ? 5 * 60 : 25 * 60;
  const progressPct = (timeRemaining / totalTime) * 100;
  const circleRadius = 34;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="card" style={{ padding: "20px 24px", position: "relative", overflow: "hidden" }}>
      <h3 style={{ fontSize: "15px", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--c-text-primary)", marginBottom: "4px" }}>
        Chronova Pomodoro
      </h3>
      <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginBottom: "16px" }}>
        {isBreakMode ? "Rest and recover" : "Focus on active recall"}
      </p>

      {completedBanner && (
        <div style={{
          position: "absolute", inset: "0 0 auto 0", background: "linear-gradient(90deg, var(--c-accent-dim), rgba(15,17,26,0.95))",
          borderBottom: "1px solid var(--c-accent-border)", padding: "10px 16px", zIndex: 10, display: "flex", gap: "8px", alignItems: "center"
        }} className="animate-up">
          <Sparkles size={14} color="var(--c-accent-light)" className="animate-pulse" />
          <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--c-accent-light)" }}>{completedBanner}</span>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "14px 0", position: "relative" }}>
        <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={circleRadius} stroke="rgba(255,255,255,0.02)" strokeWidth="6" fill="transparent" />
          <circle cx="50" cy="50" r={circleRadius} stroke={isBreakMode ? "var(--c-success)" : "var(--c-accent)"} strokeWidth="6" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.35s" }} />
        </svg>

        <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--c-text-primary)" }}>{timeStr}</span>
          <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: isBreakMode ? "var(--c-success)" : "var(--c-accent-light)", marginTop: "-2px" }}>
            {isBreakMode ? "Break" : "Study"}
          </span>
        </div>

        {timerActive && (
          <button onClick={skipTimer} style={{ position: "absolute", bottom: "10px", right: "20px", background: "none", border: "none", color: "rgba(255,255,255,0.15)", fontSize: "9px", cursor: "pointer", fontWeight: 700 }} title="Skip Timer">
            Skip
          </button>
        )}
      </div>

      <div style={{ marginBottom: "14px" }}>
        <label className="form-label" style={{ fontSize: "11px", fontWeight: 700 }}>Link to session</label>
        <select 
          value={selectedSessionId} 
          onChange={e => setSelectedSessionId(e.target.value)} 
          disabled={timerActive || isBreakMode}
          className="input" 
          style={{ padding: "8px 12px", background: "rgba(15,17,26,0.65)", color: "var(--c-text-secondary)", fontSize: "12px", border: "1px solid var(--c-border-1)" }}
        >
          <option value="" style={{ background: "#08090f", color: "var(--c-text-secondary)" }}>-- General Study / No Link --</option>
          {uncompletedSessions.map(s => (
            <option key={s.id} value={s.id} style={{ background: "#08090f", color: "var(--c-text-secondary)" }}>
              {s.subject} ({s.from} - {s.to})
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={toggleTimer} className="btn btn-primary" style={{ flex: 1, fontSize: "12.5px", padding: "10px", borderRadius: "8px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          {timerActive ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Start Focus</>}
        </button>
        <button onClick={resetTimer} className="btn btn-secondary" style={{ padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }} title="Reset Timer">
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}

// Inline fallback icon for Brain to avoid import dependency mismatches
function BrainIcon({ size }: { size?: number }) {
  return (
    <svg width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2z" />
    </svg>
  );
}
