"use client";
import { useState } from "react";
import { Plus, Trash2, Users, DoorOpen } from "lucide-react";

const DEMO_BATCHES = [
  { id: 1, name: "Class 11 - Science A", students: 42, ageGroup: "16-17", subjects: ["Math", "Physics", "Chemistry", "Biology", "English"] },
  { id: 2, name: "Class 11 - Science B", students: 40, ageGroup: "16-17", subjects: ["Math", "Physics", "Chemistry", "Computer Sci", "English"] },
  { id: 3, name: "Class 12 - Science", students: 38, ageGroup: "17-18", subjects: ["Math", "Physics", "Chemistry", "Biology", "English"] },
  { id: 4, name: "Class 10 - General", students: 45, ageGroup: "15-16", subjects: ["Math", "Science", "Social Studies", "English", "Hindi"] },
];

const DEMO_CLASSROOMS = [
  { id: 1, name: "Room 101", capacity: 45, type: "classroom" },
  { id: 2, name: "Room 102", capacity: 45, type: "classroom" },
  { id: 3, name: "Lab 1 (Physics)", capacity: 30, type: "lab" },
  { id: 4, name: "Lab 2 (Chemistry)", capacity: 30, type: "lab" },
  { id: 5, name: "Computer Lab", capacity: 35, type: "lab" },
  { id: 6, name: "Auditorium", capacity: 200, type: "auditorium" },
];

const TYPE_COLORS: Record<string, string> = { classroom: "#3b82f6", lab: "#10b981", auditorium: "#f59e0b" };

export default function ClassesPage() {
  const [batches, setBatches] = useState(DEMO_BATCHES);
  const [classrooms, setClassrooms] = useState(DEMO_CLASSROOMS);
  const [tab, setTab] = useState<"batches" | "classrooms">("batches");

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <p className="eyebrow">Administration</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, marginTop: "4px", color: "var(--c-text-primary)" }}>Classes & Classrooms</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "var(--c-surface-2)", borderRadius: "12px", padding: "4px", marginBottom: "24px", gap: "4px", width: "fit-content" }}>
        {(["batches", "classrooms"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer",
            fontSize: "14px", fontWeight: 600, transition: "all 0.2s",
            background: tab === t ? "var(--c-surface-1)" : "transparent",
            color: tab === t ? "var(--c-accent)" : "var(--c-text-tertiary)",
            boxShadow: tab === t ? "var(--sh-sm)" : "none"
          }}>
            {t === "batches" ? <><Users size={14} style={{ display: "inline", marginRight: "6px" }} />Batches/Classes</> : <><DoorOpen size={14} style={{ display: "inline", marginRight: "6px" }} />Classrooms</>}
          </button>
        ))}
      </div>

      {tab === "batches" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {batches.map((b) => (
            <div key={b.id} className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "16px", color: "var(--c-text-primary)" }}>{b.name}</p>
                  <p style={{ fontSize: "13px", color: "var(--c-text-secondary)", marginTop: "4px" }}>
                    {b.students} students · Age {b.ageGroup}
                  </p>
                  <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                    {b.subjects.map((s) => (
                      <span key={s} className="badge badge-orange">{s}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setBatches(prev => prev.filter(x => x.id !== b.id))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-danger)", padding: "6px", borderRadius: "8px" }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "classrooms" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
          {classrooms.map((c) => (
            <div key={c.id} className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "16px", color: "var(--c-text-primary)" }}>{c.name}</p>
                  <p style={{ fontSize: "13px", color: "var(--c-text-secondary)", marginTop: "4px" }}>Capacity: {c.capacity} students</p>
                  <span style={{
                    display: "inline-block", marginTop: "10px",
                    padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600,
                    background: `${TYPE_COLORS[c.type]}18`,
                    border: `1px solid ${TYPE_COLORS[c.type]}40`,
                    color: TYPE_COLORS[c.type]
                  }}>
                    {c.type.charAt(0).toUpperCase() + c.type.slice(1)}
                  </span>
                </div>
                <button onClick={() => setClassrooms(prev => prev.filter(x => x.id !== c.id))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-danger)", padding: "6px", borderRadius: "8px" }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
