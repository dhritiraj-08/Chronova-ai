"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, X, Download } from "lucide-react";
import { useScheduleStore, ScheduleEvent } from "@/lib/store/scheduleStore";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am – 10pm
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_HEIGHT = 64;
const START_HOUR = 6;

const SUBJECT_COLORS = [
  { bg: "rgba(139, 92, 246, 0.08)",    border: "rgba(139, 92, 246, 0.22)",       dot: "var(--c-accent)",     text: "var(--c-accent-light)" },
  { bg: "rgba(16, 185, 129, 0.08)",    border: "rgba(16, 185, 129, 0.22)",       dot: "#10b981",             text: "#a7f3d0" },
  { bg: "rgba(6, 182, 212, 0.08)",     border: "rgba(6, 182, 212, 0.22)",       dot: "var(--c-secondary)",  text: "var(--c-secondary-light)" },
  { bg: "rgba(56, 189, 248, 0.08)",    border: "rgba(56, 189, 248, 0.22)",      dot: "#38bdf8",             text: "#7dd3fc" },
  { bg: "rgba(244, 63, 94, 0.08)",     border: "rgba(244, 63, 94, 0.22)",       dot: "var(--c-orange)",     text: "#fda4af" },
  { bg: "rgba(99, 102, 241, 0.08)",    border: "rgba(99, 102, 241, 0.22)",      dot: "#6366f1",             text: "#a5b4fc" },
];

function fmtHour(h: number) {
  const hr = Math.floor(h);
  const min = String(Math.round((h % 1) * 60)).padStart(2, "0");
  return `${hr}:${min}`;
}

interface PositionedEvent {
  event: ScheduleEvent;
  left: string;
  width: string;
  laneCount: number;
}

