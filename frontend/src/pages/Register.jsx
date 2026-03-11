import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { registerUser, getPartners } from "../api";
import { IconUser, IconPhone, IconLock } from "../components/Icons";
import bannerSmall from "../../../assets/Background.png";
import bannerLarge from "../../../assets/PlainBackground.png";

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .reg-root * { font-family: 'DM Sans', sans-serif; }
  .reg-root h1, .reg-root h2, .reg-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(22px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .reg-card { animation: cardIn 0.55s cubic-bezier(.22,.68,0,1.2) both; }

  @keyframes bannerIn {
    from { opacity: 0; transform: scale(1.04); }
    to   { opacity: 1; transform: scale(1); }
  }
  .mob-banner { animation: bannerIn 0.7s ease both; }

  .reg-input {
    width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px;
    padding: 11px 14px 11px 44px; font-size: 14px; background: #f8fafc;
    color: #0f172a; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    -webkit-appearance: none; appearance: none; box-sizing: border-box;
  }
  .reg-input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.13); background: #fff; }
  .reg-input::placeholder { color: #94a3b8; }

  .reg-input-password {
    width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px;
    padding: 11px 44px 11px 44px; font-size: 14px; background: #f8fafc;
    color: #0f172a; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    -webkit-appearance: none; appearance: none; box-sizing: border-box;
  }
  .reg-input-password:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.13); background: #fff; }
  .reg-input-password::placeholder { color: #94a3b8; }

  .reg-btn {
    position: relative; overflow: hidden; width: 100%; padding: 12px; border-radius: 12px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 15px;
    color: #fff; background: linear-gradient(135deg, #16a34a, #22c55e);
    border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(22,163,74,0.3); letter-spacing: 0.01em;
  }
  .reg-btn:hover  { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,163,74,0.4); }
  .reg-btn:active { transform: translateY(0); }
  .reg-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .reg-btn::after {
    content: ''; position: absolute; top: 0; left: -80%;
    width: 50%; height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.28), transparent);
    transform: skewX(-20deg);
  }
  .reg-btn:hover::after { animation: btnShine 0.55s ease forwards; }
  @keyframes btnShine { to { left: 130%; } }

  .p-chip {
    border: 1.5px solid #e2e8f0; border-radius: 10px;
    padding: 7px 6px; font-size: 12px; font-weight: 600;
    cursor: pointer; text-align: center; background: #f8fafc;
    color: #64748b; transition: all 0.18s ease; user-select: none; white-space: nowrap;
  }
  .p-chip:hover  { border-color: #86efac; background: #f0fdf4; color: #16a34a; }
  .p-chip.active {
    border-color: #16a34a;
    background: linear-gradient(135deg, #dcfce7, #f0fdf4);
    color: #15803d; box-shadow: 0 2px 8px rgba(22,163,74,0.2);
  }

  .trust-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; color: #64748b;
    background: #f1f5f9; border-radius: 20px; padding: 5px 10px;
  }
  .trust-dot { width:6px; height:6px; border-radius:50%; background:#22c55e; display:inline-block; flex-shrink:0; }

  @keyframes lineGrow { from { transform:scaleY(0); opacity:0; } to { transform:scaleY(1); opacity:1; } }
  .acc-line { transform-origin:top; animation: lineGrow 1s ease both; }

  .feat-li { transition: background 0.2s, transform 0.2s; border-radius: 10px; padding: 6px 8px; }
  .feat-li:hover { background: rgba(255,255,255,0.55); transform: translateX(4px); }

  @keyframes spin { to { transform: rotate(360deg); } }
  .pw-bar { height: 3px; border-radius: 99px; transition: width 0.3s, background 0.3s; }

  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .logo-track {
    display: flex; gap: 10px;
    animation: ticker 14s linear infinite;
    width: max-content;
  }
  .logo-track:hover { animation-play-state: paused; }
  .logo-scroll-wrap {
    width: 240px;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%);
    mask-image: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%);
  }
