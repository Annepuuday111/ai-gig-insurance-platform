import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { buyPlan } from "../api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .pay-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .pay-root h1, .pay-root h2, .pay-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes successPop {
    0%   { transform: scale(0.6); opacity: 0; }
    70%  { transform: scale(1.08); }
    100% { transform: scale(1); opacity: 1; }
  }

  .pay-card {
    background: #fff; border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    box-shadow: 0 8px 32px rgba(15,23,42,0.09);
    animation: fadeUp 0.5s ease both;
  }

  .method-btn {
    display: flex; align-items: center; gap: 12px;
    width: 100%; padding: 14px 18px;
    border: 2px solid #e2e8f0; border-radius: 14px;
    background: #fff; cursor: pointer; text-align: left;
    transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif;
  }
  .method-btn:hover { border-color: #7c3aed; background: #faf5ff; }
  .method-btn.active {
    border-color: #7c3aed; background: #faf5ff;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
  }

  .pay-input {
    width: 100%; padding: 13px 16px;
    border: 2px solid #e2e8f0; border-radius: 12px;
    font-size: 15px; font-family: 'DM Sans', sans-serif;
    outline: none; transition: border-color 0.2s;
    background: #f8fafc;
  }
  .pay-input:focus { border-color: #7c3aed; background: #fff; }

  .pay-btn-main {
    width: 100%; padding: 16px;
    border: none; border-radius: 14px;
    font-family: 'Sora', sans-serif;
    font-size: 16px; font-weight: 700;
    cursor: pointer; letter-spacing: 0.02em;
    transition: all 0.25s ease;
    position: relative; overflow: hidden;
  }
  .pay-btn-main:disabled { opacity: 0.6; cursor: not-allowed; }
  .pay-btn-main:not(:disabled):hover { filter: brightness(1.07); transform: translateY(-1px); }
  .pay-btn-main:not(:disabled):active { transform: scale(0.98); }

  .success-container {
    text-align: center; padding: 48px 24px;
    animation: successPop 0.55s cubic-bezier(.22,.68,0,1.2) both;
  }

  .card-input-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  }
`;

const PLAN_GRADIENTS = {
  Starter: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
  Smart:   "linear-gradient(135deg, #7c3aed, #a78bfa)",
  Pro:     "linear-gradient(135deg, #10b981, #34d399)",
  Max:     "linear-gradient(135deg, #f59e0b, #fbbf24)",
};

const METHODS = [
  { id: "UPI",    label: "UPI",           icon: "📱", desc: "PhonePe, GPay, Paytm" },
  { id: "CARD",   label: "Credit / Debit Card", icon: "💳", desc: "Visa, Mastercard, RuPay" },
  { id: "WALLET", label: "Mobile Wallet", icon: "👜", desc: "Paytm, Amazon Pay, Freecharge" },
];

export default function Payment() {
  const navigate  = useNavigate();
  const { state } = useLocation();

  const planId    = state?.planId   || null;
  const plan      = state?.plan     || "Starter";
  const price     = state?.price    || 40;
  const coverage  = state?.coverage || 6000;
  const trialDays = state?.trialDays || 7;
  const mode      = state?.mode     || "paid";  // "paid" | "trial"
  const features  = state?.features || [];
  const gradient  = PLAN_GRADIENTS[plan] || PLAN_GRADIENTS.Starter;

  const [method,      setMethod]      = useState(mode === "trial" ? "FREE_TRIAL" : "UPI");
  const [upiId,       setUpiId]       = useState("");
  const [cardNum,     setCardNum]     = useState("");
  const [cardName,    setCardName]    = useState("");
  const [cardExpiry,  setCardExpiry]  = useState("");
  const [cardCvv,     setCardCvv]     = useState("");
  const [wallet,      setWallet]      = useState("");
  const [processing,  setProcessing]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");
  const [result,      setResult]      = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    if (!planId) navigate("/plans");
  }, [navigate, planId]);

  /* ── simulate card / UPI validation ──────────────────────────────────────── */
  function validate() {
    if (method === "UPI" && !upiId.includes("@")) {
      setError("Please enter a valid UPI ID (e.g. yourname@upi)");
      return false;
    }
    if (method === "CARD") {
      if (cardNum.replace(/\s/g, "").length < 16) { setError("Enter a valid 16-digit card number"); return false; }
      if (!cardName.trim()) { setError("Enter cardholder name"); return false; }
      if (cardExpiry.length < 5) { setError("Enter valid expiry (MM/YY)"); return false; }
      if (cardCvv.length < 3)    { setError("Enter valid CVV"); return false; }
    }
    if (method === "WALLET" && !wallet) {
      setError("Please select a wallet"); return false;
    }
    return true;
  }

  async function handlePay() {
    setError("");
    if (method !== "FREE_TRIAL" && !validate()) return;

    setProcessing(true);
    try {
      // For demo mode (FREE_TRIAL or simulated), we generate a fake txnRef
      const txnReference = method === "FREE_TRIAL"
        ? null
        : `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const res = await buyPlan({
        planId,
        method,
        upiId: method === "UPI" ? upiId : null,
        txnReference,
      });

      if (res?.subscriptionId) {
        setResult(res);
        setSuccess(true);
      } else {
        setError(res?.error || "Payment failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  /* ── Format card number with spaces ──────────────────────────────────────── */
  function fmtCardNum(v) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function fmtExpiry(v) {
    v = v.replace(/\D/g, "").slice(0, 4);
    return v.length >= 3 ? v.slice(0, 2) + "/" + v.slice(2) : v;
  }

  /* ── Success screen ─────────────────────────────────────────────────────── */
  if (success && result) {
    return (
      <div className="pay-root" style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{STYLES}</style>
        <div className="pay-card success-container" style={{ maxWidth: 420, width: "100%", margin: 16 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 26, color: "#0f172a", marginBottom: 8 }}>
            {result.status === "TRIAL" ? "Free Trial Activated!" : "Payment Successful!"}
          </h2>
          <p style={{ color: "#64748b", fontSize: 15, marginBottom: 28 }}>
            {result.status === "TRIAL"
              ? `Your ${trialDays}-day free trial for the ${plan} plan has started. Enjoy full coverage!`
              : `Your ${plan} plan is now active. You're protected!`}
          </p>

          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "16px", marginBottom: 28, textAlign: "left" }}>
            {[
              ["Plan",           result.plan],
              ["Status",         result.status === "TRIAL" ? "🟡 Free Trial" : "🟢 Active"],
              ["Amount Paid",    result.amountPaid === 0 ? "₹0 (Free)" : `₹${result.amountPaid}`],
              ["Next Payment",   result.trialEndDate
                ? new Date(result.trialEndDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                : new Date(result.nextPaymentDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #e2e8f0", fontSize: 14 }}>
                <span style={{ color: "#64748b" }}>{k}</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{v}</span>
              </div>
            ))}
          </div>

          <button
            className="pay-btn-main"
            style={{ background: gradient, color: "#fff" }}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  /* ── Main payment UI ─────────────────────────────────────────────────────── */
  return (
    <div className="pay-root" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", padding: "36px 24px 52px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "clamp(22px,4vw,30px)", color: "#fff", margin: "0 0 8px" }}>
          {mode === "trial" ? "🎁 Activate Free Trial" : "💳 Complete Your Payment"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15 }}>
          {mode === "trial"
            ? `Start your ${trialDays}-day free trial for the ${plan} plan — no charge today`
            : `You're subscribing to the ${plan} plan`}
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: "-28px auto 60px", padding: "0 16px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>

          {/* Order Summary */}
          <div className="pay-card" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 18, color: "#0f172a", marginBottom: 16 }}>
              📋 Order Summary
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                ["Plan",          plan],
                ["Weekly Premium",`₹${price}`],
                ["Coverage",      `₹${Number(coverage).toLocaleString("en-IN")}`],
                ["Trial Period",  `${trialDays} days free`],
                ["Today's Charge", mode === "trial" ? "₹0 (Free Trial)" : `₹${price}`],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14,
                }}>
                  <span style={{ color: "#64748b" }}>{k}</span>
                  <span style={{
                    fontWeight: 700,
                    color: k === "Today's Charge" ? "#16a34a" : "#0f172a",
                    fontSize: k === "Today's Charge" ? 16 : 14,
                  }}>{v}</span>
                </div>
              ))}
            </div>

            {features.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
                  Included Benefits
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {features.map((f, i) => (
                    <span key={i} style={{
                      background: "#f0fdf4", color: "#16a34a",
                      padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    }}>✓ {f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="pay-card" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 18, color: "#0f172a", marginBottom: 16 }}>
              💳 Payment Method
            </h3>

            {/* Free trial button */}
            {mode === "trial" ? (
              <div style={{
                background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                border: "2px solid #86efac", borderRadius: 14, padding: "20px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎁</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#16a34a" }}>
                  Free Trial — ₹0 Today
                </div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                  You will be charged ₹{price}/week after your {trialDays}-day trial ends.
                  You can cancel anytime before that.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {METHODS.map(m => (
                  <button
                    key={m.id}
                    className={`method-btn${method === m.id ? " active" : ""}`}
                    onClick={() => { setMethod(m.id); setError(""); }}
                  >
                    <span style={{ fontSize: 24 }}>{m.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{m.label}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{m.desc}</div>
                    </div>
                    {method === m.id && (
                      <span style={{ marginLeft: "auto", color: "#7c3aed", fontWeight: 800, fontSize: 18 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* UPI input */}
            {method === "UPI" && (
              <div style={{ marginTop: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                  UPI ID
                </label>
                <input
                  className="pay-input"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={e => { setUpiId(e.target.value); setError(""); }}
                />
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                  e.g. mobile@paytm, name@gpay, number@ybl
                </div>
              </div>
            )}

            {/* Card inputs */}
            {method === "CARD" && (
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Card Number</label>
                  <input className="pay-input" placeholder="1234 5678 9012 3456" value={cardNum}
                    onChange={e => { setCardNum(fmtCardNum(e.target.value)); setError(""); }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Cardholder Name</label>
                  <input className="pay-input" placeholder="Full name on card" value={cardName}
                    onChange={e => { setCardName(e.target.value); setError(""); }} />
                </div>
                <div className="card-input-grid">
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Expiry (MM/YY)</label>
                    <input className="pay-input" placeholder="MM/YY" value={cardExpiry}
                      onChange={e => { setCardExpiry(fmtExpiry(e.target.value)); setError(""); }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>CVV</label>
                    <input className="pay-input" placeholder="•••" type="password" maxLength={4} value={cardCvv}
                      onChange={e => { setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }} />
                  </div>
                </div>
              </div>
            )}

            {/* Wallet selector */}
            {method === "WALLET" && (
              <div style={{ marginTop: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Select Wallet</label>
                <select
                  className="pay-input"
                  value={wallet}
                  onChange={e => { setWallet(e.target.value); setError(""); }}
                >
                  <option value="">— Choose wallet —</option>
                  {["Paytm Wallet", "Amazon Pay", "Freecharge", "Mobikwik", "Ola Money"].map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 14, padding: "12px 16px",
                background: "#fef2f2", border: "1px solid #fca5a5",
                borderRadius: 10, color: "#dc2626", fontSize: 13, fontWeight: 600,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* PAY button */}
            <button
              className="pay-btn-main"
              style={{ background: gradient, color: "#fff", marginTop: 24 }}
              onClick={handlePay}
              disabled={processing}
            >
              {processing ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{ width: 18, height: 18, border: "3px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  Processing...
                </span>
              ) : mode === "trial"
                ? `🎁 Activate Free Trial — ₹0 Today`
                : `Pay ₹${price} Securely`
              }
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 12 }}>
              🔒 256-bit SSL encrypted &nbsp;|&nbsp; Your data is never stored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