function getPositionedEvents(events: ScheduleEvent[]): PositionedEvent[] {
  // Sort events by start time, then end time
  const sorted = [...events].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return a.end - b.end;
  });

  // Group into clusters of overlapping events
  const clusters: ScheduleEvent[][] = [];
  let currentCluster: ScheduleEvent[] = [];
  let clusterEnd = 0;

  for (const ev of sorted) {
    if (ev.start >= clusterEnd) {
      if (currentCluster.length > 0) {
        clusters.push(currentCluster);
      }
      currentCluster = [ev];
      clusterEnd = ev.end;
    } else {
      currentCluster.push(ev);
      clusterEnd = Math.max(clusterEnd, ev.end);
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  const positioned: PositionedEvent[] = [];

  for (const cluster of clusters) {
    // Determine lanes for this cluster
    const lanes: number[] = [];
    const eventLanes = new Map<string | number, number>();

    for (const ev of cluster) {
      let placed = false;
      for (let i = 0; i < lanes.length; i++) {
        if (ev.start >= lanes[i] - 0.01) {
          lanes[i] = ev.end;
          eventLanes.set(ev.id, i);
          placed = true;
          break;
        }
      }
      if (!placed) {
        lanes.push(ev.end);
        eventLanes.set(ev.id, lanes.length - 1);
      }
    }

    const totalLanes = lanes.length;

    for (const ev of cluster) {
      const laneIdx = eventLanes.get(ev.id) ?? 0;
      const colWidth = 100 / totalLanes;
      const leftPercent = laneIdx * colWidth;

      // Clean formula for side-by-side positioning with exact 6px gutters and outer margins
      const left = `calc(${leftPercent}% + ${6 - (6 * laneIdx / totalLanes)}px)`;
      const width = `calc(${colWidth}% - ${6 * (totalLanes + 1) / totalLanes}px)`;

      positioned.push({
        event: ev,
        left,
        width,
        laneCount: totalLanes,
      });
    }
  }

  return positioned;
}

export default function CalendarPage() {
  const { events, addEvent, removeEvent, toggleEventDone } = useScheduleStore();
  const [view, setView] = useState<"week" | "day">("week");

  const exportStudentTimetableToPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Failed to open print window. Please allow popups for this site.");
      return;
    }

    const PRINT_COLORS = [
      { border: "#8b5cf6", bg: "#f5f3ff", text: "#6d28d9" },
      { border: "#10b981", bg: "#ecfdf5", text: "#047857" },
      { border: "#06b6d4", bg: "#ecfeff", text: "#0e7490" },
      { border: "#38bdf8", bg: "#f0f9ff", text: "#0369a1" },
      { border: "#f43f5e", bg: "#fff1f2", text: "#be123c" },
      { border: "#6366f1", bg: "#eef2ff", text: "#4338ca" },
    ];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Study Timetable</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap');
            @page {
              size: A4 landscape;
              margin: 15mm;
            }
            body {
              font-family: 'Inter', sans-serif;
              color: #111827;
              background-color: #ffffff;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header {
              margin-bottom: 20px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .title-section h1 {
              font-family: 'Outfit', sans-serif;
              font-size: 24px;
              font-weight: 800;
              margin: 0 0 4px 0;
              color: #0f172a;
              letter-spacing: -0.02em;
            }
            .title-section p {
              font-size: 13px;
              color: #4b5563;
              margin: 0;
              font-weight: 500;
            }
            .meta-section {
              text-align: right;
              font-size: 12px;
              color: #6b7280;
            }
            .meta-section p {
              margin: 2px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background-color: #f3f4f6;
              border: 1px solid #e5e7eb;
              padding: 10px 6px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              color: #374151;
              letter-spacing: 0.05em;
            }
            td {
              border: 1px solid #e5e7eb;
              padding: 6px;
              vertical-align: top;
              height: 52px;
              width: 13%;
            }
            td.time-col {
              background-color: #f9fafb;
              font-weight: 600;
              font-size: 11px;
              color: #4b5563;
              width: 9%;
              text-align: center;
              padding-top: 10px;
            }
            .event-card {
              border-radius: 6px;
              padding: 6px 8px;
              margin-bottom: 4px;
              box-sizing: border-box;
              text-align: left;
            }
            .event-title {
              font-size: 11px;
              font-weight: 700;
              margin: 0 0 2px 0;
            }
            .event-time {
              font-size: 9px;
              font-weight: 500;
            }
            .event-done {
              text-decoration: line-through;
              opacity: 0.6;
            }
            .empty-cell {
              font-size: 11px;
              color: #e5e7eb;
              text-align: center;
              padding-top: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title-section">
              <h1>My Study Timetable</h1>
              <p>Chronova AI Personal Coach</p>
            </div>
            <div class="meta-section">
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
              <p>Weekly Target Schedule</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                ${DAYS.map(day => `<th>${day}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${HOURS.map(h => `
                <tr>
                  <td class="time-col">${h > 12 ? `${h - 12} PM` : h === 12 ? "12 PM" : `${h} AM`}</td>
                  ${[0, 1, 2, 3, 4, 5, 6].map(dayIdx => {
                    const hourEvents = events.filter(e => e.day === dayIdx && Math.floor(e.start) === h);
                    if (hourEvents.length > 0) {
                      return `
                        <td>
                          ${hourEvents.map(ev => {
                            const c = PRINT_COLORS[ev.colorIdx % PRINT_COLORS.length];
                            return `
                              <div class="event-card ${ev.done ? "event-done" : ""}" style="background-color: ${c.bg}; border-left: 3px solid ${c.border}; color: ${c.text}; border-top: 1px solid ${c.border}20; border-right: 1px solid ${c.border}20; border-bottom: 1px solid ${c.border}20;">
                                <p class="event-title">${ev.title}</p>
                                <p class="event-time">${fmtHour(ev.start)} – ${fmtHour(ev.end)}</p>
                              </div>
                            `;
                          }).join("")}
                        </td>
                      `;
                    } else {
                      return `
                        <td>
                          <div class="empty-cell">—</div>
                        </td>
                      `;
                    }
                  }).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };
  const [selectedDay, setSelectedDay] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", day: 0, start: "09:00", end: "10:00", colorIdx: 0 });

  const now = new Date();

  function getColumnDate(dayIdx: number, offset: number) {
    const d = new Date();
    const currentDay = d.getDay(); // 0 is Sunday, 1-6 are Mon-Sat
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    d.setDate(d.getDate() + daysToMonday); // Monday of current week
    d.setDate(d.getDate() + dayIdx + offset * 7); // target day with week offset
    return d;
  }

  function getHeaderDateLabel() {
    const monday = getColumnDate(0, weekOffset);
    const sunday = getColumnDate(6, weekOffset);
    
    const formatMonthYear = (d: Date) => {
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };
    
    const formatMonthOnly = (d: Date) => {
      return d.toLocaleDateString("en-US", { month: "long" });
    };

    if (view === "day") {
      const selectedDate = getColumnDate(selectedDay, weekOffset);
      return selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }

    if (monday.getFullYear() !== sunday.getFullYear()) {
      return `${formatMonthYear(monday)} – ${formatMonthYear(sunday)}`;
    }
    if (monday.getMonth() !== sunday.getMonth()) {
      return `${formatMonthOnly(monday)} – ${formatMonthYear(sunday)}`;
    }
    return formatMonthYear(monday);
  }
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;

  const displayDays = view === "week" ? DAYS : [DAYS[selectedDay]];

  function handleAddEvent() {
    if (!newEvent.title.trim()) return;
    const sh = parseInt(newEvent.start.split(":")[0]) + parseInt(newEvent.start.split(":")[1]) / 60;
    const eh = parseInt(newEvent.end.split(":")[0])   + parseInt(newEvent.end.split(":")[1])   / 60;
    addEvent({
      title: newEvent.title,
      day: newEvent.day,
      start: sh,
      end: eh,
      done: false,
      colorIdx: newEvent.colorIdx
    });
    setShowAdd(false);
  }

  return (
    <div style={{ maxWidth: "1300px", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }} className="animate-fade">

      {/* Header Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--c-text-primary)", fontFamily: "var(--font-display)" }}>
            {getHeaderDateLabel()}
          </h2>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* View toggle */}
          <div style={{ display: "flex", background: "rgba(15,17,26,0.6)", borderRadius: "10px", padding: "4px", border: "1px solid var(--c-border-1)" }}>
            {(["week", "day"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "6px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                fontSize: "13px", fontWeight: 600, transition: "all var(--t-fast)",
                background: view === v ? "var(--c-surface-3)" : "transparent",
                color: view === v ? "var(--c-text-primary)" : "var(--c-text-tertiary)"
              }}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
            ))}
          </div>

          {/* Week navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button onClick={() => setWeekOffset(p => p - 1)} className="btn btn-icon"><ChevronLeft size={16} /></button>
            <button onClick={() => setWeekOffset(0)} className="btn btn-ghost" style={{ fontSize: "13px", fontWeight: 600 }}>Today</button>
            <button onClick={() => setWeekOffset(p => p + 1)} className="btn btn-icon"><ChevronRight size={16} /></button>
          </div>

          <button id="download-student-timetable-btn" onClick={exportStudentTimetableToPDF} className="btn btn-secondary" style={{ fontSize: "13px", padding: "10px 18px" }}>
            <Download size={14} style={{ marginRight: "4px" }} /> Export PDF
          </button>

          <button id="add-session-btn" onClick={() => setShowAdd(true)} className="btn btn-primary" style={{ fontSize: "13px", padding: "10px 18px" }}>
            <Plus size={15} style={{ marginRight: "4px" }} /> Add session
          </button>
        </div>
      </div>

      {/* Day tabs (day view only) */}
      {view === "day" && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
          {DAYS.map((d, i) => (
            <button key={d} onClick={() => setSelectedDay(i)} style={{
              padding: "8px 16px", borderRadius: "10px", cursor: "pointer", fontSize: "13px",
              background: selectedDay === i ? "rgba(139, 92, 246, 0.08)" : "rgba(15, 17, 26, 0.65)",
              border: selectedDay === i ? "1px solid rgba(139, 92, 246, 0.25)" : "1px solid var(--c-border-1)",
              color: selectedDay === i ? "var(--c-accent-light)" : "var(--c-text-secondary)", 
              fontWeight: selectedDay === i ? 700 : 500,
              boxShadow: selectedDay === i ? "0 4px 12px rgba(139, 92, 246, 0.05)" : "none",
              transition: "all var(--t-base)"
            }}>{d}</button>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      <div style={{ flex: 1, background: "rgba(15,17,26,0.65)", border: "1px solid var(--c-border-1)", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", backdropFilter: "blur(16px)" }}>
        
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: `60px repeat(${displayDays.length}, 1fr)`, borderBottom: "1px solid var(--c-border-1)", flexShrink: 0, background: "rgba(8, 9, 15, 0.3)" }}>
          <div style={{ padding: "12px" }} />
          {displayDays.map((day, i) => {
            const di = view === "week" ? i : selectedDay;
            const isToday = di === todayIdx && weekOffset === 0;
            
            const colDate = getColumnDate(di, weekOffset);
            const colDateForDiff = new Date(colDate);
            colDateForDiff.setHours(0, 0, 0, 0);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            const diffDays = Math.round((colDateForDiff.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
            
            let relativeLabel = "";
            if (diffDays === 0) relativeLabel = "Today";
            else if (diffDays === 1) relativeLabel = "Tomorrow";
            else if (diffDays === -1) relativeLabel = "Yesterday";

            return (
              <div key={day} style={{ padding: "12px 8px", textAlign: "center", borderLeft: "1px solid var(--c-border-1)" }}>
                <p style={{ fontSize: "11px", color: relativeLabel ? "var(--c-accent-light)" : "var(--c-text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                  {relativeLabel ? `${day} (${relativeLabel})` : day}
                </p>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%", margin: "0 auto",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isToday ? "var(--c-accent)" : "transparent",
                  boxShadow: isToday ? "0 0 14px var(--c-accent-glow)" : "none",
                  border: isToday ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent"
                }}>
                  <p style={{ fontSize: "14.5px", fontWeight: 700, color: isToday ? "#fff" : "var(--c-text-secondary)" }}>
                    {colDate.getDate()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable time grid */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: `60px repeat(${displayDays.length}, 1fr)`, minHeight: `${HOUR_HEIGHT * HOURS.length}px` }}>
            {/* Hour labels */}
            <div>
              {HOURS.map(h => (
                <div key={h} style={{ height: `${HOUR_HEIGHT}px`, display: "flex", alignItems: "flex-start", paddingTop: "6px", paddingRight: "12px", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "11px", color: "var(--c-text-tertiary)", fontWeight: 600 }}>
                    {h > 12 ? `${h - 12}pm` : h === 12 ? "12pm" : `${h}am`}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {displayDays.map((day, colI) => {
              const di = view === "week" ? colI : selectedDay;
              const isToday = di === todayIdx && weekOffset === 0;
              const colEvents = events.filter(e => e.day === di);
              return (
                <div key={day} style={{ position: "relative", borderLeft: "1px solid var(--c-border-1)" }}>
                  {/* Hour cells */}
                  {HOURS.map(h => (
                    <div key={h} style={{ height: `${HOUR_HEIGHT}px`, borderBottom: "1px solid rgba(255,255,255,0.025)" }} />
                  ))}

                  {/* Current time line laser */}
                  {isToday && currentHour >= START_HOUR && (
                    <div style={{
                      position: "absolute", left: 0, right: 0, top: `${(currentHour - START_HOUR) * HOUR_HEIGHT}px`,
                      height: "2px", background: "var(--c-secondary)", zIndex: 10, pointerEvents: "none",
                      boxShadow: "0 0 10px var(--c-secondary), 0 0 4px var(--c-secondary)"
                    }}>
                      <div style={{ 
                        width: "8px", height: "8px", borderRadius: "50%", 
                        background: "var(--c-secondary)", marginTop: "-3px", marginLeft: "-4px",
                        boxShadow: "0 0 12px var(--c-secondary)"
                      }} />
                    </div>
                  )}

                  {/* Events */}
                  {getPositionedEvents(colEvents).map(({ event: ev, left, width, laneCount }) => {
                    const c = SUBJECT_COLORS[ev.colorIdx % SUBJECT_COLORS.length];
                    const top    = (ev.start - START_HOUR) * HOUR_HEIGHT + 2;
                    const height = Math.max((ev.end - ev.start) * HOUR_HEIGHT - 4, 22);
                    return (
                      <div key={ev.id} className={`event-card-container ${laneCount === 1 ? "single-lane" : ""}`} style={{
                        position: "absolute", left, width, top: `${top}px`, height: `${height}px`,
                        background: c.bg, border: `1px solid ${c.border}`,
                        borderLeft: `3px solid ${c.dot}`,
                        borderRadius: "10px", padding: "6px 12px",
                        cursor: "pointer", overflow: "hidden",
                        opacity: ev.done ? 0.45 : 1, zIndex: 5,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                        transition: "all var(--t-base)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${c.border}`;
                        (e.currentTarget as HTMLElement).style.transform = "scale(1.01)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
                        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                      }}
                      >
                        {/* Action buttons (Tick / Delete) placed in the top right corner */}
                        <div className="event-card-actions" style={{ position: "absolute", top: "6px", right: "8px", display: "flex", gap: "4px", zIndex: 10 }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleEventDone(ev.id); }}
                            title={ev.done ? "Mark incomplete" : "Mark done"}
                            style={{ 
                              background: ev.done ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.06)", 
                              border: "1px solid rgba(16, 185, 129, 0.3)", 
                              borderRadius: "6px", 
                              cursor: "pointer", 
                              color: "#10b981", 
                              padding: "4px", 
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all var(--t-fast)",
                              boxShadow: ev.done ? "0 0 8px rgba(16, 185, 129, 0.2)" : "none"
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = "rgba(16, 185, 129, 0.3)";
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = ev.done ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.06)";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <Check size={13} style={{ strokeWidth: 3 }} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeEvent(ev.id); }}
                            title="Delete session"
                            style={{ 
                              background: "rgba(239, 68, 68, 0.06)", 
                              border: "1px solid rgba(239, 68, 68, 0.2)", 
                              borderRadius: "6px", 
                              cursor: "pointer", 
                              color: "#ef4444", 
                              padding: "4px", 
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all var(--t-fast)"
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = "rgba(239, 68, 68, 0.06)";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Title - right padding handled by class to prevent overlap with top-right buttons dynamically */}
                        <p className="event-card-title" style={{ fontSize: "12px", fontWeight: 700, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ev.done ? "✓ " : ""}{ev.title}
                        </p>
                        {height > 38 && (
                          <p style={{ fontSize: "11px", color: "var(--c-text-tertiary)", marginTop: "2px", fontWeight: 500 }}>
                            {fmtHour(ev.start)} – {fmtHour(ev.end)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add session modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(3,3,7,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(8px)" }}>
          <div className="card-paper animate-up" style={{ padding: "32px", width: "400px", border: "1px solid var(--c-border-paper)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--c-text-paper)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>Add study session</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex" }}><X size={20} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="form-label">Session title</label>
                <input className="input" placeholder="e.g. Mathematics — Integration"
                  value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} />
              </div>

              <div>
                <label className="form-label">Day</label>
                <select className="input" value={newEvent.day} onChange={e => setNewEvent(p => ({ ...p, day: +e.target.value }))} style={{ background: "#ffffff", color: "var(--c-text-paper)" }}>
                  {DAYS.map((d, i) => <option key={d} value={i} style={{ background: "#ffffff", color: "var(--c-text-paper)" }}>{d}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Start</label>
                  <input type="time" className="input" value={newEvent.start} onChange={e => setNewEvent(p => ({ ...p, start: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">End</label>
                  <input type="time" className="input" value={newEvent.end} onChange={e => setNewEvent(p => ({ ...p, end: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="form-label">Color Theme</label>
                <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                  {SUBJECT_COLORS.map((c, i) => (
                    <button 
                      key={i} 
                      onClick={() => setNewEvent(p => ({ ...p, colorIdx: i }))} 
                      style={{
                        width: "28px", height: "28px", borderRadius: "50%", background: c.dot,
                        border: newEvent.colorIdx === i ? "2px solid #111115" : "2px solid transparent",
                        boxShadow: newEvent.colorIdx === i ? `0 0 10px ${c.dot}` : "none",
                        cursor: "pointer", transition: "all var(--t-fast)"
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button onClick={() => setShowAdd(false)} className="btn btn-secondary" style={{ flex: 1, padding: "12px" }}>Cancel</button>
              <button onClick={handleAddEvent} className="btn btn-primary" style={{ flex: 1, padding: "12px" }} disabled={!newEvent.title.trim()}>Add Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
