import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlans } from "../api";

/* ─── plan-tier metadata ─────────────────────────────────────────────────────── */
const PLAN_META = {
  Starter: {
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
    glow: "rgba(14,165,233,0.25)",
    badge: "Starter",
    badgeColor: "#0ea5e9",
    icon: "🌱",
    popular: false,
  },
  Smart: {
    gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
    glow: "rgba(124,58,237,0.28)",
    badge: "Most Popular",
    badgeColor: "#7c3aed",
    icon: "💡",
    popular: true,
  },
  Pro: {
    gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    glow: "rgba(16,185,129,0.25)",
    badge: "Best Value",
    badgeColor: "#10b981",
    icon: "🚀",
    popular: false,
  },
  Max: {
    gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    glow: "rgba(245,158,11,0.28)",
    badge: "Enterprise",
    badgeColor: "#f59e0b",
    icon: "👑",
    popular: false,
  },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .plans-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .plans-root h1, .plans-root h2, .plans-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(124,58,237,0.45); }
    70%  { box-shadow: 0 0 0 12px rgba(124,58,237,0); }
    100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .plan-card {
    position: relative; border-radius: 24px; overflow: hidden;
    background: #fff; border: 1.5px solid #e2e8f0;
    transition: transform 0.3s cubic-bezier(.22,.68,0,1.2),
                box-shadow  0.3s ease,
                border-color 0.3s ease;
    animation: fadeUp 0.5s ease both;
    cursor: pointer;
    display: flex;
    flex-direction: column;
  }
  .plan-card:hover {
    transform: translateY(-6px);
    border-color: transparent;
  }
  .plan-card.popular {
    border-color: #7c3aed;
    animation: fadeUp 0.5s ease 0.1s both, pulse-ring 2.2s infinite 1s;
  }

  .plan-btn {
    width: 100%; padding: 14px;
    border: none; border-radius: 12px;
    font-family: 'Sora', sans-serif;
    font-size: 15px; font-weight: 700;
    cursor: pointer; letter-spacing: 0.02em;
    transition: all 0.25s ease;
    position: relative; overflow: hidden;
  }
  .plan-btn::after {
    content: ''; position: absolute; inset: 0;
    background: rgba(255,255,255,0.35);
    opacity: 0; transition: opacity 0.2s;
  }
  .plan-btn:hover::after { opacity: 1; }
  .plan-btn:active { transform: scale(0.97); }

  .plan-btn-trial {
    background: #f1f5f9; color: #475569;
    font-size: 13px; padding: 10px;
    width: 100%; border: 1.5px dashed #cbd5e1;
    border-radius: 10px; cursor: pointer;
    font-weight: 600; transition: all 0.2s;
    margin-top: 10px;
  }
  .plan-btn-trial:hover {
    background: #e2e8f0; border-color: #94a3b8;
  }

  .feature-item {
    display: flex; align-items: center; gap: 10px;
    padding: 6px 0; font-size: 14px; color: #374151;
    border-bottom: 1px solid #f1f5f9;
  }
  .feature-item:last-child { border-bottom: none; }

  .risk-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px; font-size: 11px;
    font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
  }

  .skeleton {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 800px 100%; animation: shimmer 1.4s infinite;
    border-radius: 16px;
  }

  /* modal */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(15,23,42,0.55); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px; animation: fadeUp 0.2s ease;
  }
  .modal-box {
    background: #fff; border-radius: 24px;
    padding: 32px; max-width: 440px; width: 100%;
    box-shadow: 0 32px 80px rgba(15,23,42,0.22);
    animation: fadeUp 0.3s cubic-bezier(.22,.68,0,1.2);
    position: relative;
  }
