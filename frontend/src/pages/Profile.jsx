import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";



const defaultTheme = { gradient: "linear-gradient(135deg,#16a34a,#4ade80)", light: "#f0fdf4", accent: "#16a34a", logo: null, banner: null };

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" /><circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}
function IconBriefcase() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .prof-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .prof-root h1, .prof-root h2, .prof-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes bannerIn {
    from { opacity: 0; transform: scale(1.04); }
    to   { opacity: 1; transform: scale(1); }
  }

  .prof-banner  { animation: bannerIn 0.7s ease both; }
  .prof-card    { animation: scaleIn 0.55s cubic-bezier(.22,.68,0,1.2) 0.15s both; }
  .prof-section { animation: fadeUp 0.5s ease 0.2s both; }

  .prof-input {
    width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px;
    padding: 11px 14px 11px 44px; font-size: 14px; background: #f8fafc;
    color: #0f172a; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    appearance: none;
  }
  .prof-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
    background: #fff;
  }
  .prof-input:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
  .prof-input::placeholder { color: #94a3b8; }

  .info-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: 14px;
    background: #f8fafc; border: 1.5px solid #f1f5f9;
    transition: background 0.2s, transform 0.2s, border-color 0.2s;
  }
  .info-row:hover {
    background: #fff; border-color: #e2e8f0;
    transform: translateX(4px); box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }

  .p-chip {
    border: 1.5px solid #e2e8f0; border-radius: 10px;
    padding: 8px 6px; font-size: 12px; font-weight: 600;
    cursor: pointer; text-align: center; background: #f8fafc;
    color: #64748b; transition: all 0.18s ease; user-select: none;
  }
  .p-chip:hover { border-color: #86efac; background: #f0fdf4; color: #16a34a; }
  .p-chip.active {
    border-color: var(--accent); background: var(--accent-light); color: var(--accent);
    box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .edit-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: 12px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 14px;
    color: #fff; border: none; cursor: pointer;
    background: var(--gradient);
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 16px color-mix(in srgb, var(--accent) 30%, transparent);
  }
  .edit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 40%, transparent); }
  .edit-btn:active { transform: translateY(0); }

  .save-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: 12px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 14px;
    color: #fff; border: none; cursor: pointer;
    background: var(--gradient); transition: transform 0.2s, box-shadow 0.2s;
  }
  .save-btn:hover { transform: translateY(-2px); }

  .cancel-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: 12px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 14px;
    color: #64748b; border: 1.5px solid #e2e8f0; cursor: pointer;
    background: #fff; transition: all 0.2s;
  }
  .cancel-btn:hover { background: #f8fafc; border-color: #cbd5e1; }

  .toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    color: #fff; padding: 12px 24px; border-radius: 14px;
    font-size: 13px; font-weight: 600; z-index: 9999;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    animation: fadeUp 0.4s ease both;
    display: flex; align-items: center; gap: 8px;
  }

  .banner-content { bottom: 110px; }
