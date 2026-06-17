"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, MessageSquare,
  BarChart2, Building2, Settings, ChevronLeft, ChevronRight,
  GraduationCap
} from "lucide-react";
import { useState, useEffect } from "react";
import { Logo, LogoMark } from "@/components/Logo";

const NAV_SECTIONS = [
  {
    label: "Student",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/calendar",  icon: Calendar,         label: "Calendar" },
      { href: "/chat",      icon: MessageSquare,     label: "AI Coach" },
      { href: "/analytics", icon: BarChart2,         label: "Analytics" },
    ],
  },
  {
    label: "Institution",
    items: [
      { href: "/admin",             icon: Building2,      label: "Admin Panel" },
      { href: "/admin/timetable",   icon: GraduationCap,  label: "Timetable" },
    ],
  },
];

const BOTTOM_ITEMS = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

import { useUIStore } from "@/lib/store/uiStore";
import { createClient } from "@/lib/supabase/client";

export default function Sidebar() {
  const pathname = usePathname();
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    sidebarCollapsed, 
    toggleSidebarCollapsed, 
    setSidebarCollapsed 
  } = useUIStore();

  const collapsed = sidebarCollapsed;

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") {
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);
  const [role, setRole] = useState<"student" | "institution">(
    pathname.startsWith("/admin") ? "institution" : "student"
  );

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const metadataRole = user.user_metadata?.role;
        if (metadataRole === "student" || metadataRole === "institution") {
          setRole(metadataRole);
        }
      }
    });
  }, [pathname]);

  const visibleSections = NAV_SECTIONS.filter(({ label }) => {
    if (role === "institution") return label === "Institution";
    return label === "Student";
  });

  // Close sidebar drawer on pathname change (navigation)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const W = collapsed ? 68 : 230;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(3,3,7,0.7)",
            zIndex: 998,
            backdropFilter: "blur(5px)",
            transition: "opacity 0.25s ease"
          }}
          className="mobile-only-overlay"
        />
      )}

      <aside
        className={`sidebar-aside ${sidebarOpen ? "mobile-drawer-open" : ""}`}
        style={{
          width: `${W}px`,
          minHeight: "100vh",
          background: "rgba(8, 9, 15, 0.72)",
          backdropFilter: "blur(24px)",
          borderRight: "1px solid var(--c-border-1)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          flexShrink: 0,
          position: "relative",
          zIndex: 999,
        }}
      >

        {/* Logo container */}
        <div style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0" : "0 20px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: "1px solid var(--c-border-1)",
          flexShrink: 0,
        }}>
          {collapsed ? <LogoMark size={28} /> : <Logo size={28} />}
        </div>

        {/* Navigation list */}
        <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: "28px", overflowY: "auto" }}>
          {visibleSections.map(({ label, items }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {!collapsed && (
                <p style={{
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "var(--c-text-tertiary)",
                  padding: "0 10px", marginBottom: "4px"
                }}>{label}</p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {items.map(({ href, icon: Icon, label: itemLabel }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      data-tooltip={collapsed ? itemLabel : undefined}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        textDecoration: "none",
                        transition: "all var(--t-base)",
                        background: active ? "rgba(139, 92, 246, 0.08)" : "transparent",
                        border: active ? "1px solid rgba(139, 92, 246, 0.2)" : "1px solid transparent",
                        color: active ? "var(--c-text-primary)" : "var(--c-text-secondary)",
                        fontWeight: active ? 600 : 400,
                        fontSize: "13.5px",
                        whiteSpace: "nowrap",
                        justifyContent: collapsed ? "center" : "flex-start",
                        boxShadow: active ? "0 4px 14px rgba(139, 92, 246, 0.04)" : "none",
                      }}
                      onMouseEnter={e => { 
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.03)";
                          (e.currentTarget as HTMLElement).style.color = "var(--c-text-primary)";
                        }
                      }}
                      onMouseLeave={e => { 
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "var(--c-text-secondary)";
                        }
                      }}
                    >
                      <Icon
                        size={18}
                        style={{ 
                          flexShrink: 0, 
                          color: active ? "var(--c-accent-light)" : "inherit",
                          transition: "color var(--t-fast)"
                        }}
                      />
                      {!collapsed && <span>{itemLabel}</span>}
                      {active && !collapsed && (
                        <div style={{ 
                          marginLeft: "auto", 
                          width: "5px", 
                          height: "5px", 
                          borderRadius: "50%", 
                          background: "var(--c-secondary)",
                          boxShadow: "0 0 10px var(--c-secondary), 0 0 4px var(--c-secondary)"
                        }} />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom items */}
        <div style={{ padding: "10px", borderTop: "1px solid var(--c-border-1)" }}>
          {BOTTOM_ITEMS.map(({ href, icon: Icon, label: itemLabel }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                data-tooltip={collapsed ? itemLabel : undefined}
                style={{
                  display: "flex", alignItems: "center",
                  gap: "12px", padding: "10px 14px",
                  borderRadius: "10px", textDecoration: "none",
                  transition: "all var(--t-base)",
                  background: active ? "rgba(139, 92, 246, 0.08)" : "transparent",
                  border: active ? "1px solid rgba(139, 92, 246, 0.2)" : "1px solid transparent",
                  color: active ? "var(--c-text-primary)" : "var(--c-text-secondary)",
                  fontSize: "13.5px", justifyContent: collapsed ? "center" : "flex-start",
                  fontWeight: active ? 600 : 400,
                  boxShadow: active ? "0 4px 14px rgba(139, 92, 246, 0.04)" : "none",
                }}
                onMouseEnter={e => { 
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.03)";
                    (e.currentTarget as HTMLElement).style.color = "var(--c-text-primary)";
                  }
                }}
                onMouseLeave={e => { 
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--c-text-secondary)";
                  }
                }}
              >
                <Icon size={18} style={{ flexShrink: 0, color: active ? "var(--c-accent-light)" : "inherit" }} />
                {!collapsed && <span>{itemLabel}</span>}
              </Link>
            );
          })}

          {/* Collapse toggle */}
          <button
            onClick={toggleSidebarCollapsed}
            style={{
              marginTop: "6px",
              width: "100%", padding: "10px 14px",
              display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
              gap: "12px",
              background: "transparent", border: "none", cursor: "pointer",
              borderRadius: "10px", transition: "all var(--t-base)",
              color: "var(--c-text-tertiary)", fontSize: "13.5px",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
              (e.currentTarget as HTMLElement).style.color = "var(--c-text-primary)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--c-text-tertiary)";
            }}
          >
            {collapsed ? <ChevronRight size={17} /> : <><ChevronLeft size={17} /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      <style jsx global>{`
        @media (max-width: 768px) {
          .sidebar-aside {
            position: fixed !important;
            top: 0 !important;
            left: -230px !important;
            z-index: 999 !important;
            width: 230px !important;
            height: 100vh !important;
          }
          .sidebar-aside.mobile-drawer-open {
            left: 0 !important;
          }
          .mobile-only-overlay {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