`;

/* ─── Risk badge colour ────────────────────────────────────────────────────── */
function riskStyle(level) {
  if (level === "Low") return { background: "#dcfce7", color: "#16a34a" };
  if (level === "Moderate") return { background: "#fef9c3", color: "#ca8a04" };
  return { background: "#fee2e2", color: "#dc2626" };
}

/* ─── Single Plan Card ────────────────────────────────────────────────────── */
function PlanCard({ plan, meta, onBuy, onTrial, delay }) {
  return (
    <div
      className={`plan-card${meta.popular ? " popular" : ""}`}
      style={{
        animationDelay: `${delay}s`,
        boxShadow: `0 8px 40px ${meta.glow}, 0 2px 8px rgba(0,0,0,0.06)`,
      }}
      onClick={() => onBuy(plan)}
    >
      {/* Gradient header */}
      <div style={{ background: meta.gradient, padding: "28px 24px 20px" }}>
        {/* Popular badge */}
        {meta.popular && (
          <div style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.22)", backdropFilter: "blur(6px)",
            border: "1.5px solid rgba(255,255,255,0.4)",
            borderRadius: 20, padding: "4px 12px",
            fontSize: 11, fontWeight: 800, color: "#fff",
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            ⭐ {meta.badge}
          </div>
        )}

        <div style={{ fontSize: 40, marginBottom: 10 }}>{meta.icon}</div>
        <h3 style={{
          fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 22,
          color: "#fff", margin: "0 0 4px",
        }}>
          {plan.name}
        </h3>
        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 500 }}>
          {plan.trialDays}-day free trial included
        </div>

        {/* Price */}
        <div style={{ marginTop: 18, display: "flex", alignItems: "flex-end", gap: 4 }}>
          <span style={{
            fontFamily: "Sora,sans-serif", fontSize: 38, fontWeight: 800, color: "#fff",
          }}>
            ₹{plan.weeklyPremium}
          </span>
          <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginBottom: 6 }}>
            / week
          </span>
        </div>

        <div style={{
          marginTop: 8, display: "flex", alignItems: "center", gap: 8
        }}>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>
            Coverage up to
          </span>
          <span style={{
            background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.35)",
            padding: "2px 10px", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff",
          }}>
            ₹{plan.coverageAmount.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Risk badge */}
        <div style={{ marginBottom: 16 }}>
          <span className="risk-badge" style={riskStyle(plan.riskLevel)}>
            {plan.riskLevel === "Low" ? "🟢" : plan.riskLevel === "Moderate" ? "🟡" : "🔴"}
            &nbsp;{plan.riskLevel} Risk
          </span>
        </div>

        {/* Features */}
        <div style={{ marginBottom: 20, flex: 1 }}>
          {plan.features.map((f, i) => (
            <div className="feature-item" key={i}>
              <span style={{ color: "#16a34a", fontSize: 16, flexShrink: 0 }}>✓</span>
              <span>{f}</span>
            </div>
          ))}
        </div>

        {/* Buy button */}
        <button
          className="plan-btn"
          style={{ background: meta.gradient, color: "#fff" }}
          onClick={e => { e.stopPropagation(); onBuy(plan); }}
        >
          Pay ₹{plan.weeklyPremium} &nbsp;→&nbsp; Subscribe Now
        </button>

        {/* Free trial button */}
        <button
          className="plan-btn-trial"
          onClick={e => { e.stopPropagation(); onTrial(plan); }}
        >
          🎁 Start {plan.trialDays}-Day Free Trial
        </button>
      </div>
    </div>
  );
}

/* ─── Main Plans Page ────────────────────────────────────────────────────────── */
export default function Plans() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null); // { plan, mode: "paid"|"trial" }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    getPlans()
      .then(data => {
        if (Array.isArray(data)) setPlans(data);
        else setError("Failed to load plans.");
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = plan => setSelected({ plan, mode: "paid" });
  const handleTrial = plan => setSelected({ plan, mode: "trial" });
  const handleClose = () => setSelected(null);

  const handleProceedToPayment = () => {
    if (!selected) return;
    navigate("/payment", {
      state: {
        planId: selected.plan.id,
        plan: selected.plan.name,
        price: selected.plan.weeklyPremium,
        coverage: selected.plan.coverageAmount,
        trialDays: selected.plan.trialDays,
        mode: selected.mode,
        features: selected.plan.features,
      },
    });
    handleClose();
  };

  return (
    <div className="plans-root" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <style>{STYLES}</style>

      {/* ── Hero Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        padding: "48px 24px 60px", textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 20, padding: "6px 16px", marginBottom: 20,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Gig Worker Insurance Plans
          </span>
        </div>

        <h1 style={{
          fontFamily: "Sora,sans-serif", fontWeight: 800,
          fontSize: "clamp(26px, 5vw, 42px)", color: "#fff",
          lineHeight: 1.15, maxWidth: 600, margin: "0 auto 16px",
        }}>
          Choose the Plan That<br />
          <span style={{ background: "linear-gradient(90deg,#a78bfa,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Protects You Best
          </span>
        </h1>

        <p style={{
          color: "rgba(255,255,255,0.65)", fontSize: 16, maxWidth: 480,
          margin: "0 auto", lineHeight: 1.7,
        }}>
          All plans include a <strong style={{ color: "#fff" }}>7-day free trial</strong>.
          No credit card required upfront. Cancel anytime.
        </p>

        {/* Stat pills */}
        <div style={{
          display: "flex", justifyContent: "center", flexWrap: "wrap",
          gap: 16, marginTop: 32,
        }}>
          {[
            { label: "Active Workers Covered", value: "12,400+" },
            { label: "Claims Settled", value: "₹2.4 Cr+" },
            { label: "Claim Approval Rate", value: "98.2%" },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 14, padding: "12px 20px", textAlign: "center",
            }}>
              <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 22, color: "#fff" }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Plan Cards ── */}
      <div style={{ maxWidth: 1280, margin: "-28px auto 60px", padding: "0 16px", position: "relative", zIndex: 10 }}>

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 480 }} />
            ))}
          </div>
        )}

        {error && (
          <div style={{
            textAlign: "center", padding: 48,
            color: "#dc2626", fontSize: 16, fontWeight: 600,
          }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}>
            {plans.map((plan, i) => {
              const meta = PLAN_META[plan.name] || PLAN_META.Starter;
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  meta={meta}
                  onBuy={handleBuy}
                  onTrial={handleTrial}
                  delay={i * 0.12}
                />
              );
            })}
          </div>
        )}

        {/* Info note */}
        {!loading && !error && (
          <div style={{
            marginTop: 40, textAlign: "center",
            padding: "20px 24px", background: "#fff",
            border: "1.5px solid #e2e8f0", borderRadius: 16,
          }}>
            <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
              🔒 &nbsp;All payments are 100% secure and encrypted. &nbsp;|&nbsp;
              📋 &nbsp;Coverage activates immediately after payment. &nbsp;|&nbsp;
              📞 &nbsp;24×7 support for gig workers.
            </p>
          </div>
        )}
      </div>

      {/* ── Confirm Modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            {/* Close */}
            <button
              onClick={handleClose}
              style={{
                position: "absolute", top: 16, right: 16,
                background: "#f1f5f9", border: "none", borderRadius: "50%",
                width: 32, height: 32, fontSize: 18, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >×</button>

            <div style={{ fontSize: 42, marginBottom: 12 }}>
              {(PLAN_META[selected.plan.name] || PLAN_META.Basic).icon}
            </div>

            <h2 style={{
              fontFamily: "Sora,sans-serif", fontWeight: 800,
              fontSize: 22, color: "#0f172a", marginBottom: 6,
            }}>
              {selected.mode === "trial"
                ? `Start Free Trial – ${selected.plan.name}`
                : `Subscribe to ${selected.plan.name}`}
            </h2>

            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
              {selected.mode === "trial"
                ? `Enjoy full ${selected.plan.name} benefits free for ${selected.plan.trialDays} days. Your first payment of ₹${selected.plan.weeklyPremium} will be due after the trial ends.`
                : `You will be charged ₹${selected.plan.weeklyPremium}/week. Coverage of ₹${selected.plan.coverageAmount.toLocaleString("en-IN")} starts immediately.`}
            </p>

            {/* Summary rows */}
            <div style={{
              background: "#f8fafc", borderRadius: 12,
              padding: "16px", marginBottom: 24,
            }}>
              {[
                ["Plan", selected.plan.name],
                ["Weekly Premium", `₹${selected.plan.weeklyPremium}`],
                ["Coverage Amount", `₹${selected.plan.coverageAmount.toLocaleString("en-IN")}`],
                ["Risk Level", selected.plan.riskLevel],
                ["Today's Charge", selected.mode === "trial" ? "₹0 (Free Trial)" : `₹${selected.plan.weeklyPremium}`],
              ].map(([label, val]) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "6px 0", borderBottom: "1px solid #e2e8f0", fontSize: 14,
                }}>
                  <span style={{ color: "#64748b" }}>{label}</span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{val}</span>
                </div>
              ))}
            </div>

            <button
              className="plan-btn"
              style={{
                background: (PLAN_META[selected.plan.name] || PLAN_META.Basic).gradient,
                color: "#fff",
              }}
              onClick={handleProceedToPayment}
            >
              {selected.mode === "trial" ? "🎁 Activate Free Trial" : "Proceed to Payment →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}