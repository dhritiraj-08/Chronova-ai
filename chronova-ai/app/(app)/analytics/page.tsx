"use client";

import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, Clock, Target, Brain, Award, Flame } from "lucide-react";
import { useScheduleStore } from "@/lib/store/scheduleStore";

const SLEEP_DATA = [
  { day: "Mon", hours: 7.5 },
  { day: "Tue", hours: 6.0 },
  { day: "Wed", hours: 8.0 },
  { day: "Thu", hours: 5.5 },
  { day: "Fri", hours: 7.0 },
  { day: "Sat", hours: 9.0 },
  { day: "Sun", hours: 8.5 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card" style={{
        padding: "10px 14px", 
        fontSize: "12.5px", 
        border: "1px solid var(--c-border-2)",
        background: "rgba(15, 17, 26, 0.9)",
        boxShadow: "var(--sh-md)"
      }}>
        <p style={{ color: "var(--c-text-tertiary)", marginBottom: "4px", fontWeight: 500 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color || "var(--c-accent-light)", fontWeight: 700 }}>
            {p.name === "hours" ? "Hours" : p.name === "target" ? "Target" : "Score"}: {p.value}{p.name === "score" ? "%" : "h"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { events } = useScheduleStore();

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // 1. Dynamic study hours data
  const STUDY_HOURS_DATA = DAYS.map((d, idx) => {
    const hoursCompleted = events
      .filter(e => e.day === idx && e.done)
      .reduce((acc, e) => acc + (e.end - e.start), 0);
    return {
      day: d,
      hours: Number(hoursCompleted.toFixed(1)),
      target: 6
    };
  });

  // 2. Dynamic subject data
  const SUBJECT_COLORS = [
    "var(--c-accent)",
    "var(--c-success)",
    "var(--c-orange)",
    "var(--c-secondary)",
    "var(--c-text-secondary)",
    "rgba(99, 102, 241, 0.85)"
  ];
  
  const uniqueSubjectsMap: Record<string, number> = {};
  const hasCompletedHours = events.some(e => e.done);
  events.forEach(e => {
    let title = e.title;
    if (title.toLowerCase().includes("college")) title = "Classes/College";
    else if (title.toLowerCase().includes("gym") || title.toLowerCase().includes("workout")) title = "Gym/Sports";
    
    const countHours = hasCompletedHours ? (e.done ? e.end - e.start : 0) : (e.end - e.start);
    uniqueSubjectsMap[title] = (uniqueSubjectsMap[title] || 0) + countHours;
  });

  const rawSubjectData = Object.entries(uniqueSubjectsMap)
    .map(([name, hours], idx) => ({
      name,
      hours: Number(hours.toFixed(1)),
      color: SUBJECT_COLORS[idx % SUBJECT_COLORS.length]
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);

  // Ensure SUBJECT_DATA has fallback if empty
  const SUBJECT_DATA = rawSubjectData.length > 0 ? rawSubjectData : [
    { name: "No Studies Scheduled", hours: 0, color: "var(--c-text-disabled)" }
  ];

  // 3. Dynamic productivity trend data
  const currentWeekScore = events.length > 0
    ? Math.round((events.filter(e => e.done).length / events.length) * 100)
    : 0;

  const PRODUCTIVITY_DATA = [
    { week: "Wk 2", score: 62 },
    { week: "Wk 3", score: 65 },
    { week: "Wk 4", score: 68 },
    { week: "Wk 5", score: 72 },
    { week: "Wk 6", score: 75 },
    { week: "Wk 7", score: 79 },
    { week: "Wk 8 (This)", score: currentWeekScore },
  ];

  // 4. Dynamic monthly goal progress
  const completedHoursThisWeek = events
    .filter(e => e.done)
    .reduce((acc, e) => acc + (e.end - e.start), 0);

  const GOALS = [
    { label: "Complete 40 hrs/month", progress: Math.min(Math.round((completedHoursThisWeek / 10) * 100), 100), color: "var(--c-accent)" },
    { label: "Maintain 80+ score", progress: Math.min(Math.round((currentWeekScore / 80) * 100), 100), color: "var(--c-secondary)" },
    { label: "Sleep 7+ hrs/night", progress: 71, color: "var(--c-success)" },
    { label: "No missed sessions", progress: events.length > 0 ? Math.round((events.filter(e => e.done).length / events.length) * 100) : 100, color: "var(--c-orange)" },
  ];

  const totalHours = Number(completedHoursThisWeek.toFixed(1));
  const avgSleep = (SLEEP_DATA.reduce((s, d) => s + d.hours, 0) / SLEEP_DATA.length).toFixed(1);
  const topSubject = SUBJECT_DATA[0];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }} className="animate-fade">
      <div style={{ marginBottom: "28px" }} className="animate-up">
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, color: "var(--c-text-primary)", letterSpacing: "-0.025em" }}>
          Analytics Overview
        </h1>
        <p style={{ color: "var(--c-text-secondary)", marginTop: "4px" }}>
          Your academic performance metrics and syllabus coverage
        </p>
      </div>

      {/* Top stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }} className="animate-up-1">
        {[
          { label: "Total Study Hours", value: `${totalHours}h`, icon: Clock, color: "var(--c-accent)", sub: "This week", colorLight: "var(--c-accent-light)" },
          { label: "Avg Productivity", value: "74%", icon: TrendingUp, color: "var(--c-secondary)", sub: "+6% vs last week", colorLight: "var(--c-secondary-light)" },
          { label: "Avg Sleep", value: `${avgSleep}h`, icon: Award, color: "var(--c-success)", sub: "Recommended: 7h+", colorLight: "#86efac" },
          { label: "Top Subject", value: topSubject.name, icon: Brain, color: "var(--c-orange)", sub: `${topSubject.hours}h study hours`, colorLight: "#fda4af" },
          { label: "Current Streak", value: "7 days", icon: Flame, color: "var(--c-secondary)", sub: "Personal best: 12", colorLight: "var(--c-secondary-light)" },
        ].map(({ label, value, icon: Icon, color, colorLight, sub }) => (
          <div key={label} className="card card-hover" style={{ padding: "20px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <p style={{ fontSize: "11px", color: "var(--c-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
              <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: `${color}16`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} color={colorLight} />
              </div>
            </div>
            <p style={{ fontSize: "24px", fontWeight: 850, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>{value}</p>
            <p style={{ fontSize: "11.5px", color: "var(--c-text-tertiary)", marginTop: "4px", fontWeight: 500 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }} className="animate-up-2 bento-grid">

        {/* Study Hours Bar Chart */}
        <div className="bento-card card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 750, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>Daily Study Hours</h3>
          <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginBottom: "20px" }}>vs 6-hour daily target</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={STUDY_HOURS_DATA} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="day" tick={{ fill: "var(--c-text-tertiary)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--c-text-tertiary)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.015)" }} />
              <Bar dataKey="hours" fill="var(--c-accent)" radius={[4, 4, 0, 0]} name="hours" />
              <Bar dataKey="target" fill="rgba(255,255,255,0.035)" radius={[4, 4, 0, 0]} name="target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subject distribution pie */}
        <div className="bento-card card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 750, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>Subject Split</h3>
          <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginBottom: "16px" }}>Hours this week</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={SUBJECT_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="hours" paddingAngle={4}>
                {SUBJECT_DATA.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v}h`, ""]} contentStyle={{ background: "rgba(15,17,26,0.9)", border: "1px solid var(--c-border-2)", borderRadius: "8px", color: "var(--c-text-primary)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
            {SUBJECT_DATA.map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "var(--c-text-secondary)", flex: 1, fontWeight: 500 }}>{s.name}</span>
                <span style={{ fontSize: "12px", color: "var(--c-text-tertiary)", fontWeight: 700 }}>{s.hours}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }} className="animate-up-3 bento-grid">

        {/* Productivity trend */}
        <div className="bento-card card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 750, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>Productivity Trend</h3>
          <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginBottom: "20px" }}>8-week score history</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={PRODUCTIVITY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="week" tick={{ fill: "var(--c-text-tertiary)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill: "var(--c-text-tertiary)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" stroke="var(--c-accent-light)" strokeWidth={3} dot={{ fill: "var(--c-accent-light)", r: 4 }} name="score" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sleep consistency */}
        <div className="bento-card card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 750, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>Sleep Consistency</h3>
          <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginBottom: "20px" }}>Hours per night · Target: 7h</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={SLEEP_DATA}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--c-success)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--c-success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="day" tick={{ fill: "var(--c-text-tertiary)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[4, 10]} tick={{ fill: "var(--c-text-tertiary)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="hours" stroke="var(--c-success)" strokeWidth={2.5} fill="url(#sleepGrad)" name="hours" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goals */}
      <div className="card animate-up-4" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 750, color: "var(--c-text-primary)", fontFamily: "var(--font-display)", marginBottom: "4px" }}>Goal Progress</h3>
        <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginBottom: "20px" }}>Track your monthly targets</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {GOALS.map(({ label, progress, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.015)", border: "1px solid var(--c-border-1)", padding: "16px", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--c-text-secondary)" }}>{label}</span>
                <span style={{ fontSize: "13.5px", fontWeight: 700, color }}>{progress}%</span>
              </div>
              <div className="progress-track" style={{ height: "6px" }}>
                <div style={{
                  width: `${progress}%`, height: "100%",
                  background: color,
                  borderRadius: "999px", transition: "width 1s ease"
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .bento-grid {
            display: flex !important;
            flex-direction: column !important;
          }
          .bento-card {
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
