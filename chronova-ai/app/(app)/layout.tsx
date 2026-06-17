"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import FloatingAssistant from "@/components/chat/FloatingAssistant";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const urlRole = searchParams.get("role");

      let role = user.user_metadata?.role;

      // If a role param is provided in the URL and differs from the current metadata role, update it
      if (urlRole && (urlRole === "student" || urlRole === "institution") && role !== urlRole) {
        role = urlRole;
        supabase.auth.updateUser({
          data: { role: urlRole }
        });
      }

      const guessedRole = pathname.startsWith("/admin") ? "institution" : "student";

      // If user has no metadata role (e.g. initial Google login), auto-update user metadata
      if (!role) {
        role = guessedRole;
        supabase.auth.updateUser({
          data: { role: guessedRole }
        });
      }

      const activeRole = role || guessedRole;

      if (activeRole === "student" && pathname.startsWith("/admin")) {
        router.push("/dashboard");
      } else if (activeRole === "institution" && !pathname.startsWith("/admin") && pathname !== "/settings") {
        router.push("/admin");
      } else {
        setLoading(false);
      }
    });
  }, [pathname, router]);

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "var(--c-base)", color: "var(--c-text-secondary)" }}>
        <div style={{ fontSize: "14px", fontWeight: 600 }}>Loading Chronova OS...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <Navbar />
        <main
          className="app-main-content"
          style={{
            flex: 1,
            overflowY: "auto",
            background: "var(--c-base)",
          }}
        >
          {children}
        </main>
      </div>
      <FloatingAssistant />
    </div>
  );
}
