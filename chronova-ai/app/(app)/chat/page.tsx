"use client";

import { useState, useRef, useEffect } from "react";
import { Brain, Send, Trash2, RefreshCw, User, Clock, Check, Download, Calendar as CalendarIcon, Plus, Mic, MicOff } from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";
import { useScheduleStore, ScheduleEvent } from "@/lib/store/scheduleStore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: Date | string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

const QUICK_CHIPS = [
  "I'm exhausted — lighten my day",
  "I have an exam in 3 days",
  "Move math to evening",
  "I missed today's sessions",
  "Give me a study tip",
  "Add gym at 6 PM tomorrow",
];

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: `Hi! I'm **Chronova**, your AI academic coach.\n\nI can help you:\n- Build and adjust your study schedule\n- Handle days when you're tired or overwhelmed\n- Rescue sessions you've missed\n- Give you evidence-based study strategies\n\nWhat's on your mind?`,
  time: new Date(),
};

function renderMarkdown(text: string) {
  let cleanText = text;
  const tagIdx = text.indexOf("<timetable_data>");
  if (tagIdx !== -1) {
    cleanText = text.substring(0, tagIdx);
  }
  return cleanText
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code style="background:rgba(139,92,246,0.1);padding:2px 6px;border-radius:4px;font-size:12.5px;color:var(--c-accent-light);border:1px solid rgba(139,92,246,0.2)">$1</code>')
    .replace(/\n/g, "<br/>");
}

