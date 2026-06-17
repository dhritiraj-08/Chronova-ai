"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { LandingHeroPreview } from "@/components/LandingHeroPreview";
import { LandingTimetableDemo } from "@/components/LandingTimetableDemo";
import { LandingHowItWorks } from "@/components/LandingHowItWorks";
import { LandingFeatureShowcase } from "@/components/LandingFeatureShowcase";
import {
  ArrowRight, CheckCircle, ChevronRight,
  Sparkles, Calendar, MessageCircle, BarChart2,
  Building, Shield, Zap, Moon, Target,
  Users, BookOpen, Star, Clock, Play
} from "lucide-react";

/* ─── Static Data ─── */

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Interactive Demo", href: "#demo" },
  { label: "How it works", href: "#how" },
  { label: "For Institutions", href: "#institutions" },
  { label: "Testimonials", href: "#testimonials" },
];

const TESTIMONIALS = [
  {
    body: "I used to rewrite my schedule every Sunday. Now Chronova does it for me — and honestly does it better. My study hours went up 40% in six weeks.",
    author: "Arjun M.",
    role: "JEE Aspirant, Delhi",
    rating: 5,
  },
  {
    body: "We needed to generate conflict-free timetables for 1,200 students across 18 batches. What used to take three days now takes four minutes.",
    author: "Dr. Kavita Rao",
    role: "Principal, Rungta College",
    rating: 5,
  },
  {
    body: "The burnout detection is what got me. It noticed I'd been overloading Thursday nights and blocked two hours of recovery time without me asking.",
    author: "Priya S.",
    role: "UPSC Aspirant, Bangalore",
    rating: 5,
  },
];

const STATS = [
  { value: "50K+", label: "Students scheduled" },
  { value: "2,100+", label: "Institutions served" },
  { value: "94%", label: "Better grades reported" },
  { value: "4.9★", label: "Average rating" },
];

