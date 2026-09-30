import { Suspense, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Activity, Mail, Lock, ArrowRight, Sparkles, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api, { BACKEND_URL } from "../lib/api";
import { useAuth } from "../context/AuthContext";

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
      const msg = data?.error || "Invalid credentials";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px 12px 42px",
    borderRadius: 12, background: "rgba(15,23,42,0.8)",
    border: "1px solid #1e293b", color: "#f1f5f9",
    fontSize: 14, outline: "none", fontFamily: "inherit",
  };

  return (
    <div className="animate-fade-in" style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 10 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 56, height: 56, borderRadius: 16, marginBottom: 16,
          background: "linear-gradient(135deg, #2563eb, #4f46e5)",
          boxShadow: "0 8px 25px rgba(37,99,235,0.35)", border: "1px solid rgba(99,102,241,0.4)",
        }}>
          <Activity size={28} color="white" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.025em" }}>
          Prescript<span style={{ color: "#60a5fa" }}>OCR</span>
        </h1>
        <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
          Sign in to access your clinic's digital prescription archive
        </p>
      </div>

      {isRegistered && (
        <div style={{ marginBottom: 16, padding: 16, borderRadius: 16, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6ee7b7" }}>Email verified! Please enter your password to sign in.</span>
        </div>
      )}

      <div style={{ padding: 32, borderRadius: 24, background: "rgba(15,23,42,0.75)", border: "1px solid rgba(51,65,85,0.6)", backdropFilter: "blur(20px)", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)" }}>
        {/* Google OAuth */}
        <button
          type="button"
          onClick={() => { window.location.href = `${BACKEND_URL}/api/auth/google?from=${encodeURIComponent(from)}`; }}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 12, padding: "12px 16px", borderRadius: 12, background: "#1e293b",
            border: "1px solid #334155", color: "#e2e8f0", fontSize: 14, fontWeight: 600,
            cursor: "pointer", marginBottom: 20, transition: "all 0.2s",
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
          <div style={{ width: "100%", borderTop: "1px solid #1e293b" }} />
          <span style={{ position: "absolute", background: "#0f172a", padding: "0 12px", fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Or with email
          </span>
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: 14, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#fca5a5" }}>{error}</span>
            </div>
            {unverifiedEmail && (
              <Link to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 12, fontWeight: 700, color: "#60a5fa" }}>
                Enter Verification Code →
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="doctor@clinic.com" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
              <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: "100%", marginTop: 8, padding: "14px 16px", borderRadius: 12,
              background: "linear-gradient(135deg, #2563eb, #4f46e5)", border: "none",
              color: "white", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 6px 20px rgba(37,99,235,0.4)", transition: "all 0.2s",
            }}
          >
            {loading ? <div style={{ width: 20, height: 20, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <><span>Sign In to Clinic</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #1e293b", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#64748b" }}>
            New doctor or clinic?{" "}
            <Link to="/signup" style={{ fontWeight: 600, color: "#60a5fa" }}>Create an account</Link>
          </p>
        </div>
      </div>

      <div style={{ marginTop: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#475569" }}>
          <ShieldCheck size={16} color="#34d399" /> Encrypted HIPAA Cloud
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#475569" }}>
          <Sparkles size={16} color="#a78bfa" /> Gemini Vision 2.5
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#0f172a", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -160, left: -160, width: 384, height: 384, borderRadius: "50%", background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", opacity: 0.2, pointerEvents: "none", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", bottom: -160, right: -160, width: 384, height: 384, borderRadius: "50%", background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", opacity: 0.2, pointerEvents: "none", filter: "blur(40px)" }} />
      <LoginForm />
    </div>
  );
}