export default function ChatPage() {
  const { events, setEvents } = useScheduleStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showHistorySidebar, setShowHistorySidebar] = useState(true);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? " " : "") + transcript);
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("chronova_chats");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          setActiveConversationId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Failed to parse conversations", e);
      }
    }
    const defaultConv: Conversation = {
      id: "default",
      title: "New Chat",
      messages: [WELCOME],
      createdAt: new Date().toISOString()
    };
    setConversations([defaultConv]);
    setActiveConversationId("default");
  }, []);

  function saveConversations(updated: Conversation[]) {
    setConversations(updated);
    localStorage.setItem("chronova_chats", JSON.stringify(updated));
  }

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const activeMessages = activeConv ? activeConv.messages : [WELCOME];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  function startNewChat() {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [WELCOME],
      createdAt: new Date().toISOString()
    };
    saveConversations([newConv, ...conversations]);
    setActiveConversationId(newConv.id);
  }

  function deleteChat(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const filtered = conversations.filter(c => c.id !== id);
    if (filtered.length === 0) {
      const defaultConv: Conversation = {
        id: "default",
        title: "New Chat",
        messages: [WELCOME],
        createdAt: new Date().toISOString()
      };
      saveConversations([defaultConv]);
      setActiveConversationId("default");
    } else {
      saveConversations(filtered);
      if (activeConversationId === id) {
        setActiveConversationId(filtered[0].id);
      }
    }
  }

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg, time: new Date() };
    const aiId = (Date.now() + 1).toString();
    const aiMsg: Message = { id: aiId, role: "assistant", content: "", time: new Date() };

    let nextTitle = activeConv ? activeConv.title : "New Chat";
    if (activeMessages.length === 1 && nextTitle === "New Chat") {
      nextTitle = msg.length > 25 ? msg.substring(0, 22) + "..." : msg;
    }

    const updatedMessages = [...activeMessages, userMsg, aiMsg];
    const initialConvs = conversations.map(c => 
      c.id === activeConversationId 
        ? { ...c, title: nextTitle, messages: updatedMessages } 
        : c
    );
    saveConversations(initialConvs);
    setLoading(true);

    try {
      const history = activeMessages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...history, { role: "user", content: msg }],
          userContext: { events }
        }),
      });

      if (!res.ok) throw new Error("API error");
      const reader = res.body?.getReader();
      const dec = new TextDecoder();
      let full = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += dec.decode(value, { stream: true });
          
          setConversations(prev => {
            const updated = prev.map(c => 
              c.id === activeConversationId
                ? {
                    ...c,
                    messages: c.messages.map(m => m.id === aiId ? { ...m, content: full } : m)
                  }
                : c
            );
            localStorage.setItem("chronova_chats", JSON.stringify(updated));
            return updated;
          });
        }

        // Auto-apply schedule changes in real-time when streaming is complete
        const match = full.match(/<timetable_data>([\s\S]*?)<\/timetable_data>/);
        if (match) {
          try {
            const parsedEvents = JSON.parse(match[1].trim());
            if (Array.isArray(parsedEvents) && parsedEvents.length > 0) {
              setEvents(parsedEvents);
            }
          } catch (e) {
            console.error("Failed to auto-apply timetable JSON on stream end", e);
          }
        }
      }
    } catch {
      setConversations(prev => {
        const updated = prev.map(c => 
          c.id === activeConversationId
            ? {
                ...c,
                messages: c.messages.map(m => m.id === aiId
                  ? { ...m, content: "I couldn't connect right now. Please add your **OpenRouter API key** (`OPENROUTER_API_KEY`) to `.env.local` and try again." }
                  : m
                )
              }
            : c
        );
        localStorage.setItem("chronova_chats", JSON.stringify(updated));
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", height: "calc(100vh - 120px)", display: "flex", gap: "24px" }} className="animate-fade">
      
      {/* Sidebar - Conversation History */}
      {showHistorySidebar && (
        <div style={{ 
          width: "260px", 
          background: "rgba(15, 17, 26, 0.65)", 
          border: "1px solid var(--c-border-1)", 
          borderRadius: "16px", 
          display: "flex", 
          flexDirection: "column", 
          overflow: "hidden",
          backdropFilter: "blur(12px)",
          flexShrink: 0
        }}>
          {/* New Session Button */}
          <div style={{ padding: "16px", borderBottom: "1px solid var(--c-border-1)" }}>
            <button 
              onClick={startNewChat} 
              className="btn btn-primary" 
              style={{ width: "100%", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", height: "42px" }}
            >
              <Plus size={15} /> New Coach Session
            </button>
          </div>
          
          {/* Topics List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {conversations.map(conv => {
              const isActive = conv.id === activeConversationId;
              return (
                <div 
                  key={conv.id} 
                  onClick={() => setActiveConversationId(conv.id)}
                  style={{
                    padding: "10px 12px", 
                    borderRadius: "10px", 
                    cursor: "pointer", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    background: isActive ? "var(--c-accent-dim)" : "transparent",
                    border: isActive ? "1px solid var(--c-accent-border)" : "1px solid transparent",
                    transition: "all var(--t-base)",
                    gap: "10px"
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                      e.currentTarget.style.borderColor = "var(--c-border-1)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", flex: 1 }}>
                    <Brain size={14} color={isActive ? "var(--c-accent-light)" : "var(--c-text-tertiary)"} style={{ flexShrink: 0 }} />
                    <span style={{ 
                      fontSize: "13px", 
                      fontWeight: isActive ? 600 : 500, 
                      color: isActive ? "var(--c-text-primary)" : "var(--c-text-secondary)",
                      overflow: "hidden", 
                      textOverflow: "ellipsis", 
                      whiteSpace: "nowrap" 
                    }}>
                      {conv.title}
                    </span>
                  </div>
                  {conversations.length > 1 && (
                    <button 
                      onClick={(e) => deleteChat(conv.id, e)}
                      style={{ 
                        background: "none", 
                        border: "none", 
                        cursor: "pointer", 
                        color: "var(--c-text-tertiary)", 
                        display: "flex", 
                        alignItems: "center",
                        padding: "2px",
                        borderRadius: "4px"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--c-danger)"; e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--c-text-tertiary)"; e.currentTarget.style.background = "none"; }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Chat Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Toggle History Sidebar button */}
            <button 
              onClick={() => setShowHistorySidebar(!showHistorySidebar)}
              style={{
                width: "36px", height: "36px", borderRadius: "10px", border: "1px solid var(--c-border-1)",
                background: showHistorySidebar ? "var(--c-accent-dim)" : "rgba(255,255,255,0.03)",
                color: showHistorySidebar ? "var(--c-accent-light)" : "var(--c-text-secondary)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                transition: "all var(--t-base)"
              }}
              title={showHistorySidebar ? "Hide History Sidebar" : "Show History Sidebar"}
            >
              <Brain size={16} />
            </button>

            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--c-accent-dim)", border: "1px solid var(--c-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px var(--c-accent-glow)" }}>
              <LogoMark size={24} />
            </div>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--c-text-primary)" }}>Chronova AI Coach</p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--c-success)", display: "inline-block", boxShadow: "0 0 8px var(--c-success)" }} className="animate-pulse" />
                <span style={{ fontSize: "12px", color: "var(--c-text-tertiary)", fontWeight: 500 }}>OpenRouter active · Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              saveConversations(conversations.map(c => c.id === activeConversationId ? { ...c, messages: [WELCOME] } : c));
            }} 
            className="btn btn-ghost" 
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Trash2 size={14} style={{ marginRight: "4px" }} /> Clear chat
          </button>
        </div>

        {/* Quick chips */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "8px" }}>
          {QUICK_CHIPS.map(chip => (
            <button 
              key={chip} 
              onClick={() => send(chip)} 
              style={{
                padding: "7px 14px", borderRadius: "999px", 
                border: "1px solid var(--c-border-1)",
                background: "rgba(15, 17, 26, 0.65)", color: "var(--c-text-secondary)",
                fontSize: "12.5px", cursor: "pointer", whiteSpace: "nowrap",
                transition: "all var(--t-base)", flexShrink: 0,
                fontWeight: 500,
                backdropFilter: "blur(8px)"
              }}
              onMouseEnter={e => { 
                (e.currentTarget).style.borderColor = "var(--c-accent-light)"; 
                (e.currentTarget).style.color = "var(--c-text-primary)";
                (e.currentTarget).style.background = "rgba(139, 92, 246, 0.08)";
                (e.currentTarget).style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.05)";
              }}
              onMouseLeave={e => { 
                (e.currentTarget).style.borderColor = "var(--c-border-1)"; 
                (e.currentTarget).style.color = "var(--c-text-secondary)";
                (e.currentTarget).style.background = "rgba(15, 17, 26, 0.65)";
                (e.currentTarget).style.boxShadow = "none";
              }}
            >{chip}</button>
          ))}
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px", padding: "10px 0" }}>
          {activeMessages.map(msg => (
            <div key={msg.id} style={{ display: "flex", gap: "14px", alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
              
              {/* Avatar */}
              <div style={{
                width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
                background: msg.role === "assistant" ? "var(--c-accent-dim)" : "var(--c-secondary-dim)",
                border: msg.role === "assistant" ? "1px solid var(--c-accent-border)" : "1px solid var(--c-secondary-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: msg.role === "assistant" ? "0 0 10px var(--c-accent-glow)" : "0 0 10px var(--c-secondary-glow)"
              }}>
                {msg.role === "assistant" ? <LogoMark size={20} /> : <User size={16} color="var(--c-secondary-light)" />}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: "75%",
                padding: "16px 20px",
                borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                background: msg.role === "user" ? "rgba(22, 26, 41, 0.7)" : "var(--c-surface-paper)",
                border: msg.role === "user" ? "1px solid rgba(139, 92, 246, 0.2)" : "1px solid var(--c-border-paper)",
                boxShadow: msg.role === "user" ? "0 4px 20px rgba(0,0,0,0.15)" : "0 12px 36px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.08)",
                backdropFilter: msg.role === "user" ? "blur(12px)" : "none",
              }}>
                {msg.content === "" && loading ? (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "6px 0" }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        width: "8px", height: "8px", borderRadius: "50%", background: "var(--c-accent)",
                        animation: `pulsingBeacon 1.2s ease-in-out ${i * 0.2}s infinite`
                      }} />
                    ))}
                  </div>
                ) : (() => {
                  let parsedEvents: ScheduleEvent[] | null = null;
                  if (msg.role === "assistant") {
                    const match = msg.content.match(/<timetable_data>([\s\S]*?)<\/timetable_data>/);
                    if (match) {
                      try {
                        parsedEvents = JSON.parse(match[1].trim());
                      } catch (e) {
                        console.error("Failed to parse timetable JSON", e);
                      }
                    }
                  }
                  return (
                    <>
                      <p style={{ 
                        fontSize: "14.5px", 
                        lineHeight: 1.65, 
                        color: msg.role === "user" ? "var(--c-text-primary)" : "var(--c-text-paper)",
                        fontFamily: msg.role === "user" ? "var(--font-sans)" : "var(--font-sans)"
                      }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                      {parsedEvents && (
                        <TimetablePreview 
                          events={parsedEvents} 
                          onApply={() => {
                            setEvents(parsedEvents!);
                          }}
                        />
                      )}
                    </>
                  );
                })()}
                <p style={{ fontSize: "11px", color: msg.role === "user" ? "var(--c-text-tertiary)" : "#6b7280", marginTop: "10px", fontWeight: 500, textAlign: msg.role === "user" ? "right" : "left" }}>
                  {new Date(msg.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input container */}
        <div style={{ 
          marginTop: "16px", 
          background: "rgba(15, 17, 26, 0.75)", 
          border: "1px solid var(--c-border-1)", 
          borderRadius: "16px", 
          padding: "14px 18px", 
          display: "flex", 
          gap: "12px", 
          alignItems: "flex-end",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37)",
          backdropFilter: "blur(16px)"
        }}>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask anything — 'I'm tired', 'Exam in 3 days', 'Reschedule physics'…"
            rows={2}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "var(--c-text-primary)", fontSize: "14px", resize: "none",
              fontFamily: "var(--font-sans)", lineHeight: 1.6,
            }}
          />
          {/* Mic Button for voice commands */}
          <button
            onClick={toggleListening}
            style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: isListening ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.03)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all var(--t-base)", flexShrink: 0,
              color: isListening ? "#ef4444" : "var(--c-text-tertiary)",
              border: isListening ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid transparent",
            }}
            className={isListening ? "pulsing-mic-active" : ""}
            title={isListening ? "Listening... Click to stop" : "Voice Command"}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          <button
            id="chat-send-btn"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: "40px", height: "40px", borderRadius: "12px", border: "none",
              background: input.trim() && !loading ? "var(--c-accent)" : "rgba(255,255,255,0.03)",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: input.trim() && !loading ? "0 4px 14px var(--c-accent-glow)" : "none",
              transition: "all var(--t-base)",
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (input.trim() && !loading) {
                (e.currentTarget as HTMLElement).style.background = "var(--c-accent-light)";
                (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={e => {
              if (input.trim() && !loading) {
                (e.currentTarget as HTMLElement).style.background = "var(--c-accent)";
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }
            }}
          >
            {loading
              ? <RefreshCw size={16} color="var(--c-text-tertiary)" style={{ animation: "spin 0.8s linear infinite" }} />
              : <Send size={16} color={input.trim() ? "#fff" : "var(--c-text-tertiary)"} />
            }
          </button>
        </div>
        <p style={{ fontSize: "11.5px", color: "var(--c-text-tertiary)", textAlign: "center", marginTop: "10px", fontWeight: 500 }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style jsx global>{`
        @keyframes pulsingMic {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .pulsing-mic-active {
          animation: pulsingMic 1.5s infinite;
        }
      `}</style>
    </div>
  );
}

function exportTimetableToPDF(events: ScheduleEvent[]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export the PDF.");
    return;
  }

  const formatTime = (h: number) => {
    const hr = Math.floor(h);
    const min = String(Math.round((h % 1) * 60)).padStart(2, "0");
    const ampm = hr >= 12 ? "PM" : "AM";
    const displayHr = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
    return `${displayHr}:${min} ${ampm}`;
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const eventsByDay = daysOfWeek.map((dayName, idx) => {
    const dayEvents = events
      .filter((e) => e.day === idx)
      .sort((a, b) => a.start - b.start);
    return { dayName, events: dayEvents };
  });

  let htmlContent = `
    <html>
      <head>
        <title>Weekly Timetable - Chronova AI</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@700&display=swap');
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          body {
            font-family: 'Inter', sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header {
            margin-bottom: 24px;
            border-bottom: 2px solid #8b5cf6;
            padding-bottom: 12px;
          }
          .title {
            font-family: 'Outfit', sans-serif;
            font-size: 24px;
            color: #0f172a;
            margin: 0;
          }
          .subtitle {
            font-size: 13px;
            color: #64748b;
            margin: 4px 0 0 0;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 12px;
            align-items: start;
          }
          .day-col {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px;
            min-height: 420px;
          }
          .day-header {
            font-family: 'Outfit', sans-serif;
            font-size: 14px;
            font-weight: 700;
            text-align: center;
            color: #475569;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 6px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .event-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-left: 3px solid #8b5cf6;
            border-radius: 6px;
            padding: 8px;
            margin-bottom: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          .event-title {
            font-size: 11px;
            font-weight: 600;
            color: #0f172a;
            margin: 0;
            word-wrap: break-word;
          }
          .event-time {
            font-size: 9.5px;
            color: #64748b;
            margin: 4px 0 0 0;
            font-weight: 500;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Chronova Weekly Timetable</h1>
          <p class="subtitle">Generated by Chronova AI Academic Coach on ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="grid">
  `;

  eventsByDay.forEach(({ dayName, events }) => {
    htmlContent += `
      <div class="day-col">
        <div class="day-header">${dayName.slice(0, 3)}</div>
    `;

    if (events.length === 0) {
      htmlContent += `<div style="text-align:center; color:#94a3b8; font-size:10px; margin-top:20px; font-style:italic;">No slots</div>`;
    } else {
      events.forEach((ev) => {
        const borderColors = ["#8b5cf6", "#10b981", "#06b6d4", "#38bdf8", "#f43f5e", "#6366f1"];
        const color = borderColors[ev.colorIdx % borderColors.length];
        htmlContent += `
          <div class="event-card" style="border-left-color: ${color}">
            <div class="event-title">${ev.title}</div>
            <div class="event-time">${formatTime(ev.start)} - ${formatTime(ev.end)}</div>
          </div>
        `;
      });
    }

    htmlContent += `</div>`;
  });

  htmlContent += `
        </div>
        <div class="footer">
          Optimized by Chronova AI. Empowering academic consistency and energy balance.
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

interface TimetablePreviewProps {
  events: ScheduleEvent[];
  onApply: () => void;
}

function TimetablePreview({ events, onApply }: TimetablePreviewProps) {
  const [activeDay, setActiveDay] = useState(0);
  const [applied, setApplied] = useState(false);
  const storeEvents = useScheduleStore(state => state.events);

  useEffect(() => {
    if (events.length === 0) {
      setApplied(false);
      return;
    }
    const isSubset = events.every(pe => 
      storeEvents.some(se => 
        se.day === pe.day && 
        se.start === pe.start && 
        se.end === pe.end && 
        se.title === pe.title
      )
    );
    setApplied(isSubset);
  }, [events, storeEvents]);

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
  const HOUR_HEIGHT = 42;
  const START_HOUR = 6;

  const SUBJECT_COLORS = [
    { bg: "rgba(139, 92, 246, 0.08)",    border: "rgba(139, 92, 246, 0.22)",       dot: "var(--c-accent)",     text: "var(--c-accent-light)" },
    { bg: "rgba(16, 185, 129, 0.08)",    border: "rgba(16, 185, 129, 0.22)",       dot: "#10b981",             text: "#a7f3d0" },
    { bg: "rgba(6, 182, 212, 0.08)",     border: "rgba(6, 182, 212, 0.22)",       dot: "var(--c-secondary)",  text: "var(--c-secondary-light)" },
    { bg: "rgba(56, 189, 248, 0.08)",    border: "rgba(56, 189, 248, 0.22)",      dot: "#38bdf8",             text: "#7dd3fc" },
    { bg: "rgba(244, 63, 94, 0.08)",     border: "rgba(244, 63, 94, 0.22)",       dot: "var(--c-orange)",     text: "#fda4af" },
    { bg: "rgba(99, 102, 241, 0.08)",    border: "rgba(99, 102, 241, 0.22)",      dot: "#6366f1",             text: "#a5b4fc" },
  ];

  const dayEvents = events.filter(e => e.day === activeDay);

  function handleApply() {
    onApply();
    setApplied(true);
  }

  function fmtHour(h: number) {
    const hr = Math.floor(h);
    const min = String(Math.round((h % 1) * 60)).padStart(2, "0");
    return `${hr}:${min}`;
  }

  return (
    <div style={{
      marginTop: "16px",
      background: "rgba(8, 9, 15, 0.95)",
      border: "1px solid var(--c-border-2)",
      borderRadius: "14px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      backdropFilter: "blur(12px)",
      color: "var(--c-text-primary)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--c-border-1)", paddingBottom: "10px" }}>
        <div>
          <h4 style={{ fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--c-text-primary)" }}>Visual Timetable</h4>
          <p style={{ fontSize: "11px", color: "var(--c-text-tertiary)" }}>{events.length} sessions generated</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            onClick={() => exportTimetableToPDF(events)}
            className="btn btn-secondary" 
            style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <Download size={13} /> PDF
          </button>
          <button 
            onClick={handleApply}
            disabled={applied}
            className="btn btn-primary" 
            style={{ 
              fontSize: "11px", padding: "6px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px",
              background: applied ? "var(--c-success)" : "var(--c-accent)",
              boxShadow: applied ? "none" : "0 4px 12px var(--c-accent-glow)"
            }}
          >
            {applied ? <><Check size={13} /> Applied</> : <><CalendarIcon size={13} /> Apply to Calendar</>}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid var(--c-border-1)", paddingBottom: "8px" }}>
        {DAYS.map((d, i) => {
          const count = events.filter(e => e.day === i).length;
          return (
            <button
              key={d}
              onClick={() => setActiveDay(i)}
              style={{
                flex: 1, padding: "6px 2px", border: "none", cursor: "pointer", borderRadius: "6px", fontSize: "11px", fontWeight: activeDay === i ? 700 : 500,
                background: activeDay === i ? "rgba(139, 92, 246, 0.12)" : "transparent",
                color: activeDay === i ? "var(--c-accent-light)" : "var(--c-text-secondary)",
                transition: "all var(--t-fast)"
              }}
            >
              {d}
              {count > 0 && (
                <span style={{
                  marginLeft: "4px", fontSize: "9px", padding: "1px 4px", borderRadius: "50%",
                  background: activeDay === i ? "var(--c-accent)" : "var(--c-surface-3)",
                  color: "#fff"
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ 
        height: "200px", overflowY: "auto", position: "relative", border: "1px solid var(--c-border-1)", borderRadius: "8px",
        background: "rgba(3, 3, 7, 0.4)", paddingRight: "4px"
      }}>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "50px 1fr", minHeight: `${HOURS.length * HOUR_HEIGHT}px` }}>
          <div style={{ borderRight: "1px solid var(--c-border-1)" }}>
            {HOURS.map(h => (
              <div key={h} style={{ height: `${HOUR_HEIGHT}px`, display: "flex", alignItems: "flex-start", paddingTop: "4px", justifyContent: "center" }}>
                <span style={{ fontSize: "9.5px", color: "var(--c-text-tertiary)", fontWeight: 600 }}>
                  {h > 12 ? `${h - 12}pm` : h === 12 ? "12pm" : `${h}am`}
                </span>
              </div>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            {HOURS.map(h => (
              <div key={h} style={{ height: `${HOUR_HEIGHT}px`, borderBottom: "1px dashed rgba(255,255,255,0.015)" }} />
            ))}

            {dayEvents.map(ev => {
              const c = SUBJECT_COLORS[ev.colorIdx % SUBJECT_COLORS.length];
              const top = (ev.start - START_HOUR) * HOUR_HEIGHT + 2;
              const height = Math.max((ev.end - ev.start) * HOUR_HEIGHT - 4, 18);
              return (
                <div
                  key={ev.id || `${ev.day}-${ev.start}`}
                  style={{
                    position: "absolute", left: "6px", right: "6px", top: `${top}px`, height: `${height}px`,
                    background: c.bg, border: `1px solid ${c.border}`, borderLeft: `3px solid ${c.dot}`,
                    borderRadius: "6px", padding: "4px 8px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center"
                  }}
                >
                  <p style={{ fontSize: "11px", fontWeight: 700, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {ev.title}
                  </p>
                  {height > 24 && (
                    <p style={{ fontSize: "9px", color: "var(--c-text-tertiary)", fontWeight: 500 }}>
                      {fmtHour(ev.start)} – {fmtHour(ev.end)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {dayEvents.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <p style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", color: "var(--c-text-tertiary)", letterSpacing: "0.04em" }}>Session list</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {dayEvents.map(ev => {
              const c = SUBJECT_COLORS[ev.colorIdx % SUBJECT_COLORS.length];
              return (
                <div key={ev.id || `${ev.day}-${ev.start}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "rgba(255,255,255,0.01)", borderRadius: "6px", border: "1px solid var(--c-border-1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: c.dot }} />
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--c-text-secondary)" }}>{ev.title}</span>
                  </div>
                  <span style={{ fontSize: "10.5px", color: "var(--c-text-tertiary)", fontWeight: 500 }}>{fmtHour(ev.start)} – {fmtHour(ev.end)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
