import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAIDashboard, getAIRisk, checkParametric,
  getAIWeather, getFraudStats, getAllTriggers, getAIPlanRecommendation
} from "../api";

// ── Styles ──────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .ai-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .ai-root h1, .ai-root h2, .ai-root h3, .ai-root h4 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px);} to { opacity:1; transform:translateY(0);} }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:.55; } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes shimmer  { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes ripple   { 0%{transform:scale(1);opacity:.4} 100%{transform:scale(2.2);opacity:0} }

  .ai-fade  { animation: fadeUp .55s ease both; }
  .ai-card  {
    background: #fff; border-radius: 20px;
    border: 1.5px solid #f1f5f9;
    box-shadow: 0 4px 24px rgba(15,23,42,.07);
    overflow: hidden;
    transition: transform .2s, box-shadow .2s;
  }
  .ai-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(15,23,42,.12); }

  .kpi-card {
    background: #fff; border-radius: 16px;
    border: 1.5px solid #f1f5f9;
    padding: 20px 22px;
    box-shadow: 0 2px 12px rgba(15,23,42,.06);
    transition: all .2s ease;
  }
  .kpi-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(15,23,42,.11); }

  .risk-ring {
    width: 120px; height: 120px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    position: relative; flex-shrink: 0;
  }
  .risk-ring-inner {
    width: 84px; height: 84px; background: #fff; border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    z-index: 1;
  }

  .weather-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 20px;
    font-size: 12px; font-weight: 700;
  }

  .trigger-row {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 16px; border-radius: 12px;
    border: 1.5px solid #f1f5f9; background: #fff;
    transition: background .15s;
    margin-bottom: 8px;
  }
  .trigger-row:hover { background: #f8fafc; }

  .fraud-bar-wrap {
    height: 8px; background: #f1f5f9; border-radius: 99px; overflow:hidden;
    flex: 1;
  }
  .fraud-bar-fill { height: 100%; border-radius: 99px; transition: width .8s cubic-bezier(.4,0,.2,1); }

  .plan-rec-card {
    border-radius: 16px; padding: 24px; color: #fff;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    position: relative; overflow: hidden;
  }
  .plan-rec-bg {
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='80' cy='20' r='40' fill='rgba(255,255,255,0.06)'/%3E%3Ccircle cx='20' cy='80' r='30' fill='rgba(255,255,255,0.04)'/%3E%3C/svg%3E") no-repeat center/cover;
  }

  .shimmer-box {
    background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
    background-size: 600px 100%; animation: shimmer 1.4s infinite;
    border-radius: 12px;
  }

  .live-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
    animation: pulse 1.8s ease-in-out infinite; flex-shrink: 0;
  }

  .tab-btn {
    padding: 8px 20px; border-radius: 10px; border: none; cursor: pointer;
    font-family: 'DM Sans',sans-serif; font-size: 13px; font-weight: 600;
    transition: all .18s ease;
  }
  .tab-btn.active { background: #7c3aed; color: #fff; }
  .tab-btn:not(.active) { background: #f1f5f9; color: #64748b; }
  .tab-btn:not(.active):hover { background: #e2e8f0; }

  @media (max-width: 768px) {
    .ai-grid-3 { grid-template-columns: 1fr !important; }
    .ai-grid-2 { grid-template-columns: 1fr !important; }
  }
`;

// ── Severity config ───────────────────────────────────────────────────────────
const SEV_CONFIG = {
  CRITICAL: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444", label: "🔴 Critical" },
  HIGH:     { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b", label: "🟡 High" },
  MODERATE: { bg: "#fef9c3", text: "#713f12", dot: "#eab308", label: "🟡 Moderate" },
  LOW:      { bg: "#dcfce7", text: "#166534", dot: "#22c55e", label: "🟢 Low" },
};

const RISK_COLOR = (score) => {
  if (score >= 0.70) return { ring: "#ef4444", label: "High Risk", emoji: "🔴" };
  if (score >= 0.45) return { ring: "#f59e0b", label: "Moderate Risk", emoji: "🟡" };
  return { ring: "#22c55e", label: "Low Risk", emoji: "🟢" };
};

const WEATHER_EMOJI = {
  "Clear":            "☀️",
  "Partly Cloudy":    "⛅",
  "Overcast":         "☁️",
  "Light Rain":       "🌧️",
  "Heavy Rain":       "⛈️",
  "Thunderstorm":     "🌩️",
  "Cyclone Warning":  "🌀",
  "Extreme Heat":     "🌡️",
  "Dense Fog":        "🌫️",
  "Sandstorm":        "🌪️",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function RiskRing({ score = 0 }) {
  const rc = RISK_COLOR(score);
  const pct = Math.round(score * 100);
  const circumference = 2 * Math.PI * 50;
  const dash = circumference * score;

  return (
    <div className="risk-ring" style={{ background: `${rc.ring}18` }}>
      <svg style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
           width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle cx="60" cy="60" r="50" fill="none"
          stroke={rc.ring} strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round" />
      </svg>
      <div className="risk-ring-inner">
        <span style={{ fontSize: 22, fontWeight: 800, color: rc.ring }}>{pct}%</span>
        <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>RISK</span>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, accent = "#7c3aed", icon }) {
  return (
    <div className="kpi-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</span>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, badge, live }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>{title}</h3>
      {badge && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#f1f5f9", color: "#64748b" }}>{badge}</span>}
      {live && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#22c55e" }}>
          <div className="live-dot" /> LIVE
        </span>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Reports() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState("overview");
  const [loading, setLoading]     = useState(true);
  const [aiDash, setAiDash]       = useState(null);
  const [riskData, setRiskData]   = useState(null);
  const [parametric, setParametric] = useState(null);
  const [weather, setWeather]     = useState(null);
  const [fraudStats, setFraudStats] = useState(null);
  const [triggers, setTriggers]   = useState(null);
  const [planRec, setPlanRec]     = useState(null);
  const [error, setError]         = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      const [dashRes, riskRes, paramRes, fraudRes, triggerRes] = await Promise.allSettled([
        getAIDashboard(),
        getAIRisk(),
        checkParametric(),
        getFraudStats(),
        getAllTriggers(),
      ]);

      if (dashRes.status   === "fulfilled" && !dashRes.value?.error)   setAiDash(dashRes.value);
      if (riskRes.status   === "fulfilled" && !riskRes.value?.error)   setRiskData(riskRes.value);
      if (paramRes.status  === "fulfilled" && !paramRes.value?.error)  setParametric(paramRes.value);
      if (fraudRes.status  === "fulfilled" && !fraudRes.value?.error)  setFraudStats(fraudRes.value);
      if (triggerRes.status=== "fulfilled" && !triggerRes.value?.error) setTriggers(triggerRes.value);

      // Plan recommendation
      const planRes = await getAIPlanRecommendation();
      if (planRes && !planRes.error) setPlanRec(planRes);

    } catch (e) {
      setError("Could not connect to AI service. Make sure the AI model is running on port 8000.");
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: "32px 24px" }}>
        <style>{STYLES}</style>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#7c3aed", animation: "spin .8s linear infinite" }} />
          <span style={{ color: "#94a3b8", fontWeight: 600 }}>AI Engine analyzing your profile…</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
          {[1,2,3,4].map(i => <div key={i} className="shimmer-box" style={{ height: 90 }} />)}
        </div>
        <div className="shimmer-box" style={{ height: 260, marginBottom: 16 }} />
        <div className="shimmer-box" style={{ height: 180 }} />
      </div>
    );
  }

  // ── AI offline warning ─────────────────────────────────────────────────────
  const aiOffline = !aiDash && !riskData;

  const riskScore = riskData?.risk_score ?? aiDash?.ai_summary?.risk_score ?? 0.65;
  const rc        = RISK_COLOR(riskScore);
  const season    = aiDash?.ai_summary?.season ?? riskData?.current_weather?.season ?? "—";
  const wData     = riskData?.current_weather ?? parametric?.weather;
  const wEmoji    = wData ? (WEATHER_EMOJI[wData.condition] ?? "🌡️") : "🌡️";
  const paramAlert= riskData?.parametric_alert ?? parametric?.parametric_check;
  const sevCfg    = SEV_CONFIG[paramAlert?.severity] ?? SEV_CONFIG["LOW"];

  return (
    <div className="ai-root" style={{ minHeight: "100vh", background: "#f8fafc", padding: "32px 24px" }}>
      <style>{STYLES}</style>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="ai-fade" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(22px,3.5vw,30px)", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
              🤖 AI <span style={{ color: "#7c3aed" }}>Risk & Analytics</span>
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              Real-time AI-powered risk assessment, fraud detection & parametric monitoring
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: aiOffline ? "#fee2e2" : "#dcfce7", fontSize: 12, fontWeight: 700, color: aiOffline ? "#991b1b" : "#166534" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: aiOffline ? "#ef4444" : "#22c55e", animation: aiOffline ? "none" : "pulse 2s infinite" }} />
              {aiOffline ? "AI Offline" : "AI Engine Live"}
            </span>
            <button onClick={loadAll} style={{ padding: "6px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#64748b", transition: "all .15s" }}>
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      {/* AI Offline Banner */}
      {aiOffline && (
        <div className="ai-fade" style={{ background: "#fef3c7", border: "1.5px solid #fde68a", borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
          <p style={{ fontWeight: 800, color: "#92400e", margin: "0 0 6px", fontSize: 15 }}>⚠️ AI Service Offline</p>
          <p style={{ color: "#b45309", fontSize: 13, margin: 0 }}>
            Start the AI model with: <code style={{ background: "#fff7ed", padding: "2px 8px", borderRadius: 6 }}>cd ai-model && uvicorn main:app --reload --port 8000</code>
          </p>
        </div>
      )}

      {/* ── KPI Row ──────────────────────────────────────────────────────────── */}
      <div className="ai-fade" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 28 }}>
        <KpiCard
          label="AI Risk Score"
          value={`${Math.round(riskScore * 100)}%`}
          sub={rc.label + " " + rc.emoji}
          accent={rc.ring}
          icon="🎯"
        />
        <KpiCard
          label="Weekly Premium"
          value={aiDash?.plan_options?.[1]?.ai_premium ? `₹${aiDash.plan_options[1].ai_premium}` : "—"}
          sub="AI-adjusted Smart plan"
          accent="#7c3aed"
          icon="💎"
        />
        <KpiCard
          label="Est. Income at Risk"
          value={aiDash?.income_protection?.expected_loss_per_week
            ? `₹${Math.round(aiDash.income_protection.expected_loss_per_week)}`
            : "—"}
          sub="Expected weekly loss"
          accent="#ef4444"
          icon="⚠️"
        />
        <KpiCard
          label="Parametric Trigger"
          value={paramAlert?.auto_trigger ? "🚨 ACTIVE" : "✅ Clear"}
          sub={paramAlert?.severity ? `Severity: ${paramAlert.severity}` : "No weather trigger"}
          accent={paramAlert?.auto_trigger ? "#ef4444" : "#22c55e"}
          icon="🌩️"
        />
        <KpiCard
          label="Season Risk"
          value={season}
          sub="Current season factor"
          accent="#f59e0b"
          icon="🗓️"
        />
        <KpiCard
          label="Fraud Prevention"
          value={fraudStats?.fraud_prevention_rate_pct ? `${fraudStats.fraud_prevention_rate_pct}%` : "Active"}
          sub={fraudStats ? `${fraudStats.flagged_for_review} flagged` : "Real-time monitoring"}
          accent="#0ea5e9"
          icon="🛡️"
        />
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────────────────── */}
      <div className="ai-fade" style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {["overview", "risk", "weather", "fraud", "triggers", "plans"].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}>
            {t === "overview" ? "📊 Overview" :
             t === "risk"     ? "🎯 Risk Profile" :
             t === "weather"  ? "🌦️ Weather AI" :
             t === "fraud"    ? "🛡️ Fraud Detection" :
             t === "triggers" ? "🌀 Parametric Triggers" :
                                "💡 Plan AI"}
          </button>
        ))}
      </div>

      {/* ══════════════ OVERVIEW TAB ══════════════ */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Row 1: Risk Ring + Weather */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="ai-grid-2">

            {/* Risk Card */}
            <div className="ai-card ai-fade" style={{ padding: "28px 24px" }}>
              <SectionHeader title="AI Risk Assessment" live />
              <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                <RiskRing score={riskScore} />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: rc.ring, marginBottom: 6 }}>
                    {rc.emoji} {riskData?.risk_category ?? "Moderate Risk"}
                  </div>
                  {riskData?.contributing_factors?.map((f, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                        <span>{f.factor}</span>
                        <span style={{ fontWeight: 700 }}>{Math.round(f.score * 100)}%</span>
                      </div>
                      <div className="fraud-bar-wrap">
                        <div className="fraud-bar-fill" style={{
                          width: `${f.score * 100}%`,
                          background: f.score >= 0.70 ? "#ef4444" : f.score >= 0.45 ? "#f59e0b" : "#22c55e"
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weather Card */}
            <div className="ai-card ai-fade" style={{ padding: "28px 24px" }}>
              <SectionHeader title="Weather Intelligence" live />
              {wData ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 42 }}>{wEmoji}</span>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{wData.condition}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{wData.location}</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                      ["🌡️ Temp",       `${wData.temperature}°C`],
                      ["💧 Humidity",   `${wData.humidity}%`],
                      ["💨 Wind",       `${wData.wind_kmh} km/h`],
                      ["🏭 AQI",        wData.aqi],
                      ["⚠️ Risk Index", Math.round(wData.risk_index * 100) + "%"],
                    ].map(([lbl, val]) => (
                      <div key={lbl} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px" }}>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{lbl}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Parametric status */}
                  {paramAlert && (
                    <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12,
                      background: sevCfg.bg, border: `1.5px solid ${sevCfg.dot}44` }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: sevCfg.text }}>
                        {paramAlert.auto_trigger ? "🚨 Parametric Trigger ACTIVE" : "✅ No Active Trigger"}
                      </div>
                      {paramAlert.trigger_reasons?.length > 0 &&
                        <div style={{ fontSize: 11, color: sevCfg.text, marginTop: 4, opacity: .85 }}>
                          {paramAlert.trigger_reasons[0]}
                        </div>
                      }
                      {paramAlert.estimated_income_loss_pct > 0 &&
                        <div style={{ fontSize: 12, fontWeight: 700, color: sevCfg.text, marginTop: 4 }}>
                          Est. income loss: {paramAlert.estimated_income_loss_pct}%
                        </div>
                      }
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: 13 }}>Weather data unavailable. Start AI service.</p>
              )}
            </div>
          </div>

          {/* Row 2: Plan Recommendation */}
          {planRec && (
            <div className="ai-fade plan-rec-card">
              <div className="plan-rec-bg" />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", marginBottom: 8, opacity: .8 }}>
                  🤖 AI RECOMMENDATION
                </div>
                <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>
                  {planRec.recommended_plan} Plan is Best for You
                </h3>
                <p style={{ fontSize: 13, opacity: .85, margin: "0 0 16px", lineHeight: 1.6 }}>
                  {planRec.reason}
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {planRec.plans_ranked?.map(p => (
                    <div key={p.plan} style={{
                      padding: "8px 16px", borderRadius: 10,
                      background: p.recommended ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.10)",
                      border: p.recommended ? "1.5px solid rgba(255,255,255,0.5)" : "1.5px solid rgba(255,255,255,0.2)",
                      fontSize: 13, fontWeight: p.recommended ? 800 : 600,
                    }}>
                      {p.recommended ? "⭐ " : ""}{p.plan}
                      <span style={{ opacity: .75, marginLeft: 6 }}>₹{p.weekly_premium}/wk</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Row 3: Income Protection + Fraud Snapshot */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="ai-grid-2">

            {/* Income Protection */}
            <div className="ai-card ai-fade" style={{ padding: "24px" }}>
              <SectionHeader title="Income Protection Model" />
              {aiDash?.income_protection ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    ["Daily Income",           `₹${aiDash.income_protection.avg_daily_income_inr}`,  "#7c3aed"],
                    ["Weekly Income",          `₹${aiDash.income_protection.weekly_income_inr}`,     "#0ea5e9"],
                    ["Disruption Risk",        `${aiDash.income_protection.disruption_risk_pct}%`,   rc.ring],
                    ["Expected Weekly Loss",   `₹${Math.round(aiDash.income_protection.expected_loss_per_week)}`, "#ef4444"],
                  ].map(([lbl, val, color]) => (
                    <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", borderRadius: 10 }}>
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{lbl}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color }}>{val}</span>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: "#94a3b8", fontSize: 13 }}>AI service offline</p>}
            </div>

            {/* Fraud Snapshot */}
            <div className="ai-card ai-fade" style={{ padding: "24px" }}>
              <SectionHeader title="Fraud Prevention" badge="Real-time" />
              {fraudStats ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[
                      ["Analyzed",      fraudStats.total_claims_analyzed, "#7c3aed"],
                      ["Auto Approved", fraudStats.auto_approved,         "#22c55e"],
                      ["Flagged",       fraudStats.flagged_for_review,    "#f59e0b"],
                      ["Rejected",      fraudStats.auto_rejected,         "#ef4444"],
                    ].map(([l,v,c]) => (
                      <div key={l} style={{ textAlign: "center", padding: 10, background: "#f8fafc", borderRadius: 10 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, marginBottom: 8 }}>TOP FRAUD FLAGS</div>
                  {fraudStats.top_fraud_flags?.slice(0, 4).map(f => {
                    const pct = Math.round((f.count / fraudStats.total_claims_analyzed) * 100);
                    return (
                      <div key={f.flag} style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
                          <span>{f.flag.replace(/_/g, " ")}</span>
                          <span style={{ fontWeight: 700 }}>{f.count} ({pct}%)</span>
                        </div>
                        <div className="fraud-bar-wrap">
                          <div className="fraud-bar-fill" style={{ width: `${pct}%`, background: "#7c3aed" }} />
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : <p style={{ color: "#94a3b8", fontSize: 13 }}>AI service offline</p>}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ RISK PROFILE TAB ══════════════ */}
      {tab === "risk" && (
        <div className="ai-card ai-fade" style={{ padding: "32px" }}>
          <SectionHeader title="Detailed Risk Profile" live />
          {riskData ? (
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 40, alignItems: "flex-start" }} className="ai-grid-2">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <RiskRing score={riskData.risk_score} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: rc.ring }}>{riskData.risk_level_emoji} {riskData.risk_category}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Overall Risk Score</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".07em" }}>
                  Contributing Factors
                </div>
                {riskData.contributing_factors?.map((f, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{f.factor}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{f.weight}</span>
                        <span style={{ fontSize: 14, fontWeight: 800,
                          color: f.score >= 0.70 ? "#ef4444" : f.score >= 0.45 ? "#f59e0b" : "#22c55e" }}>
                          {Math.round(f.score * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="fraud-bar-wrap" style={{ height: 10 }}>
                      <div className="fraud-bar-fill" style={{
                        width: `${f.score * 100}%`,
                        background: f.score >= 0.70 ? "linear-gradient(90deg,#ef4444,#f97316)"
                                  : f.score >= 0.45 ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                                  : "linear-gradient(90deg,#22c55e,#86efac)",
                      }} />
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 24, padding: "16px", borderRadius: 14, background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 8 }}>🤖 AI RECOMMENDATION</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#7c3aed" }}>
                    {riskData.recommended_plan} Plan
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                    Best matching plan based on your {riskData.risk_category?.toLowerCase()} risk profile
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
              <p>AI Risk service offline. Start the AI microservice to see your risk profile.</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ WEATHER AI TAB ══════════════ */}
      {tab === "weather" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="ai-card ai-fade" style={{ padding: "28px 24px" }}>
            <SectionHeader title="AI Weather Intelligence" live />
            {wData ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="ai-grid-2">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                    <span style={{ fontSize: 56 }}>{wEmoji}</span>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{wData.condition}</div>
                      <div style={{ fontSize: 14, color: "#94a3b8" }}>{wData.location}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        {new Date(wData.timestamp).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                      ["🌡️ Temperature",   `${wData.temperature}°C`],
                      ["💧 Humidity",       `${wData.humidity}%`],
                      ["💨 Wind Speed",     `${wData.wind_kmh} km/h`],
                      ["🏭 AQI",            wData.aqi, wData.aqi >= 300 ? "#ef4444" : wData.aqi >= 150 ? "#f59e0b" : "#22c55e"],
                      ["🗓️ Season",         wData.season?.replace("_"," ")],
                      ["⚠️ Risk Index",     `${Math.round(wData.risk_index * 100)}%`, rc.ring],
                    ].map(([lbl, val, color]) => (
                      <div key={lbl} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{lbl}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: color ?? "#0f172a", marginTop: 2 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Parametric trigger panel */}
                  {paramAlert && (
                    <>
                      <div style={{
                        padding: "20px", borderRadius: 14,
                        background: paramAlert.auto_trigger ? "#fee2e2" : "#dcfce7",
                        border: `1.5px solid ${paramAlert.auto_trigger ? "#fca5a5" : "#86efac"}`,
                        marginBottom: 16,
                      }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: paramAlert.auto_trigger ? "#991b1b" : "#166534", marginBottom: 8 }}>
                          {paramAlert.auto_trigger ? "🚨 Parametric Claim Trigger ACTIVE" : "✅ No Active Trigger"}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: paramAlert.auto_trigger ? "#991b1b" : "#166534" }}>
                          Severity: {paramAlert.severity}
                        </div>
                        <div style={{ fontSize: 13, color: paramAlert.auto_trigger ? "#b91c1c" : "#15803d", marginTop: 6 }}>
                          Est. income loss: <strong>{paramAlert.estimated_income_loss_pct}%</strong>
                        </div>
                      </div>

                      {paramAlert.trigger_reasons?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 10 }}>TRIGGER REASONS</div>
                          {paramAlert.trigger_reasons.map((r, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 13, color: "#374151" }}>
                              <span style={{ color: "#ef4444", fontWeight: 800, flexShrink: 0 }}>›</span>
                              {r}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {parametric && (
                    <div style={{ padding: "16px", borderRadius: 14, background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 10 }}>PARAMETRIC PAYOUT ESTIMATE</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#7c3aed" }}>
                        ₹{parametric.estimated_payout}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                        {parametric.payout_pct}% of ₹{parametric.coverage} coverage
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
                        Next check: {parametric.next_check_in}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ color: "#94a3b8" }}>Weather data unavailable — start the AI microservice.</p>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ FRAUD DETECTION TAB ══════════════ */}
      {tab === "fraud" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="ai-card ai-fade" style={{ padding: "28px 24px" }}>
            <SectionHeader title="Fraud Detection Engine" badge="AI-Powered" />
            {fraudStats ? (
              <>
                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 28 }}>
                  {[
                    { label: "Total Analyzed",   value: fraudStats.total_claims_analyzed, color: "#7c3aed" },
                    { label: "Auto-Approved",    value: fraudStats.auto_approved,         color: "#22c55e" },
                    { label: "Manual Review",    value: fraudStats.flagged_for_review,    color: "#f59e0b" },
                    { label: "Auto-Rejected",    value: fraudStats.auto_rejected,         color: "#ef4444" },
                    { label: "Fraud Rate",       value: fraudStats.fraud_prevention_rate_pct + "%", color: "#0ea5e9" },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center", padding: "16px 12px", background: "#f8fafc", borderRadius: 14, border: "1.5px solid #f1f5f9" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Flag breakdown */}
                <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 14, textTransform: "uppercase", letterSpacing: ".07em" }}>
                  Fraud Flag Analysis
                </div>
                {fraudStats.top_fraud_flags?.map(f => {
                  const pct = Math.round((f.count / fraudStats.total_claims_analyzed) * 100);
                  return (
                    <div key={f.flag} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>
                          {f.flag.replace(/_/g, " ")}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#7c3aed" }}>{f.count}</span>
                      </div>
                      <div className="fraud-bar-wrap" style={{ height: 10 }}>
                        <div className="fraud-bar-fill" style={{
                          width: `${Math.min(100, pct * 5)}%`,
                          background: "linear-gradient(90deg,#7c3aed,#a855f7)"
                        }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                        {pct}% of total claims • {f.count} flagged
                      </div>
                    </div>
                  );
                })}

                {/* Detection methods */}
                <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="ai-grid-2">
                  {[
                    { name: "Anomaly Detection",       desc: "Statistical outlier scanning",          status: "Active", icon: "🔍" },
                    { name: "Location Validation",      desc: "Cross-checks claim & work location",    status: "Active", icon: "📍" },
                    { name: "Duplicate Prevention",     desc: "One claim per week enforcement",        status: "Active", icon: "🔒" },
                    { name: "Weather Corroboration",    desc: "Validates claim against weather data",  status: "Active", icon: "🌦️" },
                    { name: "Account Age Check",        desc: "Flags new accounts < 14 days",         status: "Active", icon: "🗓️" },
                    { name: "Subscription Verification","desc": "Ensures active policy at claim time", status: "Active", icon: "✅" },
                  ].map(m => (
                    <div key={m.name} style={{ padding: "14px 16px", borderRadius: 12, background: "#f8fafc", border: "1.5px solid #f1f5f9", display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{m.desc}</div>
                        <span style={{ display: "inline-block", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: "#dcfce7", color: "#166534", marginTop: 5 }}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: "#94a3b8" }}>Fraud stats unavailable — start the AI microservice.</p>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ PARAMETRIC TRIGGERS TAB ══════════════ */}
      {tab === "triggers" && (
        <div className="ai-card ai-fade" style={{ padding: "28px 24px" }}>
          <SectionHeader title="India-Wide Parametric Triggers" live badge={triggers?.triggers?.length + " cities"} />
          {triggers?.triggers ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {triggers.triggers.map((t, i) => {
                const sev = t.trigger?.severity ?? "LOW";
                const scfg = SEV_CONFIG[sev] ?? SEV_CONFIG.LOW;
                const we = WEATHER_EMOJI[t.weather?.condition] ?? "🌡️";
                return (
                  <div key={i} className="trigger-row">
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{we}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                        {t.district}, {t.state}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>
                        {t.weather?.condition} · {t.weather?.temperature}°C · AQI {t.weather?.aqi}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 8,
                        fontSize: 11, fontWeight: 800,
                        background: scfg.bg, color: scfg.text }}>
                        {scfg.label}
                      </span>
                      {t.trigger?.auto_trigger && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginTop: 4 }}>
                          🚨 Auto-claim triggered
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 12, textAlign: "right" }}>
                Last updated: {new Date(triggers.checked_at).toLocaleString("en-IN")}
              </div>
            </div>
          ) : (
            <p style={{ color: "#94a3b8" }}>Trigger data unavailable — start the AI microservice.</p>
          )}
        </div>
      )}

      {/* ══════════════ PLAN AI TAB ══════════════ */}
      {tab === "plans" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Plan recommendation */}
          {planRec && (
            <div className="ai-card ai-fade" style={{ padding: "28px 24px" }}>
              <SectionHeader title="AI Plan Recommendation" badge="Personalized" />
              <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>
                {planRec.reason}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
                {planRec.plans_ranked?.map(p => (
                  <div key={p.plan} style={{
                    borderRadius: 16, padding: "20px",
                    background: p.recommended ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "#f8fafc",
                    color: p.recommended ? "#fff" : "#0f172a",
                    border: p.recommended ? "none" : "1.5px solid #f1f5f9",
                    position: "relative",
                  }}>
                    {p.recommended && (
                      <div style={{ position: "absolute", top: 10, right: 10, fontSize: 9, fontWeight: 800,
                        padding: "2px 6px", borderRadius: 6, background: "rgba(255,255,255,0.25)" }}>
                        ⭐ RECOMMENDED
                      </div>
                    )}
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{p.plan}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, margin: "10px 0 4px" }}>₹{p.weekly_premium}<span style={{ fontSize: 13, fontWeight: 600, opacity: .75 }}>/week</span></div>
                    <div style={{ fontSize: 13, opacity: .8 }}>Coverage: ₹{p.coverage?.toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: 11, opacity: .65, marginTop: 4 }}>Value ratio: {p.fit_score?.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI premium breakdown */}
          {aiDash?.plan_options && (
            <div className="ai-card ai-fade" style={{ padding: "28px 24px" }}>
              <SectionHeader title="AI-Adjusted Premium Breakdown" />
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                      {["Plan", "Base ₹/week", "AI-Adjusted ₹/week", "Coverage", "Value Ratio"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#94a3b8", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: ".07em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {aiDash.plan_options.map((p, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 800, color: "#0f172a" }}>{p.plan}</td>
                        <td style={{ padding: "12px 14px", color: "#94a3b8" }}>₹{p.base_premium}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#7c3aed" }}>₹{p.ai_premium}</td>
                        <td style={{ padding: "12px 14px", color: "#0f172a" }}>₹{p.coverage?.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800,
                            background: "#f0fdf4", color: "#166534" }}>{p.value_ratio}x</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 14 }}>
                * AI-adjusted premiums reflect your personal risk score ({Math.round(riskScore * 100)}%) and current season ({season}).
                Multiplier: {aiDash?.ai_summary?.premium_multiplier}×
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}