"use client";
import { useState } from "react";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];

const DEMO_TEACHERS = [
  { id: 1, name: "Mr. Arjun Sharma", subjects: ["Mathematics", "Statistics"], days: ["Monday","Tuesday","Wednesday","Thursday","Friday"], from: "08:00", until: "16:00" },
  { id: 2, name: "Ms. Priya Patel", subjects: ["Physics"], days: ["Monday","Wednesday","Friday"], from: "08:00", until: "14:00" },
  { id: 3, name: "Mr. Rajan Kumar", subjects: ["Chemistry"], days: ["Tuesday","Thursday"], from: "09:00", until: "15:00" },
  { id: 4, name: "Dr. Sunita Rao", subjects: ["Biology"], days: ["Monday","Tuesday","Wednesday"], from: "10:00", until: "16:00" },
  { id: 5, name: "Ms. Ananya Singh", subjects: ["English", "Literature"], days: ["Monday","Tuesday","Wednesday","Thursday","Friday"], from: "08:00", until: "13:00" },
];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState(DEMO_TEACHERS);
  const [showAdd, setShowAdd] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: "", subjects: "", days: [] as string[], from: "08:00", until: "16:00" });

  function addTeacher() {
    if (!newTeacher.name) return;
    setTeachers(prev => [...prev, { id: Date.now(), name: newTeacher.name, subjects: newTeacher.subjects.split(",").map(s => s.trim()), days: newTeacher.days, from: newTeacher.from, until: newTeacher.until }]);
    setShowAdd(false);
    setNewTeacher({ name: "", subjects: "", days: [], from: "08:00", until: "16:00" });
  }

  function removeTeacher(id: number) { setTeachers(prev => prev.filter(t => t.id !== id)); }

  function toggleDay(day: string) {
    setNewTeacher(prev => ({ ...prev, days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day] }));
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <p className="section-label">Administration</p>
          <h1 style={{ fontFamily: "var(--font-outfit)", fontSize: "24px", fontWeight: 700, marginTop: "4px" }}>Teacher Management</h1>
        </div>
        <button id="add-teacher-btn" onClick={() => setShowAdd(!showAdd)} className="btn-primary">
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      {showAdd && (
        <div className="glass-strong" style={{ padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Add New Teacher</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Full Name</label>
              <input className="input-field" placeholder="e.g. Mr. Raj Patel" value={newTeacher.name} onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Subjects (comma-separated)</label>
              <input className="input-field" placeholder="e.g. Physics, Maths" value={newTeacher.subjects} onChange={e => setNewTeacher({ ...newTeacher, subjects: e.target.value })} />
            </div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>Available Days</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {DAYS.map(d => (
                <button key={d} onClick={() => toggleDay(d)} style={{
                  padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", border: "none",
                  background: newTeacher.days.includes(d) ? "rgba(249,115,22,0.22)" : "rgba(255,255,255,0.05)",
                  color: newTeacher.days.includes(d) ? "#fed7aa" : "var(--text-muted)"
                }}>{d.slice(0,3)}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Available From</label>
              <input type="time" className="input-field" value={newTeacher.from} onChange={e => setNewTeacher({ ...newTeacher, from: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Until</label>
              <input type="time" className="input-field" value={newTeacher.until} onChange={e => setNewTeacher({ ...newTeacher, until: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button onClick={addTeacher} className="btn-primary">Add Teacher</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {teachers.map(t => (
          <div key={t.id} className="glass-card" style={{ padding: "18px 20px", display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #f9731633, #3b82f633)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#fdba74" }}>{t.name.split(" ").slice(-1)[0][0]}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: "15px" }}>{t.name}</p>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "3px" }}>{t.subjects.join(" · ")}</p>
              <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                {t.days.map(d => <span key={d} className="badge badge-brand" style={{ fontSize: "11px", padding: "2px 8px" }}>{d.slice(0,3)}</span>)}
                <span style={{ fontSize: "12px", color: "var(--text-muted)", alignSelf: "center" }}>{t.from} – {t.until}</span>
              </div>
            </div>
            <button onClick={() => removeTeacher(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,0.6)", padding: "8px", borderRadius: "8px", transition: "all 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
