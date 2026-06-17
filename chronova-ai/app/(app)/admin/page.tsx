"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Users, BookOpen, DoorOpen, ChevronRight, Plus, Sparkles, CheckCircle, AlertTriangle } from "lucide-react";

const DEMO_STATS = [
  { label: "Teachers", value: 8, icon: Users, color: "#f97316", href: "/admin/teachers" },
  { label: "Classes", value: 6, icon: Users, color: "#3b82f6", href: "/admin/classes" },
  { label: "Subjects", value: 14, icon: BookOpen, color: "#10b981", href: "/admin/timetable" },
  { label: "Classrooms", value: 10, icon: DoorOpen, color: "#f59e0b", href: "/admin/classes" },
];

const DEMO_TIMETABLE_PREVIEW = {
  Monday: [
    { time: "08:00–09:00", subject: "Mathematics", teacher: "Mr. Sharma", room: "Room 101" },
    { time: "09:00–10:00", subject: "Physics", teacher: "Ms. Patel", room: "Lab 1" },
    { time: "10:15–11:15", subject: "Chemistry", teacher: "Mr. Kumar", room: "Lab 2" },
    { time: "11:15–12:15", subject: "English", teacher: "Ms. Singh", room: "Room 102" },
    { time: "13:00–14:00", subject: "Biology", teacher: "Dr. Rao", room: "Room 103" },
    { time: "14:00–15:00", subject: "Computer Science", teacher: "Mr. Das", room: "Computer Lab" },
  ],
};

export default function AdminPage() {
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2500));
    setGenerating(false);
    setGenerated(true);
    setShowGenerateForm(false);
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <p className="section-label">Administration</p>
        <h1 style={{ fontFamily: "var(--font-outfit)", fontSize: "28px", fontWeight: 700, marginTop: "4px" }}>
          Institution Panel
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
          Manage your school or college timetables, teachers, and classrooms
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {DEMO_STATS.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} style={{ textDecoration: "none" }}>
            <div className="glass-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>{label}</p>
                  <p style={{ fontSize: "32px", fontWeight: 800, color, fontFamily: "var(--font-outfit)" }}>{value}</p>
                </div>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} color={color} />
                </div>
              </div>
              <p style={{ fontSize: "12px", color: `${color}99`, marginTop: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                Manage <ChevronRight size={12} />
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* AI Generate section */}
      <div className="glass-strong" style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: generated ? "20px" : "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "linear-gradient(135deg, #f97316, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Sparkles size={22} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700 }}>AI Timetable Generator</h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Generate an optimized conflict-free timetable using AI
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {generated && (
              <span className="badge badge-success"><CheckCircle size={12} /> Generated</span>
            )}
            <button
              id="generate-timetable-btn"
              onClick={() => setShowGenerateForm(!showGenerateForm)}
              className="btn-primary"
              style={{ padding: "10px 18px", fontSize: "14px" }}
            >
              <Plus size={16} /> Generate Timetable
            </button>
          </div>
        </div>

        {/* Generate form */}
        {showGenerateForm && (
          <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              {[
                { label: "Institution Name", placeholder: "e.g. Delhi Public School" },
                { label: "Batch/Class", placeholder: "e.g. Class 11 - Science" },
                { label: "Age Group", placeholder: "e.g. 16-17 years" },
              ].map(({ label, placeholder }) => (
                <div key={label}>
                  <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>{label}</label>
                  <input className="input-field" placeholder={placeholder} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>School Hours</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="time" className="input-field" defaultValue="08:00" />
                  <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>to</span>
                  <input type="time" className="input-field" defaultValue="15:00" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Lunch Break</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="time" className="input-field" defaultValue="12:00" />
                  <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>to</span>
                  <input type="time" className="input-field" defaultValue="13:00" />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowGenerateForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleGenerate} disabled={generating} className="btn-primary">
                {generating ? (
                  <>
                    <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
                    Generating with AI...
                  </>
                ) : (
                  <><Sparkles size={16} /> Generate Now</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timetable Preview */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700 }}>Monday Timetable Preview</h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>Class 11 — Science</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span className="badge badge-success"><CheckCircle size={12} /> No Conflicts</span>
          </div>
        </div>

        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
            <thead>
              <tr>
                {["Time Slot", "Subject", "Teacher", "Classroom"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 16px", textAlign: "left",
                    fontSize: "12px", color: "var(--text-muted)",
                    fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEMO_TIMETABLE_PREVIEW.Monday.map((row, i) => (
                <tr key={i}>
                  {[row.time, row.subject, row.teacher, row.room].map((cell, j) => (
                    <td key={j} style={{
                      padding: "12px 16px",
                      background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent",
                      borderRadius: j === 0 ? "10px 0 0 10px" : j === 3 ? "0 10px 10px 0" : "0",
                      fontSize: "14px",
                      color: j === 1 ? "var(--text-primary)" : "var(--text-secondary)",
                      fontWeight: j === 1 ? 600 : 400,
                    }}>
                      {j === 1 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{
                            width: "8px", height: "8px", borderRadius: "2px",
                            background: ["#f97316", "#10b981", "#ec4899", "#f97316", "#06b6d4", "#3b82f6"][i % 6]
                          }} />
                          {cell}
                        </div>
                      )}
                      {j !== 1 && cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <Link href="/admin/teachers">
            <button className="btn-secondary" style={{ fontSize: "13px" }}>
              <Users size={14} /> Manage Teachers
            </button>
          </Link>
          <Link href="/admin/classes">
            <button className="btn-secondary" style={{ fontSize: "13px" }}>
              <Building2 size={14} /> Manage Classes
            </button>
          </Link>
          <Link href="/admin/timetable">
            <button className="btn-primary" style={{ fontSize: "13px" }}>
              View Full Timetable <ChevronRight size={14} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
