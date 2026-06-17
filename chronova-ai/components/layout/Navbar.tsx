"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, Search, Menu, X, Calendar, MessageSquare,
  LayoutDashboard, BarChart2, Settings, User, LogOut,
  Info, AlertTriangle, CheckCircle, Flame
} from "lucide-react";
import { useUIStore } from "@/lib/store/uiStore";
import { useScheduleStore } from "@/lib/store/scheduleStore";
import { createClient } from "@/lib/supabase/client";

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  "/dashboard":       { title: "Dashboard",      sub: "Your study overview" },
  "/calendar":        { title: "Calendar",        sub: "Manage your schedule" },
  "/chat":            { title: "AI Coach",        sub: "Chat with Chronova" },
  "/analytics":       { title: "Analytics",       sub: "Track your progress" },
  "/admin":           { title: "Admin Panel",     sub: "Institution management" },
  "/admin/timetable": { title: "Timetable",       sub: "Full institution timetable" },
  "/admin/teachers":  { title: "Teachers",        sub: "Manage teaching staff" },
  "/admin/classes":   { title: "Classes",         sub: "Batches & classrooms" },
  "/settings":        { title: "Settings",        sub: "Preferences & account" },
};

function getPageMeta(pathname: string) {
  const exact = PAGE_TITLES[pathname];
  if (exact) return exact;
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key) && key !== "/") return val;
  }
  return { title: "Chronova", sub: "" };
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const meta = getPageMeta(pathname);
  const supabase = createClient();
  
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  const { events } = useScheduleStore();

  // Dialog & Dropdown States
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Coaching notifications state
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Burnout Advisory",
      body: "You scheduled 3 heavy sessions in a row today. Consider moving Revision to tomorrow.",
      type: "warning",
      time: "10m ago",
      color: "var(--c-orange)"
    },
    {
      id: "2",
      title: "Streak Milestone!",
      body: "Fantastic! You maintained a 7-day study streak. Keep up the high focus.",
      type: "success",
      time: "2h ago",
      color: "var(--c-success)"
    },
    {
      id: "3",
      title: "Upcoming Session",
      body: "Physics starts in 15 minutes. Take a quick stretch and grab some water.",
      type: "info",
      time: "15m ago",
      color: "var(--c-secondary)"
    }
  ]);

  // Click outside references
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on route changes
  useEffect(() => {
    setShowNotifications(false);
    setShowProfile(false);
    setShowSearch(false);
  }, [pathname]);

  // Focus search input when modal opens
  useEffect(() => {
    if (showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [showSearch]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape key to close search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowSearch(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Quick navigation items for search
  const QUICK_LINKS = [
    { title: "Dashboard Overview", path: "/dashboard", desc: "See study stats and daily session check-offs", icon: LayoutDashboard },
    { title: "Weekly Calendar", path: "/calendar", desc: "Manage calendar slots and study times", icon: Calendar },
    { title: "AI Coach Companion", path: "/chat", desc: "Talk with Chronova for schedule adjustments", icon: MessageSquare },
    { title: "Analytics Panel", path: "/analytics", desc: "Track progress charts and hours", icon: BarChart2 },
    { title: "Account Settings", path: "/settings", desc: "Change preferences and system theme", icon: Settings },
  ];

  // Search filter lists
  const filteredLinks = QUICK_LINKS.filter(link =>
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = searchQuery.trim() === "" ? [] : events.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigate = (path: string) => {
    router.push(path);
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleNavigateEvent = (eventId: string | number) => {
    router.push("/calendar");
    setShowSearch(false);
    setSearchQuery("");
  };

  // Notifications helpers
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <>
      <header style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: "1px solid var(--c-border-1)",
        background: "rgba(8, 9, 15, 0.72)",
        backdropFilter: "blur(24px)",
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
      }}>
        {/* Left actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={toggleSidebar}
            className="btn btn-icon mobile-menu-btn"
            aria-label="Toggle Menu"
            style={{ border: "none", background: "rgba(255,255,255,0.03)" }}
          >
            <Menu size={18} />
          </button>

          <div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "-0.015em",
              lineHeight: 1.2,
              color: "var(--c-text-primary)"
            }}>
              {meta.title}
            </h1>
            {meta.sub && (
              <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginTop: "2px" }} className="desktop-only-sub">
                {meta.sub}
              </p>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
          {/* Search trigger */}
          <button 
            onClick={() => setShowSearch(true)} 
            className="btn btn-icon" 
            aria-label="Search" 
            style={{ border: "none", background: "transparent" }}
          >
            <Search size={16} />
          </button>

          {/* Notifications bell dropdown */}
          <div style={{ position: "relative" }}>
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }} 
              className="btn btn-icon" 
              aria-label="Notifications" 
              style={{ position: "relative", border: "none", background: "transparent" }}
            >
              <Bell size={16} />
              {notifications.length > 0 && (
                <span style={{
                  position: "absolute", top: "7px", right: "7px",
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "var(--c-orange)",
                  boxShadow: "0 0 8px var(--c-orange), 0 0 4px var(--c-orange)"
                }} />
              )}
            </button>

            {/* Notifications Dropdown card */}
            {showNotifications && (
              <div 
                ref={notificationsRef}
                style={{
                  position: "absolute", right: 0, top: "45px",
                  width: "360px", background: "rgba(15, 17, 26, 0.95)",
                  border: "1px solid var(--c-border-2)", borderRadius: "14px",
                  boxShadow: "var(--sh-lg)", backdropFilter: "blur(16px)",
                  padding: "16px", zIndex: 100, display: "flex", flexDirection: "column", gap: "12px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--c-border-1)", paddingBottom: "10px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-display)" }}>Coaching Alerts</h4>
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAllNotifications}
                      style={{ background: "none", border: "none", color: "var(--c-text-tertiary)", fontSize: "11px", cursor: "pointer", fontWeight: 600 }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--c-text-primary)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--c-text-tertiary)"}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "var(--c-text-tertiary)" }}>
                      <p style={{ fontSize: "13px", fontWeight: 500 }}>No active alerts</p>
                      <p style={{ fontSize: "11px", marginTop: "2px" }}>AI Coach will notify you of optimizations.</p>
                    </div>
                  ) : (
                    notifications.map(n => {
                      return (
                        <div 
                          key={n.id} 
                          style={{
                            padding: "10px 12px", background: "rgba(255,255,255,0.015)",
                            border: `1px solid var(--c-border-1)`, borderLeft: `3px solid ${n.color}`,
                            borderRadius: "8px", position: "relative"
                          }}
                        >
                          <button 
                            onClick={() => dismissNotification(n.id)}
                            style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", color: "var(--c-text-tertiary)", cursor: "pointer", display: "flex" }}
                          >
                            <X size={12} />
                          </button>
                          <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", paddingRight: "14px" }}>
                            <div>
                              <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--c-text-primary)" }}>{n.title}</p>
                              <p style={{ fontSize: "11.5px", color: "var(--c-text-secondary)", marginTop: "3px", lineHeight: 1.4 }}>{n.body}</p>
                              <span style={{ fontSize: "9px", color: "var(--c-text-tertiary)", marginTop: "6px", display: "inline-block" }}>{n.time}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: "1px", height: "20px", background: "var(--c-border-1)", margin: "0 4px" }} />

          {/* Profile tab / Avatar */}
          <div style={{ position: "relative" }}>
            <div 
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "var(--c-accent-dim)",
                border: "1px solid var(--c-accent-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12.5px", fontWeight: 700, color: "var(--c-accent-light)",
                cursor: "pointer",
                transition: "all var(--t-fast)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 12px var(--c-accent-glow)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--c-accent-light)";
              }}
              onMouseLeave={e => {
                if (!showProfile) {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--c-accent-border)";
                }
              }}
            >
              U
            </div>

            {/* Profile Dropdown card */}
            {showProfile && (
              <div 
                ref={profileRef}
                style={{
                  position: "absolute", right: 0, top: "45px",
                  width: "240px", background: "rgba(15, 17, 26, 0.95)",
                  border: "1px solid var(--c-border-2)", borderRadius: "14px",
                  boxShadow: "var(--sh-lg)", backdropFilter: "blur(16px)",
                  padding: "16px", zIndex: 100, display: "flex", flexDirection: "column", gap: "14px"
                }}
              >
                {/* User Details */}
                <div style={{ borderBottom: "1px solid var(--c-border-1)", paddingBottom: "10px" }}>
                  <p style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--c-text-primary)" }}>Alex Student</p>
                  <p style={{ fontSize: "11.5px", color: "var(--c-text-tertiary)" }}>student@chronova.ai</p>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.18)", padding: "4px 8px", borderRadius: "6px" }}>
                    <Flame size={12} color="var(--c-secondary-light)" />
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--c-secondary-light)" }}>7 Days Streak</span>
                  </div>
                </div>

                {/* Dropdown Menu Links */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <button 
                    onClick={() => router.push("/settings")}
                    style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "var(--c-text-secondary)", fontSize: "12.5px", padding: "6px 8px", cursor: "pointer", borderRadius: "6px", width: "100%", textAlign: "left", transition: "all var(--t-fast)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "var(--c-text-primary)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--c-text-secondary)"; }}
                  >
                    <User size={14} /> Profile Settings
                  </button>
                  <button 
                    onClick={() => router.push("/calendar")}
                    style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "var(--c-text-secondary)", fontSize: "12.5px", padding: "6px 8px", cursor: "pointer", borderRadius: "6px", width: "100%", textAlign: "left", transition: "all var(--t-fast)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "var(--c-text-primary)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--c-text-secondary)"; }}
                  >
                    <Calendar size={14} /> View Calendar
                  </button>
                  <button 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push("/login");
                    }}
                    style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "var(--c-orange)", fontSize: "12.5px", padding: "6px 8px", cursor: "pointer", borderRadius: "6px", width: "100%", textAlign: "left", transition: "all var(--t-fast)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,63,94,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette / Search Modal */}
      {showSearch && (
        <div 
          onClick={() => setShowSearch(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(3, 3, 7, 0.75)",
            backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", justifyContent: "center",
            paddingTop: "12vh"
          }}
          className="animate-fade"
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              width: "600px", maxWidth: "90%", background: "rgba(15, 17, 26, 0.95)",
              border: "1px solid var(--c-border-2)", borderRadius: "16px",
              boxShadow: "var(--sh-lg)", overflow: "hidden", display: "flex", flexDirection: "column",
              height: "fit-content", maxHeight: "60vh"
            }}
            className="animate-up"
          >
            {/* Search Input Box */}
            <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--c-border-1)" }}>
              <Search size={18} color="var(--c-text-tertiary)" style={{ marginRight: "12px", flexShrink: 0 }} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search navigation pages or study events..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontSize: "14.5px", color: "var(--c-text-primary)", fontFamily: "var(--font-sans)"
                }}
              />
              <button 
                onClick={() => setShowSearch(false)}
                style={{ background: "none", border: "none", color: "var(--c-text-tertiary)", cursor: "pointer", display: "flex", marginLeft: "12px" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Results Listings */}
            <div style={{ overflowY: "auto", padding: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
              
              {/* Quick Links section */}
              {filteredLinks.length > 0 && (
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--c-text-tertiary)", letterSpacing: "0.06em", padding: "8px 10px 4px 10px" }}>
                    Navigation
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {filteredLinks.map(link => {
                      const Icon = link.icon;
                      return (
                        <div 
                          key={link.path}
                          onClick={() => handleNavigate(link.path)}
                          style={{
                            display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px",
                            borderRadius: "8px", cursor: "pointer", transition: "all var(--t-fast)"
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <div style={{ width: "30px", height: "30px", borderRadius: "6px", background: "var(--c-surface-3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon size={14} color="var(--c-accent-light)" />
                          </div>
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-text-primary)" }}>{link.title}</p>
                            <p style={{ fontSize: "11.5px", color: "var(--c-text-tertiary)", marginTop: "1px" }}>{link.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Study events section */}
              {filteredEvents.length > 0 && (
                <div style={{ borderTop: "1px solid var(--c-border-0)", paddingTop: "8px", marginTop: "4px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--c-text-tertiary)", letterSpacing: "0.06em", padding: "4px 10px" }}>
                    Timetable Sessions
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {filteredEvents.map(ev => (
                      <div 
                        key={ev.id}
                        onClick={() => handleNavigateEvent(ev.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px",
                          borderRadius: "8px", cursor: "pointer", transition: "all var(--t-fast)"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ width: "30px", height: "30px", borderRadius: "6px", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Calendar size={14} color="var(--c-accent-light)" />
                        </div>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-text-primary)" }}>{ev.title}</p>
                          <p style={{ fontSize: "11.5px", color: "var(--c-text-tertiary)", marginTop: "1px" }}>
                            Scheduled on {DAYS[ev.day]} at {Math.floor(ev.start)}:{String(Math.round((ev.start % 1) * 60)).padStart(2, "0")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {filteredLinks.length === 0 && filteredEvents.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--c-text-tertiary)" }}>
                  <p style={{ fontSize: "13.5px", fontWeight: 500 }}>No results matching "{searchQuery}"</p>
                  <p style={{ fontSize: "11.5px", marginTop: "2px" }}>Try searching for "math", "analytics", or "calendar".</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .mobile-menu-btn {
          display: none !important;
        }
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex !important;
          }
          .desktop-only-sub {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
