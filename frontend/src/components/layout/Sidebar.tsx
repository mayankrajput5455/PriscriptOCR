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
} from "lucide-react";
import { cn, getInitials } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Upload", href: "/upload", icon: Upload },
  { label: "Search", href: "/search", icon: Search },
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
        width: 256,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        background: "linear-gradient(180deg, #0d1526 0%, #0f172a 100%)",
        borderRight: "1px solid #1e293b",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px", borderBottom: "1px solid #1e293b" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
            }}
          >
            <Activity size={16} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc", lineHeight: 1, marginBottom: 2 }}>
              PrescriptOCR
            </p>
            <p style={{ fontSize: 12, color: "#64748b" }}>Medical AI Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "20px 12px", overflowY: "auto" }}>
        <p style={{ padding: "0 12px", marginBottom: 12, fontSize: 11, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#93c5fd" : "#94a3b8",
                transition: "all 0.2s",
                marginBottom: 4,
                background: isActive ? "rgba(59,130,246,0.12)" : "transparent",
                border: isActive ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(51,65,85,0.4)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#f1f5f9";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8";
                }
              }}
            >
              <Icon size={16} style={{ flexShrink: 0, color: isActive ? "#60a5fa" : "#64748b" }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && <ChevronRight size={14} style={{ color: "#60a5fa", opacity: 0.5 }} />}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div style={{ padding: 12, borderTop: "1px solid #1e293b" }}>
        <div
          style={{
            padding: 12, borderRadius: 12, marginBottom: 8,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(30,41,59,0.5)", border: "1px solid #1e293b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}
            >
              {user ? getInitials(user.name) : <UserCheck size={16} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user ? user.name : "Dr. On Duty"}
              </p>
              <p style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.clinicName || "Clinic Portal"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, padding: "8px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600,
            color: "#f87171", background: "transparent",
            border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer",
            transition: "all 0.2s", opacity: loggingOut ? 0.7 : 1,
          }}
        >
          <LogOut size={14} />
          {loggingOut ? "Logging out..." : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
