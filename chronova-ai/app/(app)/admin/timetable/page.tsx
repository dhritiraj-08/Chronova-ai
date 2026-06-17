"use client";

import { useState } from "react";
import { CheckCircle, Download } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = ["08:00–09:00", "09:00–10:00", "10:15–11:15", "11:15–12:15", "13:00–14:00", "14:00–15:00"];

const DEMO_TIMETABLE: Record<string, { subject: string; teacher: string; room: string; color: string }[]> = {
  Monday: [
    { subject: "Mathematics", teacher: "Mr. Sharma", room: "Room 101", color: "#f97316" },
    { subject: "Physics", teacher: "Ms. Patel", room: "Lab 1", color: "#10b981" },
    { subject: "Chemistry", teacher: "Mr. Kumar", room: "Lab 2", color: "#ec4899" },
    { subject: "English", teacher: "Ms. Singh", room: "Room 102", color: "#f97316" },
    { subject: "Biology", teacher: "Dr. Rao", room: "Room 103", color: "#06b6d4" },
    { subject: "Computer Sci", teacher: "Mr. Das", room: "Comp Lab", color: "#3b82f6" },
  ],
  Tuesday: [
    { subject: "Physics", teacher: "Ms. Patel", room: "Lab 1", color: "#10b981" },
    { subject: "Mathematics", teacher: "Mr. Sharma", room: "Room 101", color: "#f97316" },
    { subject: "English", teacher: "Ms. Singh", room: "Room 102", color: "#f97316" },
    { subject: "Chemistry", teacher: "Mr. Kumar", room: "Lab 2", color: "#ec4899" },
    { subject: "Computer Sci", teacher: "Mr. Das", room: "Comp Lab", color: "#3b82f6" },
    { subject: "Biology", teacher: "Dr. Rao", room: "Room 103", color: "#06b6d4" },
  ],
  Wednesday: [
    { subject: "Chemistry", teacher: "Mr. Kumar", room: "Lab 2", color: "#ec4899" },
    { subject: "Biology", teacher: "Dr. Rao", room: "Room 103", color: "#06b6d4" },
    { subject: "Mathematics", teacher: "Mr. Sharma", room: "Room 101", color: "#f97316" },
    { subject: "Physics", teacher: "Ms. Patel", room: "Lab 1", color: "#10b981" },
    { subject: "English", teacher: "Ms. Singh", room: "Room 102", color: "#f97316" },
    { subject: "Computer Sci", teacher: "Mr. Das", room: "Comp Lab", color: "#3b82f6" },
  ],
  Thursday: [
    { subject: "English", teacher: "Ms. Singh", room: "Room 102", color: "#f97316" },
    { subject: "Chemistry", teacher: "Mr. Kumar", room: "Lab 2", color: "#ec4899" },
    { subject: "Biology", teacher: "Dr. Rao", room: "Room 103", color: "#06b6d4" },
    { subject: "Computer Sci", teacher: "Mr. Das", room: "Comp Lab", color: "#3b82f6" },
    { subject: "Mathematics", teacher: "Mr. Sharma", room: "Room 101", color: "#f97316" },
    { subject: "Physics", teacher: "Ms. Patel", room: "Lab 1", color: "#10b981" },
  ],
  Friday: [
    { subject: "Biology", teacher: "Dr. Rao", room: "Room 103", color: "#06b6d4" },
    { subject: "English", teacher: "Ms. Singh", room: "Room 102", color: "#f97316" },
    { subject: "Physics", teacher: "Ms. Patel", room: "Lab 1", color: "#10b981" },
    { subject: "Mathematics", teacher: "Mr. Sharma", room: "Room 101", color: "#f97316" },
    { subject: "Chemistry", teacher: "Mr. Kumar", room: "Lab 2", color: "#ec4899" },
    { subject: "Computer Sci", teacher: "Mr. Das", room: "Comp Lab", color: "#3b82f6" },
  ],
};

