import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { registerUser } from "../api";
import { IconUser, IconPhone, IconLock } from "../components/Icons";
import bannerSmall from "../../../assets/Background.png";
import bannerLarge from "../../../assets/PlainBackground.png";

/* ─────────────────────────────────────
   PASSWORD GENERATOR
───────────────────────────────────── */
function genPassword(len = 10) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

const PLATFORMS = ["Zomato", "Swiggy", "Amazon", "Zepto", "Blinkit"];

const PARTNER_LOGOS = [
  { src: "https://brandlogos.net/wp-content/uploads/2025/02/zomato-logo_brandlogos.net_9msh7.png", alt: "Zomato", bg: "#FFF1F0", border: "#fca5a5" },
  { src: "https://cdn.prod.website-files.com/600ee75084e3fe0e5731624c/65b6224b00ab2b9163719086_swiggy-logo.svg", alt: "Swiggy", bg: "#FFF7ED", border: "#fdba74" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", alt: "Amazon", bg: "#FFFBEB", border: "#fcd34d" },
  { src: "https://play-lh.googleusercontent.com/0-sXSA0gnPDKi6EeQQCYPsrDx6DqnHELJJ7wFP8bWCpziL4k5kJf8RnOoupdnOFuDm_n=s256-rw", alt: "Flipkart", bg: "#EFF6FF", border: "#93c5fd" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Zepto_Logo.svg/1280px-Zepto_Logo.svg.png", alt: "Zepto", bg: "#FAF5FF", border: "#c4b5fd" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Dunzo_Logo.svg/960px-Dunzo_Logo.svg.png", alt: "Dunzo", bg: "#F0FDF4", border: "#86efac" },
];

/* ─────────────────────────────────────
   STYLES
───────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .reg-root * { font-family: 'DM Sans', sans-serif; }
  .reg-root h1, .reg-root h2, .reg-root h3 { font-family: 'Sora', sans-serif; }

  /* card entrance */
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(22px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  .reg-card { animation: cardIn 0.55s cubic-bezier(.22,.68,0,1.2) both; }

  /* mobile banner entrance */
  @keyframes bannerIn {
    from { opacity: 0; transform: scale(1.04); }
    to   { opacity: 1; transform: scale(1);    }
  }
  .mob-banner { animation: bannerIn 0.7s ease both; }

  /* input */
  .reg-input {
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
  .reg-input:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22,163,74,0.13);
    background: #fff;
  }
  .reg-input::placeholder { color: #94a3b8; }

  /* submit button */
  .reg-btn {
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
  .reg-btn:hover  { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,163,74,0.4); }
  .reg-btn:active { transform: translateY(0); }
  .reg-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .reg-btn::after {
    content: '';
    position: absolute; top: 0; left: -80%;
    width: 50%; height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.28), transparent);
    transform: skewX(-20deg);
  }
  .reg-btn:hover::after { animation: btnShine 0.55s ease forwards; }
  @keyframes btnShine { to { left: 130%; } }

  /* platform chips */
  .p-chip {
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 9px 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    text-align: center;
    background: #f8fafc;
    color: #64748b;
    transition: all 0.18s ease;
    user-select: none;
    white-space: nowrap;
  }
  .p-chip:hover  { border-color: #86efac; background: #f0fdf4; color: #16a34a; }
  .p-chip.active {
    border-color: #16a34a;
    background: linear-gradient(135deg, #dcfce7, #f0fdf4);
    color: #15803d;
    box-shadow: 0 2px 8px rgba(22,163,74,0.2);
  }

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
   FORM BODY  (shared mobile + desktop)
───────────────────────────────────── */
function FormBody({ form, setForm, loading, error, submit }) {
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const togglePlatform = (p) => setForm((f) => ({ ...f, platform: f.platform === p ? "" : p }));

  return (
    <div className="space-y-4">

      {/* Name */}
      <div style={{ position: "relative" }}>
        <FieldIcon><IconUser /></FieldIcon>
        <input
          className="reg-input"
          placeholder="Full Name"
          value={form.name}
          onChange={set("name")}
        />
      </div>

      {/* Phone */}
      <div style={{ position: "relative" }}>
        <FieldIcon><IconPhone /></FieldIcon>
        <input
          className="reg-input"
          placeholder="Phone Number"
          type="tel"
          value={form.phone}
          onChange={set("phone")}
        />
      </div>

      {/* Platform chips */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
          Your Delivery Platform
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePlatform(p)}
              className={`p-chip ${form.platform === p ? "active" : ""}`}
            >
              {p}
            </button>
          ))}
        </div>
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
      <button className="reg-btn" onClick={submit} disabled={loading}>
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Creating account…
          </span>
        ) : "Sign Up Free →"}
      </button>

      {/* Login link */}
      <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", paddingTop: 4 }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#16a34a", fontWeight: 700, textDecoration: "none" }}>
          Log in
        </Link>
      </p>

      {/* Trust pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", paddingTop: 8 }}>
        {["No paperwork", "Instant payout", "AI-protected"].map((b) => (
          <span key={b} className="trust-pill">
            <span className="trust-dot" /> {b}
          </span>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────── */
export default function Register() {
  const [form, setForm] = useState({ name: "", phone: "", password: "", platform: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) payload.password = genPassword(10);
      const res = await registerUser(payload);
      if (res?.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.id);
        localStorage.setItem("userName", form.name || "");
        navigate("/dashboard");
      } else {
        setError(res?.error || "Unexpected response from server");
      }
    } catch (e) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const formProps = { form, setForm, loading, error, submit };

  return (
    <div className="reg-root" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <style>{STYLES}</style>
      <Navbar />

      {/* ══════════════════════════════════════════
          MOBILE  ( < lg )
          ── banner image on top, form below
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
          {/* overlay: transparent top so banner shows, fades to white at bottom */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.22) 45%, rgba(248,250,252,0.96) 100%)",
          }} />

          {/* centered text block */}
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
              Protect your Gig Income
            </h1>
          </div>
        </div>

        {/* FORM SECTION — overlaps banner bottom for smooth transition */}
        <div style={{ padding: "0 16px 48px", marginTop: -32, position: "relative", zIndex: 10 }}>
          <div
            className="reg-card"
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
                Create Account
              </h2>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                Start protecting your income — free to join.
              </p>

              <FormBody {...formProps} />
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
        {/* directional overlay — opaque left, transparent right */}
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
                Secure your<br />
                <span style={{ color: "#16a34a" }}>Gig Income</span><br />
                in seconds.
              </h1>
              <p style={{ marginTop: 14, fontSize: 15, color: "#64748b", lineHeight: 1.7, maxWidth: 360 }}>
                Join thousands of delivery workers who protect their earnings from
                rain, floods, pollution, and curfews — automatically.
              </p>
            </div>

            {/* feature bullets */}
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { icon: "🛡️", text: "AI detects disruptions automatically" },
                { icon: "⚡", text: "Claims processed without any paperwork" },
                { icon: "💳", text: "Instant payout straight to your wallet" },
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
          <div className="reg-card" style={{ marginLeft: "auto", width: "100%", maxWidth: 440 }}>
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
                  Create Account
                </h2>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28 }}>
                  Start protecting your income today — free to join.
                </p>

                <FormBody {...formProps} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}