@media (max-width: 640px) { .banner-content { bottom: 75px; } }

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

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", platform: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [themeDict, setThemeDict] = useState({});
  const [partners, setPartners] = useState([]);

  const showToast = (msg, success = true) => {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    
    api.getPartners().then(res => {
      if (!res.error && Array.isArray(res)) {
        setPartners(res);
        const d = {};
        res.forEach(p => {
          d[p.name] = {
            gradient: `linear-gradient(135deg, ${p.borderColor}, ${p.borderColor}bb)`,
            light: p.bgColor,
            accent: p.borderColor,
            logo: p.logoUrl,
            banner: p.profileBannerUrl || null 
          };
        });
        setThemeDict(d);
      }
    }).catch(() => {});

    api.getCurrentUser()
      .then((u) => {
        setUser(u);
        setForm({ name: u.name || "", phone: u.phone || "", platform: u.platform || "" });
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateUser(form);
      const updated = { id: res.id, name: res.name, email: res.email, phone: res.phone, platform: res.platform };
      setUser(updated);
      localStorage.setItem("userName", updated.name);
      setEditing(false);
      showToast("Profile updated successfully ✓", true);
    } catch {
      showToast("Failed to update profile", false);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const theme = themeDict[user.platform] || defaultTheme;
  const initials = user.name ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div
      className="prof-root"
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        "--accent": theme.accent,
        "--accent-light": theme.light,
        "--gradient": theme.gradient,
      }}
    >
      <style>{STYLES}</style>

      {/* ── BANNER ── */}
      <div
        className="prof-banner"
        style={{
          position: "relative",
          overflow: "hidden",
          height: "clamp(220px, 30vw, 280px)",
          ...(theme.banner
            ? {
              backgroundImage: `url(${theme.banner})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
            : { background: theme.gradient }
          ),
        }}
      >
        {/* dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)",
        }} />

        {/* banner content — bottom left */}
        <div className="banner-content" style={{
          position: "absolute",
          left: 0, right: 0,
          zIndex: 2,
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 28px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 18,
        }}>
          {/* Avatar circle */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(12px)",
            border: "3px solid rgba(255,255,255,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}>
            <span style={{
              fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 24,
              color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}>
              {initials}
            </span>
          </div>

          {/* Name + Gig Worker badge */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "flex-start", gap: 7,
          }}>
            <h1 style={{
              fontFamily: "Sora,sans-serif", fontWeight: 800,
              fontSize: "clamp(20px, 3.5vw, 26px)",
              color: "#ffffff", margin: 0, lineHeight: 1.15,
              textShadow: "0 2px 14px rgba(0,0,0,0.5)",
            }}>
              {user.name}
            </h1>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 20,
              padding: "4px 12px",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#4ade80", display: "inline-block", flexShrink: 0,
              }} />
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}>
                Gig Worker
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── CARD ── */}
      <div style={{ maxWidth: 720, margin: "-32px auto 48px", padding: "0 16px", position: "relative", zIndex: 10 }}>
        <div
          className="prof-card"
          style={{
            background: "#fff", borderRadius: 24, overflow: "hidden",
            boxShadow: "0 20px 60px rgba(15,23,42,0.12), 0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ height: 4, background: theme.gradient }} />

          <div style={{ padding: "28px 28px 32px" }}>

            {editing ? (
              <div className="prof-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: theme.light, display: "flex", alignItems: "center", justifyContent: "center", color: theme.accent }}>
                    <IconEdit />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>Edit Profile</h2>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Update your information below</p>
                  </div>
                </div>

                <div style={{ position: "relative" }}>
                  <FieldIcon><IconUser /></FieldIcon>
                  <input className="prof-input" placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>

                <div style={{ position: "relative" }}>
                  <FieldIcon><IconMail /></FieldIcon>
                  <input className="prof-input" placeholder="Email" value={user.email} disabled />
                </div>

                <div style={{ position: "relative" }}>
                  <FieldIcon><IconPhone /></FieldIcon>
                  <input className="prof-input" placeholder="Phone Number" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>

                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Platform</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(75px, 1fr))", gap: 8 }}>
                    {partners.map(p => (
                      <button key={p.name} type="button" className={`p-chip ${form.platform === p.name ? "active" : ""}`} onClick={() => setForm(f => ({ ...f, platform: p.name }))}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                  <button className="cancel-btn" onClick={() => { setEditing(false); setForm({ name: user.name, phone: user.phone, platform: user.platform }); }}>
                    <IconX /> Cancel
                  </button>
                  <button className="save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg style={{ width: 14, height: 14, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Saving…
                      </span>
                    ) : <><IconCheck /> Save Changes</>}
                  </button>
                </div>
              </div>

            ) : (
              <div className="prof-section">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: "50%",
                      background: theme.gradient,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 4px 16px color-mix(in srgb, ${theme.accent} 30%, transparent)`,
                      flexShrink: 0,
                    }}>
                      <span style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>{initials}</span>
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>{user.name}</h2>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                          background: theme.light, color: theme.accent,
                          border: `1px solid color-mix(in srgb, ${theme.accent} 25%, transparent)`,
                        }}>{user.platform}</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>Gig Worker</span>
                      </div>
                    </div>
                  </div>
                  {theme.logo && (
                    <img src={theme.logo} alt={user.platform} style={{ height: 26, maxWidth: 68, objectFit: "contain", opacity: 0.8 }} />
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {[
                    { icon: <IconMail />, label: "Email", value: user.email },
                    { icon: <IconPhone />, label: "Phone", value: user.phone },
                    { icon: <IconBriefcase />, label: "Platform", value: user.platform, showLogo: true },
                  ].map(row => (
                    <div key={row.label} className="info-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: theme.light, flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: theme.accent,
                        }}>
                          {row.icon}
                        </div>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>{row.label}</p>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0, marginTop: 1 }}>{row.value || "—"}</p>
                        </div>
                      </div>
                      {row.showLogo && theme.logo && (
                        <div style={{ padding: "4px 8px", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                          <img src={theme.logo} alt={row.value} style={{ height: 24, maxWidth: 64, objectFit: "contain" }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button className="edit-btn" onClick={() => setEditing(true)}>
                  <IconEdit /> Edit Profile
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {toast && (
        <div className="toast" style={{ background: toast.success ? "#0f172a" : "#dc2626" }}>
          {toast.success ? "✓" : "⚠️"} {toast.msg}
        </div>
      )}
    </div>
  );
}