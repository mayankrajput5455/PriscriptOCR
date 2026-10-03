import { Suspense, useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api, { BACKEND_URL } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/common/Logo";
import { ThemeToggle } from "../components/common/ThemeToggle";

function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";
  const defaultEmail = searchParams.get("email") || "";
  const isRegistered = searchParams.get("registered") === "true";

  const { refresh } = useAuth();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      setError(oauthError);
      toast.error(oauthError);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail("");
    setLoading(true);

    try {
      await api.post("/auth/login", { email, password });
      await refresh();
      toast.success("Welcome back, Doctor!");
      navigate(from);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.unverified && data?.email) setUnverifiedEmail(data.email);
      const msg = data?.error || "Invalid login credentials";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 16px 11px 40px",
    borderRadius: 6,
    background: "var(--input-bg)",
    border: "1px solid var(--border-input)",
    color: "var(--text-primary)",
    fontSize: 13.5,
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div className="animate-fade-in" style={{ width: "100%", maxWidth: 420 }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-block", marginBottom: 12 }}>
          <Logo size="lg" to="/" subtitle="Physician Portal" />
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          Sign in to access your clinic's digitized prescription dossiers
        </p>
      </div>

      {isRegistered && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 6, background: "rgba(22, 163, 74, 0.12)", border: "1px solid rgba(22, 163, 74, 0.3)", display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={16} color="#16a34a" />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#22c55e" }}>Email confirmed. Enter your password to sign in.</span>
        </div>
      )}

      <div
        className="clinical-card"
        style={{
          padding: "32px 28px",
          borderTop: "4px solid var(--accent-primary)",
        }}
      >
        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => {
            window.location.href = `${BACKEND_URL}/api/auth/google?from=${encodeURIComponent(from)}`;
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "10px 16px",
            borderRadius: 6,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            color: "var(--text-primary)",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 20,
            boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
            transition: "all 0.15s ease",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ width: "100%", borderTop: "1px solid var(--border-color)" }} />
          <span style={{ position: "absolute", background: "var(--bg-surface)", padding: "0 10px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Or with clinic credentials
          </span>
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: "10px 14px", borderRadius: 6, background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", fontSize: 12.5, color: "#f87171" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Physician Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.org"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Secret Passcode
              </label>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{ ...inputStyle, paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 6,
              padding: "11px 16px",
              borderRadius: 6,
              background: "var(--accent-primary)",
              border: "none",
              color: "white",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 2px 6px rgba(15,118,110,0.25)",
            }}
          >
            {loading ? "Authenticating..." : <><span>Access Clinical Console</span><ArrowRight size={15} /></>}
          </button>
        </form>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border-subtle)", textAlign: "center" }}>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
            New medical practitioner?{" "}
            <Link to="/signup" style={{ fontWeight: 700, color: "var(--accent-primary)" }}>Register clinic chart</Link>
          </p>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
          <ShieldCheck size={14} color="var(--accent-primary)" /> AUDITED CLINICAL REPOSITORY
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "var(--bg-canvas)", position: "relative" }}>
      <div style={{ position: "absolute", top: 20, right: 24 }}>
        <ThemeToggle size="sm" />
      </div>
      <LoginForm />
    </div>
  );
}