export default function TimetablePage() {
  const [selectedBatch, setSelectedBatch] = useState("Class 11 - Science A");

  const exportInstitutionTimetableToPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Failed to open print window. Please allow popups for this site.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedBatch} - Timetable</title>
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
              margin-bottom: 24px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .title-section h1 {
              font-family: 'Outfit', sans-serif;
              font-size: 24px;
              font-weight: 800;
              margin: 0 0 6px 0;
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
              margin-bottom: 24px;
            }
            th {
              background-color: #f3f4f6;
              border: 1px solid #e5e7eb;
              padding: 12px 8px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              color: #374151;
              letter-spacing: 0.05em;
            }
            td {
              border: 1px solid #e5e7eb;
              padding: 8px;
              vertical-align: middle;
              height: 70px;
              width: 17%;
            }
            td.time-col {
              background-color: #f9fafb;
              font-weight: 600;
              font-size: 11px;
              color: #4b5563;
              width: 12%;
              text-align: center;
              padding: 8px;
            }
            .cell-content {
              border-radius: 6px;
              padding: 8px;
              height: 100%;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
            }
            .subject {
              font-size: 12px;
              font-weight: 700;
              margin: 0 0 3px 0;
              color: #1f2937;
            }
            .teacher {
              font-size: 10px;
              color: #4b5563;
              margin: 0 0 2px 0;
              font-weight: 500;
            }
            .room {
              font-size: 9px;
              color: #6b7280;
              margin: 0;
              font-weight: 600;
              text-transform: uppercase;
            }
            .empty-cell {
              font-size: 12px;
              color: #d1d5db;
              text-align: center;
            }
            .legend {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
              border-top: 1px solid #e5e7eb;
              padding-top: 16px;
            }
            .legend-title {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              color: #4b5563;
              letter-spacing: 0.05em;
              width: 100%;
              margin-bottom: 8px;
            }
            .legend-item {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 11px;
              font-weight: 500;
              color: #374151;
            }
            .legend-color {
              width: 10px;
              height: 10px;
              border-radius: 3px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title-section">
              <h1>Weekly Timetable</h1>
              <p>${selectedBatch} &middot; Chronova AI Optimizer</p>
            </div>
            <div class="meta-section">
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
              <p>Status: Conflict-Free &middot; Confirmed</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Time Slot</th>
                ${DAYS.map(day => `<th>${day}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${TIME_SLOTS.map((slot, si) => `
                <tr>
                  <td class="time-col">${slot}</td>
                  ${DAYS.map(day => {
                    const entry = DEMO_TIMETABLE[day]?.[si];
                    if (entry) {
                      return `
                        <td>
                          <div class="cell-content" style="background-color: ${entry.color}15; border-left: 3px solid ${entry.color};">
                            <p class="subject">${entry.subject}</p>
                            <p class="teacher">${entry.teacher}</p>
                            <p class="room">${entry.room}</p>
                          </div>
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
          
          <div class="legend">
            <div class="legend-title">Subject Legend</div>
            ${Object.values(DEMO_TIMETABLE.Monday || {}).map(e => `
              <div class="legend-item">
                <div class="legend-color" style="background-color: ${e.color};"></div>
                <span>${e.subject}</span>
              </div>
            `).join("")}
          </div>
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

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <p className="section-label">Administration</p>
          <h1 style={{ fontFamily: "var(--font-outfit)", fontSize: "24px", fontWeight: 700, marginTop: "4px" }}>Full Timetable</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
            <CheckCircle size={14} color="#10b981" />
            <span style={{ fontSize: "13px", color: "#6ee7b7" }}>No conflicts detected · AI-optimized</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            className="input-field"
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            style={{ width: "auto", background: "rgba(255,255,255,0.05)" }}
          >
            {["Class 11 - Science A", "Class 11 - Science B", "Class 12 - Science", "Class 10 - General"].map(b => (
              <option key={b} value={b} style={{ background: "#0f0f1a" }}>{b}</option>
            ))}
          </select>
          <button id="download-timetable-btn" onClick={exportInstitutionTimetableToPDF} className="btn-secondary" style={{ fontSize: "13px" }}>
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Full timetable grid */}
      <div className="glass" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, width: "120px" }}>TIME</th>
              {DAYS.map(day => (
                <th key={day} style={{ padding: "16px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", fontWeight: 700 }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot, si) => (
              <tr key={slot} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{slot}</span>
                </td>
                {DAYS.map(day => {
                  const entry = DEMO_TIMETABLE[day]?.[si];
                  return (
                    <td key={day} style={{ padding: "6px 8px", textAlign: "center" }}>
                      {entry ? (
                        <div style={{
                          padding: "10px 8px", borderRadius: "10px",
                          background: `${entry.color}18`,
                          border: `1px solid ${entry.color}40`,
                          borderLeft: `3px solid ${entry.color}`,
                        }}>
                          <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{entry.subject}</p>
                          <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "3px" }}>{entry.teacher}</p>
                          <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{entry.room}</p>
                        </div>
                      ) : (
                        <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.01)" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subject legend */}
      <div className="glass-card" style={{ padding: "20px", marginTop: "20px" }}>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px", fontWeight: 600 }}>SUBJECT LEGEND</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {Object.values(DEMO_TIMETABLE.Monday).map((e) => (
            <div key={e.subject} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "999px", background: `${e.color}15`, border: `1px solid ${e.color}30` }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: e.color }} />
              <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{e.subject}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