`;

function FieldIcon({ children }) {
  return (
    <span style={{
      position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
      color: "#94a3b8", display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 1,
    }}>
      {children}
    </span>
  );
}

function LogoScroller({ partners }) {
  if (!partners || partners.length === 0) return null;
  const doubled = [...partners, ...partners];
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
        Supported Platforms
      </p>
      <div className="logo-scroll-wrap">
        <div className="logo-track">
          {doubled.map((p, i) => (
            <div key={i} title={p.name} style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              backgroundColor: p.bgColor, borderColor: p.borderColor, borderStyle: "solid", borderWidth: "1.5px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <img src={p.logoUrl} alt={p.name} style={{ maxWidth: 26, maxHeight: 20, objectFit: "contain" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function pwStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "#e2e8f0" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too short", color: "#ef4444" },
    { label: "Weak",      color: "#f97316" },
    { label: "Fair",      color: "#eab308" },
    { label: "Good",      color: "#22c55e" },
    { label: "Strong",    color: "#16a34a" },
  ];
  return { score, ...map[score] };
}

function FormBody({ form, setForm, loading, error, submit, partners }) {
  const [showPw, setShowPw] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const togglePlatform = (p) => setForm((f) => ({ ...f, platform: f.platform === p ? "" : p }));
  const strength = pwStrength(form.password);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      <div style={{ position: "relative" }}>
        <FieldIcon><IconUser /></FieldIcon>
        <input className="reg-input" placeholder="Full Name" value={form.name} onChange={set("name")} />
      </div>

      <div style={{ position: "relative" }}>
        <FieldIcon><IconMail /></FieldIcon>
        <input className="reg-input" placeholder="Email Address" type="email" value={form.email} onChange={set("email")} />
      </div>

      <div style={{ position: "relative" }}>
        <FieldIcon><IconPhone /></FieldIcon>
        <input className="reg-input" placeholder="Phone Number" type="tel" value={form.phone} onChange={set("phone")} />
      </div>

      <div>
        <div style={{ position: "relative" }}>
          <FieldIcon><IconLock /></FieldIcon>
          <input
            className="reg-input-password"
            placeholder="Password"
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={set("password")}
          />
          <button type="button" onClick={() => setShowPw((v) => !v)}
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex", alignItems: "center" }}
            tabIndex={-1}>
            {showPw ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        {form.password && (
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, background: "#e2e8f0", borderRadius: 99, height: 3, overflow: "hidden" }}>
              <div className="pw-bar" style={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: strength.color, minWidth: 52 }}>{strength.label}</span>
          </div>
        )}
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          Your Delivery Platform
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(75px, 1fr))", gap: 8 }}>
          {partners.map((p) => (
            <button key={p.name} type="button" onClick={() => togglePlatform(p.name)} className={`p-chip ${form.platform === p.name ? "active" : ""}`}>
              {p.name}
            </button>
          ))}
        </div>
        {!form.platform && (
          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 5 }}>Select the platform you work on</p>
        )}
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "10px 14px", color: "#dc2626", fontSize: 13, fontWeight: 500 }}>
          <span>⚠️</span> {error}
        </div>
      )}

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

      <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", paddingTop: 2 }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#16a34a", fontWeight: 700, textDecoration: "none" }}>Log in</Link>
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", paddingTop: 4 }}>
        {["No paperwork", "Instant payout", "AI-protected"].map((b) => (
          <span key={b} className="trust-pill"><span className="trust-dot" /> {b}</span>
        ))}
      </div>
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", platform: "" });
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getPartners().then(res => {
      if (!res.error && Array.isArray(res)) setPartners(res);
    }).catch(console.error);
  }, []);

  const validate = () => {
    if (!form.name.trim())        return "Full name is required.";
    if (!form.email.trim())       return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address.";
    if (!form.phone.trim())       return "Phone number is required.";
    if (!form.password)           return "Password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (!form.platform)           return "Please select your delivery platform.";
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await registerUser({
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        phone:    form.phone.trim(),
        password: form.password,
        platform: form.platform,
      });
      if (res?.token) {
        localStorage.setItem("token",    res.token);
        localStorage.setItem("userId",   res.id);
        localStorage.setItem("userName", form.name.trim());
        navigate("/dashboard");
      } else {
        setError(res?.error || "Unexpected response from server.");
      }
    } catch (e) {
      setError(e.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formProps = { form, setForm, loading, error, submit, partners };

  return (
    <div className="reg-root" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <style>{STYLES}</style>
      <Navbar />

      <div className="lg:hidden">
        <div className="mob-banner w-full" style={{ backgroundImage: `url(${bannerSmall})`, backgroundSize: "cover", backgroundPosition: "center", height: "clamp(260px, 62vw, 360px)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.22) 45%, rgba(248,250,252,0.96) 100%)" }} />
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 28px", marginBottom: 48 }}>
            <span style={{ display: "inline-block", background: "rgba(22,163,74,0.90)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 20, marginBottom: 10, boxShadow: "0 2px 12px rgba(22,163,74,0.4)" }}>AI-Powered Insurance</span>
            <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(22px, 6.5vw, 32px)", fontWeight: 800, color: "#fff", lineHeight: 1.25, textShadow: "0 2px 16px rgba(0,0,0,0.45)", margin: 0 }}>Protect your Gig Income</h1>
          </div>
        </div>

        <div style={{ padding: "0 16px 48px", marginTop: -32, position: "relative", zIndex: 10 }}>
          <div className="reg-card" style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 40px rgba(15,23,42,0.12)", overflow: "hidden" }}>
            <div style={{ height: 4, background: "linear-gradient(90deg,#16a34a,#22c55e,#86efac)" }} />
            <div style={{ padding: "24px 20px 28px" }}>
              <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Create Account</h2>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Start protecting your income — free to join.</p>
              <FormBody {...formProps} />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center justify-center" style={{ backgroundImage: `url(${bannerLarge})`, backgroundSize: "cover", backgroundPosition: "center right", minHeight: "calc(100vh - 64px)", padding: "28px 24px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(248,250,252,0.94) 0%, rgba(248,250,252,0.80) 42%, rgba(248,250,252,0.10) 100%)" }} />

        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 1040, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: -4 }}>
              <div className="acc-line" style={{ width: 4, height: 48, borderRadius: 99, background: "#16a34a", animationDelay: "0.1s" }} />
              <div className="acc-line" style={{ width: 4, height: 30, borderRadius: 99, background: "#86efac", alignSelf: "flex-end", animationDelay: "0.25s" }} />
            </div>

            <div>
              <span style={{ display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 20, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", marginBottom: 12 }}>AI-Powered Insurance</span>
              <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(26px, 2.6vw, 38px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.15 }}>
                Secure your<br /><span style={{ color: "#16a34a" }}>Gig Income</span><br />in seconds.
              </h1>
              <p style={{ marginTop: 10, fontSize: 14, color: "#64748b", lineHeight: 1.65, maxWidth: 340 }}>
                Join thousands of delivery workers who protect their earnings from rain, floods, pollution, and curfews — automatically.
              </p>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { icon: "🛡️", text: "AI detects disruptions automatically" },
                { icon: "⚡", text: "Claims processed without any paperwork" },
                { icon: "💳", text: "Instant payout straight to your wallet" },
              ].map((item) => (
                <li key={item.text} className="feat-li" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 9, background: "#f0fdf4", border: "1px solid #dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{item.text}</span>
                </li>
              ))}
            </ul>

            <LogoScroller partners={partners} />
          </div>

          <div className="reg-card" style={{ marginLeft: "auto", width: "100%", maxWidth: 420 }}>
            <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(15,23,42,0.13), 0 4px 16px rgba(22,163,74,0.08)" }}>
              <div style={{ height: 4, background: "linear-gradient(90deg,#16a34a,#22c55e,#86efac)" }} />
              <div style={{ padding: "24px 28px 28px" }}>
                <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Create Account</h2>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 18 }}>Start protecting your income today — free to join.</p>
                <FormBody {...formProps} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}