const INSTITUTION_FEATURES = [
  { icon: Building, title: "One-click AI Timetable", desc: "Input your teachers, subjects, rooms, and constraints. Get a fully optimised, conflict-free timetable in seconds." },
  { icon: Shield, title: "Conflict Detection", desc: "Automatic detection of teacher clashes, room overlaps, and period imbalances — with suggested resolutions." },
  { icon: Users, title: "Teacher Availability Management", desc: "Define per-teacher working days, subject preferences, and max periods. Chronova respects every constraint." },
  { icon: BookOpen, title: "Pedagogical Intelligence", desc: "Heavier subjects placed in morning slots, labs given adequate time, and workloads distributed evenly across the week." },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ minHeight: "100vh" }} className="page-bg">
      <div className="page-content">

        {/* ──────────────── NAV ──────────────── */}
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          height: "64px",
          display: "flex", alignItems: "center",
          borderBottom: scrolled ? "1px solid var(--c-border-1)" : "1px solid transparent",
          background: scrolled ? "rgba(8, 9, 15, 0.75)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          transition: "all var(--t-base)",
        }}>
          <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <Logo size={28} />
            </Link>

            {/* Nav links */}
            <nav style={{ display: "flex", gap: "4px" }} className="desktop-only-nav">
              {NAV_LINKS.map(l => (
                <a key={l.label} href={l.href} className="btn btn-ghost" style={{ fontSize: "13.5px", fontWeight: 500 }}>{l.label}</a>
              ))}
            </nav>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Link href="/login"><button className="btn btn-ghost" style={{ fontSize: "13.5px", fontWeight: 500 }}>Sign in</button></Link>
              <Link href="/signup">
                <button className="btn btn-primary" style={{ fontSize: "13.5px", padding: "10px 20px" }}>
                  Get started <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* ──────────────── HERO ──────────────── */}
        <section style={{ paddingTop: "160px", paddingBottom: "100px", textAlign: "center" }}>
          <div className="container-sm">
            {/* Eyebrow */}
            <div className="animate-up" style={{ marginBottom: "28px" }}>
              <span className="badge badge-secondary" style={{ padding: "6px 16px", fontSize: "12px", border: "1px solid var(--c-secondary-border)" }}>
                <Sparkles size={12} style={{ marginRight: "4px" }} /> Powered by OpenRouter AI
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-up-1 font-display" style={{
              fontSize: "clamp(48px, 7.5vw, 88px)",
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              marginBottom: "28px",
              color: "var(--c-text-primary)"
            }}>
              Study smarter,{" "}
              <span className="headline-gradient" style={{ fontStyle: "italic", fontFamily: "var(--font-editorial)", fontWeight: 400 }}>sleep better,</span>{" "}
              <br />and actually achieve.
            </h1>

            {/* Sub */}
            <p className="animate-up-2" style={{
              fontSize: "17.5px",
              color: "var(--c-text-secondary)",
              lineHeight: 1.75,
              maxWidth: "540px",
              margin: "0 auto 44px",
            }}>
              Chronova is an AI that understands your life — not just your syllabus.
              It builds, adapts, and defends your schedule so you can focus on the work.
            </p>

            {/* CTAs */}
            <div className="animate-up-3" style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
              <Link href="/signup">
                <button id="hero-start-btn" className="btn btn-primary btn-primary-lg">
                  Start for free <ArrowRight size={16} />
                </button>
              </Link>
              <a href="#demo">
                <button className="btn btn-secondary" style={{ padding: "14px 26px", borderRadius: "var(--r-lg)", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Play size={15} /> See sandbox demo
                </button>
              </a>
            </div>

            <p className="animate-up-4" style={{ fontSize: "12px", color: "var(--c-text-tertiary)", fontWeight: 500 }}>
              Free to start · No credit card required · AI active
            </p>
          </div>

          {/* Immersive Mockup Wrapper */}
          <div className="container animate-up-4" style={{ position: "relative", marginTop: "32px" }}>
            {/* Glowing background behind mockup */}
            <div style={{
              position: "absolute",
              top: "10%", left: "15%", right: "15%", bottom: "20%",
              background: "radial-gradient(circle, rgba(139, 92, 246, 0.16) 0%, transparent 70%)",
              filter: "blur(60px)",
              pointerEvents: "none",
              zIndex: -1
            }} />
            <LandingHeroPreview />
          </div>

          {/* Stats grid */}
          <div className="container animate-up-4" style={{ marginTop: "80px" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px",
              maxWidth: "880px", margin: "0 auto"
            }} className="responsive-stats-grid">
              {STATS.map(({ value, label }) => (
                <div key={label} className="card" style={{ padding: "26px 20px", textAlign: "center", background: "rgba(15,17,26,0.55)", border: "1px solid var(--c-border-1)", backdropFilter: "blur(12px)" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, color: "var(--c-text-primary)", letterSpacing: "-0.03em" }}>{value}</p>
                  <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: "6px" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────── FEATURES ──────────────── */}
        <section id="features" style={{ padding: "120px 0", borderTop: "1px solid var(--c-border-1)" }}>
          <div className="container">
            {/* Section header */}
            <div style={{ maxWidth: "560px", marginBottom: "48px" }}>
              <span className="eyebrow" style={{ marginBottom: "18px", display: "flex" }}>For Students</span>
              <h2 className="font-display" style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.03em", marginBottom: "18px" }}>
                Your schedule, finally as smart as you are.
              </h2>
              <p style={{ fontSize: "16px", color: "var(--c-text-secondary)", lineHeight: 1.7 }}>
                Four core dimensions designed in tandem to give you back your study rhythm, focus, and confidence.
              </p>
            </div>

            {/* Bento-grid showcase */}
            <LandingFeatureShowcase />
          </div>
        </section>

        {/* ──────────────── HOW IT WORKS ──────────────── */}
        <section id="how" style={{ padding: "120px 0", borderTop: "1px solid var(--c-border-1)" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: "520px", margin: "0 auto 48px" }}>
              <span className="eyebrow" style={{ justifyContent: "center", marginBottom: "18px", display: "flex" }}>How It Works</span>
              <h2 className="font-display" style={{ fontSize: "clamp(30px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                From zero to a complete plan in minutes
              </h2>
            </div>

            <LandingHowItWorks />
          </div>
        </section>

        {/* ──────────────── LIVE TIMETABLE DEMO ──────────────── */}
        <section id="demo" style={{ padding: "120px 0", borderTop: "1px solid var(--c-border-1)", background: "rgba(8, 9, 15, 0.45)" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 64px" }}>
              <span className="eyebrow" style={{ justifyContent: "center", marginBottom: "18px", display: "flex" }}>Interactive Sandbox</span>
              <h2 className="font-display" style={{ fontSize: "clamp(30px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                Experience the scheduling engine
              </h2>
              <p style={{ fontSize: "15.5px", color: "var(--c-text-secondary)", marginTop: "14px", lineHeight: 1.65 }}>
                Click the simulation actions below to observe how the AI dynamically handles subject prioritizing, cognitive breaks, and mental fatigue blocks.
              </p>
            </div>

            <LandingTimetableDemo />
          </div>
        </section>

        {/* ──────────────── INSTITUTIONS ──────────────── */}
        <section id="institutions" style={{ padding: "120px 0", borderTop: "1px solid var(--c-border-1)" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }} className="responsive-institutions-grid">
              {/* Left */}
              <div>
                <span className="eyebrow" style={{ marginBottom: "18px", display: "flex" }}>For Institutions</span>
                <h2 className="font-display" style={{ fontSize: "clamp(30px, 3.5vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "22px" }}>
                  Timetables that used to take days. Now take four minutes.
                </h2>
                <p style={{ fontSize: "15.5px", color: "var(--c-text-secondary)", lineHeight: 1.75, marginBottom: "36px" }}>
                  Chronova's institution engine takes your constraints — teachers, subjects, rooms, age groups — and produces a conflict-free, pedagogically sound timetable using AI.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "40px" }}>
                  {["No more spreadsheet chaos", "Conflict detection built in", "Export-ready in one click", "Supports 50+ batches"].map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <CheckCircle size={16} color="var(--c-success)" />
                      <span style={{ fontSize: "14.5px", color: "var(--c-text-secondary)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup">
                  <button className="btn btn-primary" style={{ padding: "12px 24px" }}>
                    Try for your institution <ArrowRight size={15} />
                  </button>
                </Link>
              </div>

              {/* Right — feature list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "16px 8px", background: "rgba(15,17,26,0.45)", border: "1px solid var(--c-border-1)" }} className="card">
                {INSTITUTION_FEATURES.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    style={{ padding: "18px 20px", borderRadius: "12px", display: "flex", gap: "18px", alignItems: "flex-start", transition: "all var(--t-base)", cursor: "default" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(139,92,246,0.08)", border: "1px solid var(--c-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={18} color="var(--c-accent-light)" />
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 650, color: "var(--c-text-primary)" }}>{title}</p>
                      <p style={{ fontSize: "13px", color: "var(--c-text-secondary)", lineHeight: 1.6, marginTop: "4px" }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────── TESTIMONIALS ──────────────── */}
        <section id="testimonials" style={{ padding: "120px 0", borderTop: "1px solid var(--c-border-1)" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: "500px", margin: "0 auto 64px" }}>
              <span className="eyebrow" style={{ justifyContent: "center", marginBottom: "18px", display: "flex" }}>Testimonials</span>
              <h2 className="font-display" style={{ fontSize: "clamp(30px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                Students and schools that made the switch
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
              {TESTIMONIALS.map(({ body, author, role, rating }) => (
                <div key={author} className="card card-hover" style={{
                  padding: "32px",
                  display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "24px"
                }}>
                  <div>
                    <div style={{ display: "flex", gap: "4px", marginBottom: "18px" }}>
                      {Array.from({ length: rating }).map((_, i) => <Star key={i} size={14} fill="var(--c-secondary)" color="var(--c-secondary)" />)}
                    </div>
                    <p style={{ fontSize: "14.5px", color: "var(--c-text-secondary)", lineHeight: 1.75, fontStyle: "italic" }}>"{body}"</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: "var(--c-accent-dim)", border: "1px solid var(--c-accent-border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13.5px", fontWeight: 700, color: "var(--c-accent-light)"
                    }}>
                      {author.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--c-text-primary)" }}>{author}</p>
                      <p style={{ fontSize: "12px", color: "var(--c-text-tertiary)", marginTop: "2px", fontWeight: 500 }}>{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────── CTA ──────────────── */}
        <section style={{ padding: "120px 0", borderTop: "1px solid var(--c-border-1)" }}>
          <div className="container-sm" style={{ textAlign: "center" }}>
            <span className="badge badge-orange" style={{ padding: "6px 16px", fontSize: "12px", marginBottom: "28px", display: "inline-flex" }}>
              <Clock size={12} style={{ marginRight: "4px" }} /> Free forever plan available
            </span>
            <h2 className="font-display" style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05,
              marginBottom: "24px"
            }}>
              Build the schedule you've
              <br />always needed.
            </h2>
            <p style={{ fontSize: "16.5px", color: "var(--c-text-secondary)", lineHeight: 1.75, marginBottom: "44px" }}>
              Join 50,000+ students and 2,100 institutions who stopped guessing
              <br />and started actually planning.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup">
                <button id="cta-start-btn" className="btn btn-primary btn-primary-lg">
                  Create my free account <ArrowRight size={16} />
                </button>
              </Link>
              <Link href="/login">
                <button className="btn btn-secondary" style={{ padding: "14px 26px", borderRadius: "var(--r-lg)", fontSize: "15px" }}>
                  Sign in instead
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ──────────────── FOOTER ──────────────── */}
        <footer style={{ borderTop: "1px solid var(--c-border-1)", padding: "40px 0", background: "rgba(3,3,7,0.3)" }}>
          <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
            <Logo size={26} />
            <p style={{ fontSize: "13px", color: "var(--c-text-tertiary)", fontWeight: 500 }}>
              © 2026 Chronova AI · Built for students everywhere
            </p>
            <div style={{ display: "flex", gap: "6px" }}>
              {["Privacy", "Terms", "Contact"].map(l => (
                <a key={l} href="#" className="btn btn-ghost" style={{ fontSize: "13px", padding: "6px 12px", fontWeight: 500 }}>{l}</a>
              ))}
            </div>
          </div>
        </footer>

        <style jsx global>{`
          @media (max-width: 768px) {
            .desktop-only-nav {
              display: none !important;
            }
            .responsive-stats-grid {
              grid-template-columns: 1fr 1fr !important;
            }
            .responsive-institutions-grid {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
