import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Activity, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import api from "../lib/api";

export default function VerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setErrorMessage("Missing verification token."); return; }
    api.post("/verification/verify", { token }).then((res) => {
      if (res.data.success) {
        setStatus("success");
        setTimeout(() => navigate(`/login?registered=true&email=${encodeURIComponent(res.data.email || email || "")}`), 2000);
      } else {
        setStatus("error");
        setErrorMessage(res.data.error || "Verification failed.");
      }
    }).catch((err) => {
      setStatus("error");
      setErrorMessage(err?.response?.data?.error || "Verification link is invalid or has expired.");
    });
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#0f172a" }}>
      <div className="animate-fade-in" style={{ width: "100%", maxWidth: 440, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, marginBottom: 24, background: "linear-gradient(135deg, #2563eb, #4f46e5)", boxShadow: "0 8px 25px rgba(37,99,235,0.35)" }}>
          <Activity size={28} color="white" />
        </div>
        <div style={{ padding: 32, borderRadius: 24, background: "rgba(15,23,42,0.75)", border: "1px solid rgba(51,65,85,0.6)", backdropFilter: "blur(20px)" }}>
          {status === "loading" && (
            <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, border: "3px solid #3b82f6", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>Verifying your account...</h2>
              <p style={{ fontSize: 12, color: "#64748b" }}>Please wait while we confirm your email address.</p>
            </div>
          )}
          {status === "success" && (
            <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
                <CheckCircle size={32} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Email Verified!</h2>
              <p style={{ fontSize: 12, color: "#64748b" }}>Your account has been activated. Redirecting you to sign in...</p>
              <Link to="/login?registered=true" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16, padding: "10px 24px", borderRadius: 12, background: "#059669", color: "white", fontSize: 12, fontWeight: 700 }}>
                Sign In Now <ArrowRight size={14} />
              </Link>
            </div>
          )}
          {status === "error" && (
            <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171" }}>
                <AlertCircle size={32} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>Verification Failed</h2>
              <p style={{ fontSize: 12, color: "#fca5a5" }}>{errorMessage}</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8 }}>
                <Link to="/verify-email" style={{ padding: "8px 16px", borderRadius: 12, background: "#1e293b", color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>Enter 6-Digit OTP</Link>
                <Link to="/login" style={{ padding: "8px 16px", borderRadius: 12, background: "#2563eb", color: "white", fontSize: 12, fontWeight: 600 }}>Go to Sign In</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
