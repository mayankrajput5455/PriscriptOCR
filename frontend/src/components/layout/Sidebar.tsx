import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Upload,
  Search,
  Activity,
  ChevronRight,
  LogOut,
  UserCheck,
  Globe,
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";
import { cn, getInitials } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { Logo } from "../common/Logo";
import { ThemeToggle } from "../common/ThemeToggle";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patients & Charts", href: "/patients", icon: Users },
  { label: "Scan Prescription", href: "/upload", icon: Upload },
  { label: "Search Registry", href: "/search", icon: Search },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = location.pathname;

  if (pathname.startsWith("/login") || pathname.startsWith("/signup") ||
      pathname.startsWith("/verify") || pathname.startsWith("/verify-email")) {
    return null;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    toast.loading("Logging out...", { id: "logout" });
    try {
      await logout();
      toast.success("Logged out successfully", { id: "logout" });
    } catch {
      toast.error("Logout failed", { id: "logout" });
      setLoggingOut(false);
    }
  };

  return (
    <aside
      style={{
        width: 260,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        zIndex: 40,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-color)",
        boxShadow: "2px 0 12px rgba(15, 23, 42, 0.02)",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo size="md" subtitle="Clinical Dossier" to="/dashboard" />
        <ThemeToggle size="sm" />
      </div>

      {/* Navigation Section */}
      <nav style={{ flex: 1, padding: "20px 14px", overflowY: "auto" }}>
        <div style={{ padding: "0 10px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Clinical Console
          </p>
          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--accent-primary)", background: "var(--accent-subtle)", padding: "1px 6px", borderRadius: 4, border: "1px solid var(--accent-border)", fontWeight: 700 }}>
            v2.4
          </span>
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                marginBottom: 4,
                background: isActive ? "var(--accent-subtle)" : "transparent",
                border: isActive ? "1px solid var(--accent-border)" : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--bg-muted)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon size={18} color={isActive ? "var(--accent-primary)" : "var(--text-muted)"} strokeWidth={isActive ? 2.2 : 1.8} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && (
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-primary)" }} />
              )}
            </Link>
          );
        })}

        {/* Clinical Audit Stamp Callout */}
        <div style={{ marginTop: 28, marginInline: 4, padding: "14px", borderRadius: 10, background: "var(--bg-surface-subtle)", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <ShieldCheck size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace" }}>
              Medical OCR Engine
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Google Gemini Multimodal AI with calibrated drug formulary cross-checks.
          </p>
        </div>
      </nav>

      {/* User Clinician Profile Footer */}
      <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0f766e",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: "0 2px 4px rgba(15,118,110,0.2)",
            }}
          >
            {getInitials(user?.name || "Dr")}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name || "Practitioner"}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email || "Medical Staff"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out of console"
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: "1px solid var(--border-color)",
              background: "var(--bg-surface)",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#dc2626";
              e.currentTarget.style.borderColor = "#fca5a5";
              e.currentTarget.style.background = "#fef2f2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.background = "var(--bg-surface)";
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
export default Sidebar;
