import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Activity, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/verification/verify", { email, code });
      if (res.data.success) {
        toast.success("Email verified! You can now sign in.");
        navigate(`/login?registered=true&email=${encodeURIComponent(res.data.email || email)}`);
      } else {
        toast.error(res.data.error || "Invalid or expired code.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) { toast.error("Please enter your email address first."); return; }
    setResending(true);
    try {
      await api.post("/verification/resend", { email });
      toast.success("Verification code resent! Check your inbox.");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#0f172a" }}>
      <div className="animate-fade-in" style={{ width: "100%", maxWidth: 440, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, marginBottom: 24, background: "linear-gradient(135deg, #2563eb, #4f46e5)", boxShadow: "0 8px 25px rgba(37,99,235,0.35)" }}>
          <Activity size={28} color="white" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>Verify Your Email</h1>
        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 24 }}>Enter the 6-digit code sent to your inbox</p>

        <div style={{ padding: 32, borderRadius: 24, background: "rgba(15,23,42,0.75)", border: "1px solid rgba(51,65,85,0.6)", backdropFilter: "blur(20px)", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)" }}>
          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#cbd5e1", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 6 }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="doctor@clinic.com"
                  style={{ width: "100%", padding: "12px 16px 12px 42px", borderRadius: 12, background: "rgba(15,23,42,0.8)", border: "1px solid #1e293b", color: "#f1f5f9", fontSize: 14, outline: "none", fontFamily: "inherit" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#cbd5e1", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 6 }}>6-Digit Verification Code</label>
              <input
                type="text" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required placeholder="••••••"
                style={{ width: "100%", padding: "16px", borderRadius: 12, background: "rgba(15,23,42,0.8)", border: "1px solid #1e293b", color: "#f1f5f9", fontSize: 24, fontWeight: 700, letterSpacing: "0.4em", outline: "none", fontFamily: "monospace", textAlign: "center" }}
              />
            </div>

            <button type="submit" disabled={loading || code.length < 6} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "linear-gradient(135deg, #2563eb, #4f46e5)", border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: (loading || code.length < 6) ? "not-allowed" : "pointer", opacity: (loading || code.length < 6) ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(37,99,235,0.4)" }}>
              {loading ? <div style={{ width: 20, height: 20, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <><span>Verify Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #1e293b", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "#64748b" }}>
              Didn't receive the code?{" "}
              <button onClick={handleResend} disabled={resending} style={{ background: "none", border: "none", fontWeight: 600, color: "#60a5fa", cursor: resending ? "not-allowed" : "pointer", opacity: resending ? 0.7 : 1, fontSize: 12 }}>
                {resending ? "Sending..." : "Resend Code"}
              </button>
            </p>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
              <Link to="/login" style={{ color: "#60a5fa", fontWeight: 500 }}>← Back to Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
