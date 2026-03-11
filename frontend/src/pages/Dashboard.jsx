import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "../components/DashboardCard";
import NotificationCard from "../components/NotificationCard";
import ClaimCard from "../components/ClaimCard";
import { IconBell, IconChat, IconCard, IconShield, IconMoney } from "../components/Icons";
import { getCurrentUser, getDashboardSummary, getPartners, getMyNotifications } from "../api";

const defaultTheme = { gradient: "linear-gradient(135deg,#16a34a,#4ade80)", light: "#f0fdf4", accent: "#16a34a", banner: null };

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .dash-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .dash-root h1, .dash-root h2, .dash-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes bannerIn {
    from { opacity: 0; transform: scale(1.04); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }

  .dash-banner  { animation: bannerIn 0.7s ease both; }
  .dash-card    { animation: scaleIn 0.55s cubic-bezier(.22,.68,0,1.2) 0.15s both; }
  .dash-section { animation: fadeUp 0.5s ease 0.2s both; }

  .banner-content { bottom: 110px; }
  @media (max-width: 640px) { 
    .banner-content { bottom: 75px; } 
    .dash-banner { --banner-pos: 100% center; }
  }

  .quick-action-btn {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 16px 12px; border-radius: 12px; background: #fff;
    border: 1.5px solid #f1f5f9; cursor: pointer;
    transition: all 0.2s ease; text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .quick-action-btn:hover {
    transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    border-color: var(--accent);
  }
  .quick-action-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: var(--accent-light); color: var(--accent);
  }
  .quick-action-text {
    font-size: 12px; font-weight: 600; color: #374151;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(null);
  const [summary, setSummary]   = useState(null);
  const [loadingSum, setLoadingSum] = useState(true);
  const [themeDict, setThemeDict] = useState({});
  const [partners, setPartners] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dashboardData] = useState({
    notifications: [
      { title: "Heavy rain detected in your zone", desc: "System initiated claim process", time: "10m ago" },
      { title: "₹600 payout processed",            desc: "Your recent claim was approved", time: "2d ago" },
      { title: "Weekly premium due",               desc: "Payment reminder for this week", time: "1d ago" },
    ],
    claims: [
      { title: "Heavy Rain Detected", amount: 600, status: "Processing" },
      { title: "Claim Approved",      amount: 600, status: "Approved" },
    ],
    chats: 3,
    lastLogin: new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true }),
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    // Fetch user profile
    getCurrentUser()
      .then(res => {
        if (res && res.id) {
          setUser(res);
          localStorage.setItem("userName", res.name);
        } else {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"));

    // Fetch real subscription / payment summary
    getDashboardSummary()
      .then(res => {
        if (res && !res.error) setSummary(res);
      })
      .catch(() => {})
      .finally(() => setLoadingSum(false));

    // Fetch Notifications
    getMyNotifications().then(res => {
      if (res && Array.isArray(res)) setNotifications(res.slice(0, 3));
    }).catch(() => {});

    // Fetch partners
    getPartners().then(res => {
      if (!res.error && Array.isArray(res)) {
        setPartners(res);
        const d = {};
        res.forEach(p => {
          d[p.name] = {
            gradient: `linear-gradient(135deg, ${p.borderColor}, ${p.borderColor}bb)`,
            light: p.borderColor ? `${p.borderColor}22` : "#f0fdf4",
            accent: p.borderColor || "#16a34a",
            banner: p.dashboardBannerUrl || null 
          };
        });
        setThemeDict(d);
      }
    }).catch(() => {});
  }, [navigate]);

  // Helper derived values from backend summary
  const activePlan = summary?.activePlan || null;
  const planName   = activePlan?.name          || "No Plan";
  const premium    = activePlan?.weeklyPremium  || 0;
  const cov        = activePlan?.coverageAmount || 0;
  const risk       = activePlan?.riskLevel      || "—";
  const subStatus  = summary?.subscriptionStatus || "NONE";
  const nextPay    = summary?.nextPaymentDate
    ? new Date(summary.nextPaymentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

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
      className="dash-root"
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
        className="dash-banner"
        style={{
          position: "relative",
          overflow: "hidden",
          height: "clamp(220px, 30vw, 280px)",
          ...(theme.banner
            ? {
              backgroundImage: `url(${theme.banner})`,
              backgroundSize: "cover",
              backgroundPosition: "var(--banner-pos, center)",
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
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 12,
        }}>
          {/* Welcome Message */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "flex-start", gap: 4,
          }}>
            <h1 style={{
              fontFamily: "Sora,sans-serif", fontWeight: 800,
              fontSize: "clamp(18px, 3.5vw, 24px)",
              color: "#ffffff", margin: 0, lineHeight: 1.15,
              textShadow: "0 2px 14px rgba(0,0,0,0.5)",
            }}>
              Welcome back, {user.name.split(" ")[0]}!
            </h1>

            <div style={{
              fontSize: 14, fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              textShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}>
              Last login: {dashboardData.lastLogin}
            </div>
          </div>

          {/* Platform Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 20,
            padding: "6px 14px",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#4ade80", display: "inline-block", flexShrink: 0,
            }} />
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}>
              {user.platform} Partner
            </span>
          </div>
        </div>
      </div>

      {/* ── DASHBOARD CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: "-32px auto 48px", padding: "0 16px", position: "relative", zIndex: 10 }}>

        {/* Plan Overview Cards */}
        <div className="dash-section" style={{ marginBottom: 32 }}>
          {loadingSum ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ height: 90, borderRadius: 16, background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "800px 100%", animation: "shimmer 1.4s infinite" }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <DashboardCard
                title="Active Plan"
                value={planName}
                small={planName === "No Plan" ? "No plan yet – buy one!" : `₹${premium}/week · ₹${cov.toLocaleString("en-IN")} coverage`}
              />
              <DashboardCard
                title="Weekly Premium"
                value={premium > 0 ? `₹${premium}` : "—"}
                small={subStatus === "TRIAL" ? "🎁 Free Trial" : subStatus === "ACTIVE" ? "🟢 Active" : subStatus}
              />
              <DashboardCard
                title="Coverage Amount"
                value={cov > 0 ? `₹${cov.toLocaleString("en-IN")}` : "—"}
              />
              <DashboardCard
                title="Next Payment"
                value={nextPay}
                small={risk !== "—" ? `${risk} Risk` : "No active plan"}
              />
              <DashboardCard
                title="Wallet Balance"
                value={`₹${user.walletBalance || 0}`}
                small="Available for payout"
                accent="#6366f1"
              />
            </div>
          )}
        </div>

        {/* Recent Payments from backend */}
        {!loadingSum && summary?.recentPayments?.length > 0 && (
          <div className="dash-section" style={{ marginBottom: 32 }}>
            <div className="dash-card" style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(15,23,42,0.08)" }}>
              <div style={{ padding: "20px 24px" }}>
                <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>💳 Recent Payments</h3>
                {summary.recentPayments.map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>{p.plan} Plan</span>
                      <span style={{ color: "#94a3b8", marginLeft: 8, fontSize: 12 }}>{p.method.replace("_"," ")} · {new Date(p.date).toLocaleDateString("en-IN")}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>{p.amount === 0 ? "Free" : `₹${p.amount}`}</span>
                      <span style={{ padding: "3px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: p.status === "SUCCESS" ? "#dcfce7" : "#fee2e2", color: p.status === "SUCCESS" ? "#16a34a" : "#dc2626" }}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No plan CTA */}
        {!loadingSum && subStatus === "NONE" && (
          <div className="dash-section" style={{ marginBottom: 32 }}>
            <div style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", borderRadius: 20, padding: "32px", textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛡️</div>
              <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 8 }}>You Don't Have a Plan Yet</h3>
              <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 20 }}>Get covered today — start with a 7-day free trial, no payment required.</p>
              <button onClick={() => navigate("/plans")} style={{ background: "#fff", color: "#7c3aed", border: "none", borderRadius: 12, padding: "13px 32px", fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Browse Plans →</button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="dash-section" style={{ marginBottom: 32 }}>
          <h3 style={{
            fontFamily: "Sora,sans-serif", fontSize: 20, fontWeight: 700,
            color: "#0f172a", marginBottom: 16
          }}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <button className="quick-action-btn" onClick={() => navigate("/plans")}>
              <div className="quick-action-icon">
                <IconCard className="w-5 h-5" />
              </div>
              <span className="quick-action-text">Buy Plan</span>
            </button>

            <button className="quick-action-btn" onClick={() => navigate("/claims")}>
              <div className="quick-action-icon">
                <IconShield className="w-5 h-5" />
              </div>
              <span className="quick-action-text">File Claim</span>
            </button>

            <button className="quick-action-btn" onClick={() => navigate("/chat")}>
              <div className="quick-action-icon">
                <IconChat className="w-5 h-5" />
              </div>
              <span className="quick-action-text">Chat Support</span>
            </button>

            <button className="quick-action-btn" onClick={() => navigate("/notifications")}>
              <div className="quick-action-icon">
                <IconBell className="w-5 h-5" />
              </div>
              <span className="quick-action-text">Notifications</span>
            </button>

            <button className="quick-action-btn" onClick={() => navigate("/reports")}>
              <div className="quick-action-icon">
                <IconMoney className="w-5 h-5" />
              </div>
              <span className="quick-action-text">View Reports</span>
            </button>
          </div>
        </div>

        {/* Your Platform */}
        {partners.length > 0 && user?.platform && (
          <div className="dash-section" style={{ marginBottom: 32 }}>
            <div className="dash-card" style={{
              background: "#fff", borderRadius: 16, overflow: "hidden",
              boxShadow: "0 8px 32px rgba(15,23,42,0.08)",
              border: "1.5px solid #f1f5f9",
            }}>
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                      🤝 Your Platform
                    </h3>
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                      You are covered for gigs completed on this platform
                    </p>
                  </div>
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                  gap: 12,
                }}>
                  {partners.filter(p => p.name === user?.platform).map(p => (
                    <div key={p.id} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      background: "#f8fafc", borderRadius: 12, padding: "14px 10px",
                      border: `1.5px solid ${p.borderColor || "#e2e8f0"}`,
                      transition: "all 0.2s ease",
                      boxShadow: `0 0 0 2px ${p.borderColor || "#16a34a"}, 0 4px 12px rgba(0,0,0,0.08)`,
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 10,
                        background: "#fff", border: `1.5px solid ${p.borderColor || "#e2e8f0"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}>
                        <img src={p.logoUrl} alt={p.name}
                          style={{ maxWidth: 34, maxHeight: 28, objectFit: "contain" }}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: "#374151",
                        textAlign: "center", lineHeight: 1.3,
                        width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications + Claims */}
        <div className="dash-section">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div
                className="dash-card"
                style={{
                  background: "#fff", borderRadius: 16, overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(15,23,42,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ padding: "24px 24px 20px" }}>
                  <h3 style={{
                    fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 700,
                    color: "#0f172a", marginBottom: 16
                  }}>
                    Recent Notifications
                  </h3>
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-6">No new notifications</p>
                    ) : (
                      notifications.map((notif, index) => (
                        <NotificationCard
                          key={index}
                          title={notif.title}
                          desc={notif.message}
                          time={new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div
                className="dash-card"
                style={{
                  background: "#fff", borderRadius: 16, overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(15,23,42,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ padding: "24px 24px 20px" }}>
                  <h3 style={{
                    fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 700,
                    color: "#0f172a", marginBottom: 16
                  }}>
                    Claim Status
                  </h3>
                  <div className="space-y-3">
                    {dashboardData.claims.map((claim, index) => (
                      <ClaimCard
                        key={index}
                        title={claim.title}
                        amount={claim.amount}
                        status={claim.status}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}