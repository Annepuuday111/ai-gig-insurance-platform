import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { loginUser } from "../api";
import { IconUser, IconLock } from "../components/Icons";

import bannerSmall from "../../../assets/Background.png";
import bannerLarge from "../../../assets/PlainBackground.png";

/* ─────────────────────────────────────
   STYLES
───────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .login-root * { font-family: 'DM Sans', sans-serif; }
  .login-root h1, .login-root h2, .login-root h3 { font-family: 'Sora', sans-serif; }

  /* card entrance */
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(22px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  .login-card { animation: cardIn 0.55s cubic-bezier(.22,.68,0,1.2) both; }

  /* mobile banner entrance */
  @keyframes bannerIn {
    from { opacity: 0; transform: scale(1.04); }
    to   { opacity: 1; transform: scale(1);    }
  }
  .mob-banner { animation: bannerIn 0.7s ease both; }

  /* input */
  .login-input {
    width: 100%;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 13px 14px 13px 44px;
    font-size: 14px;
    background: #f8fafc;
    color: #0f172a;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    -webkit-appearance: none;
    appearance: none;
  }
  .login-input:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22,163,74,0.13);
    background: #fff;
  }
  .login-input::placeholder { color: #94a3b8; }

  /* submit button */
  .login-btn {
    position: relative;
    overflow: hidden;
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 15px;
    color: #fff;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    border: none;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(22,163,74,0.3);
    letter-spacing: 0.01em;
  }
  .login-btn:hover  { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,163,74,0.4); }
  .login-btn:active { transform: translateY(0); }
  .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .login-btn::after {
    content: '';
    position: absolute; top: 0; left: -80%;
    width: 50%; height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.28), transparent);
    transform: skewX(-20deg);
  }
  .login-btn:hover::after { animation: btnShine 0.55s ease forwards; }
  @keyframes btnShine { to { left: 130%; } }

  /* trust badges */
  .trust-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; color: #64748b;
    background: #f1f5f9; border-radius: 20px; padding: 5px 10px;
  }
  .trust-dot { width:6px; height:6px; border-radius:50%; background:#22c55e; display:inline-block; flex-shrink:0; }

  /* left panel accent */
  @keyframes lineGrow { from { transform:scaleY(0); opacity:0; } to { transform:scaleY(1); opacity:1; } }
  .acc-line { transform-origin:top; animation: lineGrow 1s ease both; }

  /* feature bullet hover */
  .feat-li { transition: background 0.2s, transform 0.2s; border-radius: 12px; padding: 8px 10px; }
  .feat-li:hover { background: rgba(255,255,255,0.55); transform: translateX(4px); }

  @keyframes spin { to { transform: rotate(360deg); } }
`;

/* ─────────────────────────────────────
   FIELD ICON WRAPPER
───────────────────────────────────── */
function FieldIcon({ children }) {
  return (
    <span style={{
      position: "absolute", left: 14, top: "50%",
      transform: "translateY(-50%)",
      color: "#94a3b8", display: "flex", alignItems: "center",
      pointerEvents: "none", zIndex: 1,
    }}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────
   PARTNER LOGOS (desktop left panel)
───────────────────────────────────── */
const PARTNER_LOGOS = [
  { src: "https://brandlogos.net/wp-content/uploads/2025/02/zomato-logo_brandlogos.net_9msh7.png", alt: "Zomato", bg: "#FFF1F0", border: "#fca5a5" },
  { src: "https://cdn.prod.website-files.com/600ee75084e3fe0e5731624c/65b6224b00ab2b9163719086_swiggy-logo.svg", alt: "Swiggy", bg: "#FFF7ED", border: "#fdba74" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", alt: "Amazon", bg: "#FFFBEB", border: "#fcd34d" },
  { src: "https://play-lh.googleusercontent.com/0-sXSA0gnPDKi6EeQQCYPsrDx6DqnHELJJ7wFP8bWCpziL4k5kJf8RnOoupdnOFuDm_n=s256-rw", alt: "Flipkart", bg: "#EFF6FF", border: "#93c5fd" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Zepto_Logo.svg/1280px-Zepto_Logo.svg.png", alt: "Zepto", bg: "#FAF5FF", border: "#c4b5fd" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Dunzo_Logo.svg/960px-Dunzo_Logo.svg.png", alt: "Dunzo", bg: "#F0FDF4", border: "#86efac" },
];

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function Login() {
  const [form, setForm] = useState({ id: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await loginUser({ identifier: form.id, password: form.password });
      if (res?.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.id);
        localStorage.setItem("userName", res.name || "");
        navigate("/dashboard");
      } else {
        setError(res?.error || "Invalid response from server");
      }
    } catch (e) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  /* handle Enter key */
  const onKey = (e) => { if (e.key === "Enter") submit(); };

  /* ── shared form JSX ── */
  const FormFields = (
    <div className="space-y-4" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Identifier */}
      <div style={{ position: "relative" }}>
        <FieldIcon><IconUser /></FieldIcon>
        <input
          className="login-input"
          placeholder="Email or Phone"
          value={form.id}
          onChange={set("id")}
          onKeyDown={onKey}
          autoComplete="username"
        />
      </div>

      {/* Password */}
      <div style={{ position: "relative" }}>
        <FieldIcon><IconLock /></FieldIcon>
        <input
          className="login-input"
          type={showPwd ? "text" : "password"}
          placeholder="Password"
          value={form.password}
          onChange={set("password")}
          onKeyDown={onKey}
          autoComplete="current-password"
          style={{ paddingRight: 44 }}
        />
        {/* show/hide toggle */}
        <button
          type="button"
          onClick={() => setShowPwd((v) => !v)}
          style={{
            position: "absolute", right: 14, top: "50%",
            transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "#94a3b8", fontSize: 13, padding: 0,
          }}
        >
          {showPwd ? "Hide" : "Show"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#fef2f2", border: "1.5px solid #fecaca",
          borderRadius: 12, padding: "12px 14px",
          color: "#dc2626", fontSize: 13, fontWeight: 500,
        }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Submit */}
      <button className="login-btn" onClick={submit} disabled={loading}>
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Logging in…
          </span>
        ) : "Login →"}
      </button>

      {/* Bottom links */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 2 }}>
        <Link to="/forgot" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}
          onMouseEnter={e => e.target.style.color = "#64748b"}
          onMouseLeave={e => e.target.style.color = "#94a3b8"}>
          Forgot password?
        </Link>
        <Link to="/register" style={{ fontSize: 13, color: "#16a34a", fontWeight: 700, textDecoration: "none" }}
          onMouseEnter={e => e.target.style.color = "#15803d"}
          onMouseLeave={e => e.target.style.color = "#16a34a"}>
          Create account →
        </Link>
      </div>

      {/* Trust pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", paddingTop: 6 }}>
        {["Secure login", "AI-protected", "Instant access"].map((b) => (
          <span key={b} className="trust-pill">
            <span className="trust-dot" /> {b}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="login-root" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <style>{STYLES}</style>
      <Navbar />

      {/* ══════════════════════════════════════════
          MOBILE  ( < lg )
          ── banner image on top, form card below
      ══════════════════════════════════════════ */}
      <div className="lg:hidden">

        {/* TOP BANNER */}
        <div
          className="mob-banner w-full"
          style={{
            backgroundImage: `url(${bannerSmall})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "clamp(260px, 62vw, 360px)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* overlay: dark for text readability, fades to white at bottom */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.22) 45%, rgba(248,250,252,0.96) 100%)",
          }} />

          {/* centered text block, nudged above center */}
          <div style={{
            position: "relative", zIndex: 2,
            textAlign: "center",
            padding: "0 28px",
            marginBottom: 48,
          }}>
            <span style={{
              display: "inline-block",
              background: "rgba(22,163,74,0.90)",
              color: "#fff", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              padding: "5px 14px", borderRadius: 20, marginBottom: 10,
              boxShadow: "0 2px 12px rgba(22,163,74,0.4)",
            }}>
              AI-Powered Insurance
            </span>
            <h1 style={{
              fontFamily: "Sora, sans-serif",
              fontSize: "clamp(22px, 6.5vw, 32px)",
              fontWeight: 800, color: "#fff", lineHeight: 1.25,
              textShadow: "0 2px 16px rgba(0,0,0,0.45)",
              margin: 0,
            }}>
              Welcome back 👋
            </h1>
          </div>
        </div>

        {/* FORM CARD — overlaps banner bottom */}
        <div style={{ padding: "0 16px 48px", marginTop: -32, position: "relative", zIndex: 10 }}>
          <div
            className="login-card"
            style={{
              background: "#fff",
              borderRadius: 24,
              boxShadow: "0 8px 40px rgba(15,23,42,0.12)",
              overflow: "hidden",
            }}
          >
            {/* green top strip */}
            <div style={{ height: 4, background: "linear-gradient(90deg,#16a34a,#22c55e,#86efac)" }} />

            <div style={{ padding: "24px 20px 28px" }}>
              <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
                Login
              </h2>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                Sign in to manage your insurance & claims.
              </p>
              {FormFields}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP  ( lg+ )
          ── full banner bg, left copy + right card
      ══════════════════════════════════════════ */}
      <div
        className="hidden lg:flex items-center justify-center"
        style={{
          backgroundImage: `url(${bannerLarge})`,
          backgroundSize: "cover",
          backgroundPosition: "center right",
          minHeight: "calc(100vh - 64px)",
          padding: "48px 24px",
          position: "relative",
        }}
      >
        {/* directional overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg, rgba(248,250,252,0.94) 0%, rgba(248,250,252,0.80) 42%, rgba(248,250,252,0.10) 100%)",
        }} />

        <div style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: 1040,
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 64, alignItems: "center",
        }}>

          {/* ── LEFT PANEL ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* accent bars */}
            <div style={{ display: "flex", gap: 8, marginBottom: -8 }}>
              <div className="acc-line" style={{ width: 4, height: 64, borderRadius: 99, background: "#16a34a", animationDelay: "0.1s" }} />
              <div className="acc-line" style={{ width: 4, height: 40, borderRadius: 99, background: "#86efac", alignSelf: "flex-end", animationDelay: "0.25s" }} />
            </div>

            {/* badge + headline */}
            <div>
              <span style={{
                display: "inline-block", fontSize: 10, fontWeight: 800,
                letterSpacing: "0.2em", textTransform: "uppercase",
                padding: "5px 12px", borderRadius: 20,
                background: "#dcfce7", color: "#15803d",
                border: "1px solid #bbf7d0", marginBottom: 14,
              }}>
                AI-Powered Insurance
              </span>
              <h1 style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "clamp(32px, 3.2vw, 48px)",
                fontWeight: 800, color: "#0f172a", lineHeight: 1.15,
              }}>
                Welcome<br />
                <span style={{ color: "#16a34a" }}>back.</span>
              </h1>
              <p style={{ marginTop: 14, fontSize: 15, color: "#64748b", lineHeight: 1.7, maxWidth: 360 }}>
                Sign in to check your active plans, view payout history,
                and stay protected from disruptions — automatically.
              </p>
            </div>

            {/* feature bullets */}
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { icon: "🛡️", text: "Your coverage is always active" },
                { icon: "⚡", text: "Auto-claims — no forms needed" },
                { icon: "💳", text: "Check your payout status anytime" },
              ].map((item) => (
                <li key={item.text} className="feat-li" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "#f0fdf4", border: "1px solid #dcfce7",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 17, flexShrink: 0,
                  }}>
                    {item.icon}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>{item.text}</span>
                </li>
              ))}
            </ul>

            {/* partner logos */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
                Supported Platforms
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {PARTNER_LOGOS.map((p) => (
                  <div
                    key={p.alt}
                    title={p.alt}
                    style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: p.bg, border: "1.5px solid #e2e8f0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      transition: "transform 0.2s", cursor: "default",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.12)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  >
                    <img src={p.src} alt={p.alt}
                      style={{ maxWidth: 30, maxHeight: 22, objectFit: "contain" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: FORM CARD ── */}
          <div className="login-card" style={{ marginLeft: "auto", width: "100%", maxWidth: 420 }}>
            <div style={{
              background: "#fff",
              borderRadius: 28,
              overflow: "hidden",
              boxShadow: "0 28px 72px rgba(15,23,42,0.14), 0 4px 18px rgba(22,163,74,0.09)",
            }}>
              {/* top accent strip */}
              <div style={{ height: 5, background: "linear-gradient(90deg,#16a34a,#22c55e,#86efac)" }} />

              <div style={{ padding: "36px 36px 40px" }}>
                <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
                  Login
                </h2>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28 }}>
                  Sign in to manage your insurance & claims.
                </p>
                {FormFields}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}