import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "../components/DashboardCard";
import NotificationCard from "../components/NotificationCard";
import ClaimCard from "../components/ClaimCard";
import { IconBell, IconChat, IconCard, IconShield, IconMoney } from "../components/Icons";

import swiggyBanner from "../../../assets/swiggybanner.png";
import amazonBanner from "../../../assets/amazon-banner.png";
import flipkartBanner from "../../../assets/flipkart-banner.png";
import zeptoBanner from "../../../assets/zepto-banner.png";
import dunzoBanner from "../../../assets/dunzo-banner.png";
import zomatoBanner from "../../../assets/zomatobanner.png";

const partnerThemes = {
  Zomato: { gradient: "linear-gradient(135deg,#ff4d4d,#ff8566)", light: "#fff1f0", accent: "#ff4d4d", banner: zomatoBanner },
  Swiggy: { gradient: "linear-gradient(135deg,#fc8019,#ffb347)", light: "#fff7ed", accent: "#fc8019", banner: swiggyBanner },
  Amazon: { gradient: "linear-gradient(135deg,#f59e0b,#fcd34d)", light: "#fffbeb", accent: "#f59e0b", banner: amazonBanner },
  Flipkart: { gradient: "linear-gradient(135deg,#2874f0,#60a5fa)", light: "#eff6ff", accent: "#2874f0", banner: flipkartBanner },
  Zepto: { gradient: "linear-gradient(135deg,#7c3aed,#a78bfa)", light: "#faf5ff", accent: "#7c3aed", banner: zeptoBanner },
  Dunzo: { gradient: "linear-gradient(135deg,#16a34a,#4ade80)", light: "#f0fdf4", accent: "#16a34a", banner: dunzoBanner },
};

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

  .dash-banner  { animation: bannerIn 0.7s ease both; }
  .dash-card    { animation: scaleIn 0.55s cubic-bezier(.22,.68,0,1.2) 0.15s both; }
  .dash-section { animation: fadeUp 0.5s ease 0.2s both; }

  .banner-content { bottom: 110px; }
  @media (max-width: 640px) { .banner-content { bottom: 75px; } }

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
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    plan: { name: "Standard", premium: 40, coverage: 600, risk: "Moderate" },
    notifications: [
      { title: "Heavy rain detected in your zone", desc: "System initiated claim process", time: "10m ago" },
      { title: "₹600 payout processed", desc: "Your recent claim was approved", time: "2d ago" },
      { title: "Weekly premium due", desc: "Payment reminder for this week", time: "1d ago" }
    ],
    claims: [
      { title: "Heavy Rain Detected", amount: 600, status: "Processing" },
      { title: "Claim Approved", amount: 600, status: "Approved" }
    ],
    chats: 3,
    lastLogin: "2 hours ago"
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch user data
    import('../api').then(({ getCurrentUser }) => {
      getCurrentUser().then(res => {
        if (res) {
          setUser(res);
          localStorage.setItem("userName", res.name);
        }
      }).catch(() => navigate("/login"));
    });

    // In a real app, fetch dashboard data from API
    // For now, using mock data
  }, [navigate]);

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const theme = partnerThemes[user.platform] || defaultTheme;
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <DashboardCard
              title="Active Plan"
              value={dashboardData.plan.name}
              small={`₹${dashboardData.plan.premium}/week · ₹${dashboardData.plan.coverage} coverage`}
            />
            <DashboardCard
              title="Weekly Premium"
              value={`₹${dashboardData.plan.premium}`}
            />
            <DashboardCard
              title="Coverage Amount"
              value={`₹${dashboardData.plan.coverage}`}
            />
            <DashboardCard
              title="Risk Level"
              value={dashboardData.plan.risk}
              small="Weather sensitive"
            />
          </div>
        </div>

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
                    {dashboardData.notifications.map((notif, index) => (
                      <NotificationCard
                        key={index}
                        title={notif.title}
                        desc={notif.desc}
                        time={notif.time}
                      />
                    ))}
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