import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { buyPlan, getCurrentUser, getPartners, getDashboardSummary } from "../api";

/* ─────────────────────────────── constants ───────────────────────────────── */
const defaultTheme = {
  accent: "#16a34a",
  light: "#f0fdf4",
  gradient: "linear-gradient(135deg,#16a34a,#22c55e)",
};

const PLAN_GRADIENTS = {
  Starter: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
  Smart:   "linear-gradient(135deg, #7c3aed, #a78bfa)",
  Pro:     "linear-gradient(135deg, #10b981, #34d399)",
  Max:     "linear-gradient(135deg, #f59e0b, #fbbf24)",
};

/* ── Top-level payment method tabs ── */
const PAYMENT_TABS = [
  { id: "UPI",    label: "UPI",          icon: "📱" },
  { id: "CARD",   label: "Debit / Credit Card", icon: "💳" },
  { id: "WALLET", label: "Mobile Wallet", icon: "👜" },
];

/* ── UPI Apps with brand colors ── */
const UPI_APPS = [
  {
    id: "phonepe",
    name: "PhonePe",
    color: "#5f259f",
    bg: "#f3ebff",
    emoji: "💜",
    upiHandle: "@ybl",
    desc: "India's #1 UPI App",
  },
  {
    id: "googlepay",
    name: "Google Pay",
    color: "#1a73e8",
    bg: "#e8f0fe",
    emoji: "🔵",
    upiHandle: "@okicici",
    desc: "Pay with G Pay",
  },
  {
    id: "paytm",
    name: "Paytm",
    color: "#002970",
    bg: "#e6f0ff",
    emoji: "💙",
    upiHandle: "@paytm",
    desc: "Paytm UPI & Wallet",
  },
  {
    id: "bhim",
    name: "BHIM UPI",
    color: "#ff6b00",
    bg: "#fff3e8",
    emoji: "🇮🇳",
    upiHandle: "@upi",
    desc: "Govt. of India App",
  },
  {
    id: "amazonpay",
    name: "Amazon Pay",
    color: "#ff9900",
    bg: "#fff8e8",
    emoji: "🛒",
    upiHandle: "@apl",
    desc: "Amazon Pay UPI",
  },
  {
    id: "other",
    name: "Any UPI App",
    color: "#16a34a",
    bg: "#f0fdf4",
    emoji: "📲",
    upiHandle: "",
    desc: "Use any UPI app",
  },
];

const WALLETS = [
  "Paytm Wallet",
  "Amazon Pay",
  "Mobikwik",
  "Freecharge",
  "Ola Money",
  "Jio Money",
];

/* ─────────────────────────────── styles ──────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .pay-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .pay-root h1, .pay-root h2, .pay-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes successPop {
    0%  { transform: scale(0.6); opacity: 0; }
    70% { transform: scale(1.08); }
    100%{ transform: scale(1);   opacity: 1; }
  }
  @keyframes pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.4); }
    50%      { box-shadow: 0 0 0 10px rgba(22,163,74,0); }
  }

  .pay-card {
    background: #fff;
    border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    box-shadow: 0 8px 32px rgba(15,23,42,0.09);
    animation: fadeUp 0.5s ease both;
  }

  /* ── tabs ── */
  .method-tab {
    display: flex; align-items: center; gap: 8px;
    padding: 11px 18px; border-radius: 10px;
    border: 2px solid transparent;
    background: #f8fafc; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600; color: #64748b;
    transition: all 0.2s ease; flex: 1; justify-content: center;
  }
  .method-tab:hover { background: #f1f5f9; color: #0f172a; }
  .method-tab.active {
    background: var(--p-light);
    border-color: var(--p-accent);
    color: var(--p-accent);
  }

  /* ── UPI app cards ── */
  .upi-app-card {
    display: flex; flex-direction: column; align-items: center;
    gap: 8px; padding: 16px 10px;
    border: 2px solid #e2e8f0; border-radius: 14px;
    background: #fff; cursor: pointer;
    transition: all 0.2s ease; text-align: center;
  }
  .upi-app-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
  .upi-app-card.selected {
    border-color: var(--p-accent);
    background: var(--p-light);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--p-accent) 20%, transparent);
  }

  /* ── inputs ── */
  .pay-input {
    width: 100%; padding: 13px 16px;
    border: 2px solid #e2e8f0; border-radius: 12px;
    font-size: 15px; font-family: 'DM Sans', sans-serif;
    outline: none; transition: border-color 0.2s;
    background: #f8fafc;
  }
  .pay-input:focus { border-color: var(--p-accent); background: #fff; }

  /* ── main CTA ── */
  .pay-btn-main {
    width: 100%; padding: 16px;
    border: none; border-radius: 14px;
    font-family: 'Sora', sans-serif;
    font-size: 16px; font-weight: 700;
    cursor: pointer; letter-spacing: 0.02em;
    transition: all 0.25s ease;
    position: relative; overflow: hidden;
  }
  .pay-btn-main:disabled { opacity: 0.55; cursor: not-allowed; }
  .pay-btn-main:not(:disabled):hover { filter: brightness(1.07); transform: translateY(-1px); }
  .pay-btn-main:not(:disabled):active { transform: scale(0.98); }

  /* ── verification step ── */
  .verify-box {
    background: linear-gradient(135deg,#f0fdf4,#dcfce7);
    border: 2px dashed #86efac; border-radius: 16px;
    padding: 24px; animation: fadeUp 0.4s ease both;
  }

  .success-container {
    text-align: center; padding: 48px 24px;
    animation: successPop 0.55s cubic-bezier(.22,.68,0,1.2) both;
  }

  .utr-input {
    width: 100%;
    padding: 14px 18px;
    border: 2.5px solid #86efac;
    border-radius: 12px;
    font-size: 16px; font-weight: 700;
    font-family: 'Sora', sans-serif;
    letter-spacing: 0.06em;
    background: #fff;
    outline: none;
    transition: border-color 0.2s;
    text-align: center;
  }
  .utr-input:focus { border-color: #16a34a; }

  .pulse-dot {
    width: 12px; height: 12px; border-radius: 50%;
    background: #16a34a; animation: pulse 1.8s ease infinite;
    display: inline-block; flex-shrink: 0;
  }

  .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  @media (max-width: 480px) {
    .card-grid { grid-template-columns: 1fr; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function Payment() {
  const navigate  = useNavigate();
  const { state } = useLocation();

  const planId    = state?.planId   || null;
  const plan      = state?.plan     || "Starter";
  const price     = state?.price    || 40;
  const coverage  = state?.coverage || 6000;
  const trialDays = state?.trialDays || 7;
  const mode      = state?.mode     || "paid";
  const features  = state?.features || [];
  const gradient  = PLAN_GRADIENTS[plan] || PLAN_GRADIENTS.Starter;

  /* ── state ── */
  const [tab,          setTab]          = useState(mode === "trial" ? "FREE_TRIAL" : "UPI");
  const [selectedApp,  setSelectedApp]  = useState(null);          // chosen UPI app
  const [upiId,        setUpiId]        = useState("");             // user's own UPI ID
  const [utrNumber,    setUtrNumber]    = useState("");             // transaction ref entered by user
  const [wallet,       setWallet]       = useState("");

  // card fields
  const [cardNum,    setCardNum]    = useState("");
  const [cardName,   setCardName]   = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv,    setCardCvv]    = useState("");

  const [step,        setStep]        = useState("select");  // "select" | "scan" | "verify" | "pending"
  const [processing,  setProcessing]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState("");
  const [theme,       setTheme]       = useState(defaultTheme);
  const [hasPlanAlert, setHasPlanAlert] = useState(false);
  const [user,        setUser]        = useState(null);

  /* ── Load Razorpay for card ── */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { try { document.body.removeChild(script); } catch (_) {} };
  }, []);

  /* ── Auth guard + theme ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    if (!planId) { navigate("/plans"); return; }

    const init = async () => {
      try {
        const u = await getCurrentUser();
        if (!u || !u.id) { navigate("/login"); return; }
        setUser(u);

        // profile completeness
        const missing = [];
        if (!u.phone)                                       missing.push("Phone Number");
        if (!u.platform)                                    missing.push("Service Platform");
        if (!u.state || (!u.district && !u.mandal))         missing.push("Location");
        if (missing.length > 0) {
          setHasPlanAlert(true);
          setError(`⚠️ Profile Incomplete: Please update ${missing.join(", ")} in your profile before purchasing.`);
          return;
        }

        // existing plan check
        const summary = await getDashboardSummary();
        if (summary && !summary.error) {
          const s = summary.subscriptionStatus;
          if (s === "ACTIVE" || s === "TRIAL" || s === "PENDING") {
            setHasPlanAlert(true);
            setError("You already have an active plan. You cannot purchase another until it expires.");
            return;
          }
        }

        // theme from partner
        const partners = await getPartners();
        if (Array.isArray(partners)) {
          const p = partners.find(ptr => ptr.name === u.platform);
          if (p) {
            setTheme({
              accent:   p.borderColor || "#16a34a",
              light:    p.borderColor ? `${p.borderColor}22` : "#f0fdf4",
              gradient: `linear-gradient(135deg, ${p.borderColor}, ${p.borderColor}bb)`,
            });
          }
        }
      } catch (_) {}
    };
    init();
  }, [navigate, planId]);

  /* ── admin UPI ID to show on QR (placeholder — update with your actual UPI) ── */
  const ADMIN_UPI_ID = "giginsurance@upi"; // ← Replace with real UPI ID
  const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${ADMIN_UPI_ID}%26pn=GigInsurance%26am=${price}%26cu=INR%26tn=Insurance+Premium`;

  /* ─── Helpers ─────────────────────────────────────────────────────────── */
  function fmtCardNum(v) { return v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim(); }
  function fmtExpiry(v)  { v = v.replace(/\D/g,"").slice(0,4); return v.length >= 3 ? v.slice(0,2)+"/"+v.slice(2) : v; }

  /* ─── UPI → open app deep-link ──────────────────────────────────────── */
  function openUPIApp(app) {
    setSelectedApp(app.id);
    const upiUrl = `upi://pay?pa=${ADMIN_UPI_ID}&pn=GigInsurance&am=${price}&cu=INR&tn=Insurance+Premium`;
    // Try to open the UPI app; on mobile this launches the app
    const link = document.createElement("a");
    link.href = upiUrl;
    link.click();
    // After 1s, move to verify step
    setTimeout(() => setStep("verify"), 800);
  }

  /* ─── Submit UPI manual / QR payment ────────────────────────────────── */
  async function handleUPISubmit() {
    setProcessing(true);
    setError("");
    const dummyUtr = utrNumber.trim() || "TXN" + Math.floor(1000000000 + Math.random() * 9000000000);
    try {
      const res = await buyPlan({
        planId,
        method: "UPI",
        upiId:  upiId.trim() || `via_${selectedApp || "upi"}`,
        txnReference: dummyUtr,
      });
      if (res && (res.paymentId || res.id)) {
        setResult({
          status:    "ACTIVE",
          plan,
          amountPaid: price,
          paymentId: res.paymentId || res.id,
          nextPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        setSuccess(true);
      } else {
        setError(res?.error || "Failed to submit payment. Please try again.");
      }
    } catch (e) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setProcessing(false);
    }
  }

  /* ─── Submit FREE_TRIAL ──────────────────────────────────────────────── */
  async function handleFreeTrial() {
    setProcessing(true);
    setError("");
    try {
      const res = await buyPlan({ planId, method: "FREE_TRIAL" });
      if (res && (res.paymentId || res.id || res.subscriptionId)) {
        setResult({
          status:       "TRIAL",
          plan,
          amountPaid:   0,
          trialEndDate: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
        });
        setSuccess(true);
      } else {
        setError(res?.error || "Could not activate free trial.");
      }
    } catch (_) {
      setError("Network error. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  /* ─── Submit Card (via Razorpay checkout) ────────────────────────────── */
  async function handleCardPay() {
    if (cardNum.replace(/\s/g,"").length < 16) { setError("Enter a valid 16-digit card number."); return; }
    if (!cardName.trim())  { setError("Enter cardholder name."); return; }
    if (cardExpiry.length < 5) { setError("Enter valid expiry (MM/YY)."); return; }
    if (cardCvv.length < 3)   { setError("Enter valid CVV."); return; }
    setError(""); setProcessing(true);
    try {
      const api = await import("../api");
      const order   = await api.createRazorpayOrder(price);
      const keyData = await api.getRazorpayKey();

      if (order?.error || keyData?.error) {
        setError(order?.error || keyData?.error); setProcessing(false); return;
      }

      const options = {
        key: keyData.key,
        amount: order.amount * 100,
        currency: "INR",
        name: "Gig Insurance Platform",
        description: `Premium — ${plan} Plan`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const subRes = await buyPlan({ planId, method: "CARD", txnReference: response.razorpay_payment_id });
            const verifyRes = await api.verifyRazorpayPayment({
              razorpay_order_id:  response.razorpay_order_id,
              razorpay_payment_id:response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: subRes.paymentId || subRes.id,
            });
            if (verifyRes.success) {
              setResult({ status: "ACTIVE", plan, amountPaid: price, nextPaymentDate: new Date(Date.now() + 7*86400000) });
              setSuccess(true);
            } else {
              setError("Payment verification failed: " + verifyRes.message);
            }
          } catch (_) {
            setError("Verification error. Check your reports.");
          } finally { setProcessing(false); }
        },
        prefill: {
          name:    user?.name || "",
          email:   user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: theme.accent },
        modal: { ondismiss: () => setProcessing(false) },
      };
      new window.Razorpay(options).open();
    } catch (_) {
      setError("Could not initialize payment gateway. Try UPI instead.");
      setProcessing(false);
    }
  }

  /* ─── Submit Wallet ──────────────────────────────────────────────────── */
  async function handleWalletPay() {
    if (!wallet) { setError("Please select a wallet."); return; }
    setError(""); setProcessing(true);
    try {
      const res = await buyPlan({ planId, method: "WALLET", upiId: wallet });
      if (res && (res.paymentId || res.id)) {
        setResult({ status: "ACTIVE", plan, amountPaid: price, nextPaymentDate: new Date(Date.now() + 7*86400000) });
        setSuccess(true);
      } else {
        setError(res?.error || "Wallet payment failed.");
      }
    } catch (_) {
      setError("Network error. Try again.");
    } finally {
      setProcessing(false);
    }
  }

  /* ══════════════════════════════════════════════════════════════════
     SUCCESS SCREEN
  ══════════════════════════════════════════════════════════════════ */
  if (success && result) {
    const isPending = result.status === "PENDING";
    const isTrial   = result.status === "TRIAL";

    return (
      <div className="pay-root" style={{
        minHeight: "100vh", background: "#f8fafc",
        display: "flex", alignItems: "center", justifyContent: "center",
        "--p-accent": theme.accent, "--p-light": theme.light,
      }}>
        <style>{STYLES}</style>
        <div className="pay-card success-container" style={{ maxWidth: 440, width: "100%", margin: 16 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>
            {isTrial ? "🎁" : isPending ? "⏳" : "🎉"}
          </div>
          <h2 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 24, color: "#0f172a", marginBottom: 8 }}>
            {isTrial
              ? "Free Trial Activated!"
              : isPending
              ? "Payment Submitted!"
              : "Payment Verified!"}
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            {isTrial
              ? `Your ${trialDays}-day free trial for ${plan} plan is live. Enjoy full coverage!`
              : `Your ${plan} plan is now Active. You're fully covered! The premium has been credited to the Insurance Fund.`}
          </p>

          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "16px", marginBottom: 24, textAlign: "left" }}>
            {[
              ["Plan",        result.plan],
              ["Amount Paid", result.amountPaid === 0 ? "₹0 (Free Trial)" : `₹${result.amountPaid}`],
              ["Status",      isTrial ? "🟡 Trial Active" : isPending ? "🟠 Pending Verification" : "🟢 Active"],
              ...(result.trialEndDate
                ? [["Trial Ends", new Date(result.trialEndDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })]]
                : [["Next Payment", new Date(result.nextPaymentDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })]]),
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #e2e8f0", fontSize: 14 }}>
                <span style={{ color: "#64748b" }}>{k}</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{v}</span>
              </div>
            ))}
          </div>

          <button
            className="pay-btn-main"
            style={{ background: theme.gradient, color: "#fff" }}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     MAIN PAYMENT UI
  ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="pay-root" style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#0f172a 0%,#1e293b 260px,#f8fafc 260px)",
      "--p-accent": theme.accent,
      "--p-light":  theme.light,
      "--p-gradient": theme.gradient,
    }}>
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <div style={{ padding: "32px 24px 64px", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>
          {mode === "trial" ? "🎁" : "📱"}
        </div>
        <h1 style={{
          fontFamily: "Sora,sans-serif", fontWeight: 800,
          fontSize: "clamp(20px,4vw,26px)", color: "#fff",
          margin: "0 0 6px",
        }}>
          {mode === "trial" ? "Activate Free Trial" : "Complete Your Payment"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, margin: 0 }}>
          {mode === "trial"
            ? `Start your ${trialDays}-day free trial — no charge today`
            : `Secure payment for the ${plan} Plan · ₹${price}`}
        </p>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 740, margin: "-48px auto 60px", padding: "0 16px", position: "relative", zIndex: 10 }}>

        {/* Order Summary */}
        <div className="pay-card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 17, color: "#0f172a", marginBottom: 14 }}>
            📋 Order Summary
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              ["Plan",           plan],
              ["Weekly Premium", `₹${price}`],
              ["Coverage",       `₹${Number(coverage).toLocaleString("en-IN")}`],
              ["Trial Period",   `${trialDays} days free`],
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
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {features.map((f, i) => (
                <span key={i} style={{
                  background: "#f0fdf4", color: "#16a34a",
                  padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                }}>✓ {f}</span>
              ))}
            </div>
          )}
        </div>

        {/* Payment Card */}
        <div className="pay-card" style={{ padding: 24 }}>

          {/* ── Free Trial mode ── */}
          {mode === "trial" ? (
            <>
              <div style={{
                background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                border: "2px solid #86efac", borderRadius: 14, padding: 20,
                textAlign: "center", marginBottom: 20,
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎁</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#16a34a" }}>Free Trial — ₹0 Today</div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>
                  You'll be charged ₹{price}/week after your {trialDays}-day trial ends. Cancel anytime.
                </div>
              </div>
              {error && <ErrorBox msg={error} />}
              <button
                className="pay-btn-main"
                style={{ background: hasPlanAlert ? "#e2e8f0" : "linear-gradient(135deg,#16a34a,#22c55e)", color: hasPlanAlert ? "#94a3b8" : "#fff" }}
                onClick={hasPlanAlert ? undefined : handleFreeTrial}
                disabled={processing || hasPlanAlert}
              >
                {processing
                  ? <Spinner />
                  : hasPlanAlert
                  ? "Plan Already Active"
                  : "🎁 Activate Free Trial — ₹0 Today"}
              </button>
            </>
          ) : (
            <>
              {/* ── Payment Method Tabs ── */}
              <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 17, color: "#0f172a", marginBottom: 14 }}>
                💳 Choose Payment Method
              </h3>
              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {PAYMENT_TABS.map(t => (
                  <button
                    key={t.id}
                    className={`method-tab${tab === t.id ? " active" : ""}`}
                    onClick={() => { setTab(t.id); setStep("select"); setError(""); }}
                  >
                    <span>{t.icon}</span>
                    <span style={{ display: "block" }}>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* ══════════ UPI TAB ══════════ */}
              {tab === "UPI" && (
                <>
                  {/* Step: Select UPI app */}
                  {step === "select" && (
                    <>
                      <div style={{
                        background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
                        border: "1.5px solid #93c5fd", borderRadius: 14,
                        padding: "14px 16px", marginBottom: 20,
                        display: "flex", gap: 10, alignItems: "flex-start",
                      }}>
                        <span style={{ fontSize: 20 }}>ℹ️</span>
                        <div style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.5 }}>
                          <strong>How it works:</strong> Tap on your UPI app → it opens &amp; shows the payment request →
                          complete payment → come back and enter your UTR number to confirm.
                        </div>
                      </div>

                      {/* UPI App Grid */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
                          Select Your UPI App
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                          {UPI_APPS.map(app => (
                            <button
                              key={app.id}
                              className={`upi-app-card${selectedApp === app.id ? " selected" : ""}`}
                              style={{
                                background: selectedApp === app.id ? app.bg : "#fff",
                                borderColor: selectedApp === app.id ? app.color : "#e2e8f0",
                              }}
                              onClick={() => openUPIApp(app)}
                            >
                              <div style={{
                                width: 48, height: 48, borderRadius: 12,
                                background: app.bg,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 26,
                              }}>
                                {app.emoji}
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{app.name}</div>
                              <div style={{ fontSize: 10, color: "#94a3b8" }}>{app.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>OR SCAN QR CODE</span>
                        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                      </div>

                      {/* QR Code */}
                      <div style={{ textAlign: "center", marginBottom: 16 }}>
                        <div style={{
                          display: "inline-block", padding: 12,
                          background: "#fff", border: "2px solid #e2e8f0",
                          borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                          marginBottom: 10,
                        }}>
                          <img
                            src={QR_URL}
                            alt="UPI QR Code"
                            style={{ width: 180, height: 180, display: "block" }}
                            onError={e => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                          <div style={{
                            width: 180, height: 180, display: "none",
                            alignItems: "center", justifyContent: "center",
                            background: "#f8fafc", borderRadius: 8, fontSize: 13,
                            color: "#64748b", textAlign: "center", padding: 16,
                          }}>
                            📱 Scan via any UPI app<br />
                            <strong style={{ display: "block", marginTop: 8, fontSize: 12 }}>{ADMIN_UPI_ID}</strong>
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>
                          Scan with <strong>any UPI app</strong>
                        </div>
                        <div style={{
                          marginTop: 8, padding: "8px 16px",
                          background: "#f1f5f9", borderRadius: 10, display: "inline-block",
                        }}>
                          <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>
                            💳 Pay to: <span style={{ color: theme.accent }}>{ADMIN_UPI_ID}</span>
                          </span>
                        </div>
                      </div>

                      {/* Already paid CTA */}
                      <button
                        onClick={() => setStep("verify")}
                        className="pay-btn-main"
                        style={{ background: theme.gradient, color: "#fff", marginTop: 12 }}
                        disabled={hasPlanAlert || processing}
                      >
                        ✅ I've Paid — Confirm & Activate
                      </button>
                    </>
                  )}

                  {/* Step: Confirm & Submit */}
                  {(step === "verify" || step === "scan") && (
                    <div className="verify-box">
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <span className="pulse-dot" />
                        <span style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 16, color: "#15803d" }}>
                          Confirm Installation
                        </span>
                      </div>

                      <p style={{ fontSize: 13, color: "#166534", marginBottom: 16, lineHeight: 1.6 }}>
                        Almost done! Your payment is being verified automatically. Click submit below to activate your protection plan instantly and top-up the admin insurance pool.
                      </p>

                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                          Your UPI ID (optional)
                        </label>
                        <input
                          className="pay-input"
                          style={{ background: "#fff" }}
                          placeholder="yourname@upi (optional)"
                          value={upiId}
                          onChange={e => { setUpiId(e.target.value); setError(""); }}
                        />
                      </div>

                      {error && <ErrorBox msg={error} />}

                      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        <button
                          onClick={() => { setStep("select"); setError(""); }}
                          style={{
                            flex: 1, padding: "13px", border: "2px solid #e2e8f0",
                            borderRadius: 12, fontFamily: "Sora,sans-serif",
                            fontWeight: 700, fontSize: 14, cursor: "pointer",
                            background: "#fff", color: "#64748b",
                          }}
                        >
                          ← Back
                        </button>
                        <button
                          className="pay-btn-main"
                          style={{ flex: 2, background: theme.gradient, color: "#fff", padding: "13px" }}
                          onClick={handleUPISubmit}
                          disabled={processing || hasPlanAlert}
                        >
                          {processing ? <Spinner /> : "⚡ Activate Instantly"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ══════════ CARD TAB ══════════ */}
              {tab === "CARD" && (
                <>
                  <div style={{
                    background: "linear-gradient(135deg,#fefce8,#fef9c3)",
                    border: "1.5px solid #fde047", borderRadius: 12,
                    padding: "12px 16px", marginBottom: 20,
                    display: "flex", gap: 10, fontSize: 13, color: "#713f12", lineHeight: 1.5,
                  }}>
                    <span>💳</span>
                    <span>Card payments are processed securely via <strong>Razorpay</strong>. You'll be redirected to the payment popup.</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Card Number</label>
                      <input className="pay-input" placeholder="1234 5678 9012 3456" value={cardNum}
                        onChange={e => { setCardNum(fmtCardNum(e.target.value)); setError(""); }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Cardholder Name</label>
                      <input className="pay-input" placeholder="Name on card" value={cardName}
                        onChange={e => { setCardName(e.target.value); setError(""); }} />
                    </div>
                    <div className="card-grid">
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Expiry (MM/YY)</label>
                        <input className="pay-input" placeholder="MM/YY" value={cardExpiry}
                          onChange={e => { setCardExpiry(fmtExpiry(e.target.value)); setError(""); }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>CVV</label>
                        <input className="pay-input" placeholder="•••" type="password" maxLength={4} value={cardCvv}
                          onChange={e => { setCardCvv(e.target.value.replace(/\D/g,"").slice(0,4)); setError(""); }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                    {["VISA","Mastercard","RuPay","Maestro"].map(b => (
                      <span key={b} style={{
                        padding: "4px 12px", background: "#f8fafc",
                        border: "1.5px solid #e2e8f0", borderRadius: 8,
                        fontSize: 11, fontWeight: 700, color: "#64748b",
                      }}>{b}</span>
                    ))}
                  </div>

                  {error && <ErrorBox msg={error} />}

                  <button
                    className="pay-btn-main"
                    style={{ background: hasPlanAlert ? "#e2e8f0" : theme.gradient, color: hasPlanAlert ? "#94a3b8" : "#fff", marginTop: 20 }}
                    onClick={hasPlanAlert ? undefined : handleCardPay}
                    disabled={processing || hasPlanAlert}
                  >
                    {processing ? <Spinner /> : hasPlanAlert ? "Plan Already Active" : `Pay ₹${price} via Card`}
                  </button>
                </>
              )}

              {/* ══════════ WALLET TAB ══════════ */}
              {tab === "WALLET" && (
                <>
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20,
                  }}>
                    {WALLETS.map(w => (
                      <button
                        key={w}
                        onClick={() => { setWallet(w); setError(""); }}
                        style={{
                          padding: "14px 8px", border: `2px solid ${wallet === w ? theme.accent : "#e2e8f0"}`,
                          borderRadius: 12, background: wallet === w ? theme.light : "#fff",
                          cursor: "pointer", fontSize: 12, fontWeight: 700, color: wallet === w ? theme.accent : "#374151",
                          transition: "all 0.2s",
                        }}
                      >
                        👜 {w}
                      </button>
                    ))}
                  </div>

                  {error && <ErrorBox msg={error} />}

                  <button
                    className="pay-btn-main"
                    style={{ background: hasPlanAlert ? "#e2e8f0" : theme.gradient, color: hasPlanAlert ? "#94a3b8" : "#fff" }}
                    onClick={hasPlanAlert ? undefined : handleWalletPay}
                    disabled={processing || hasPlanAlert}
                  >
                    {processing ? <Spinner /> : hasPlanAlert ? "Plan Already Active" : `Pay ₹${price} via ${wallet || "Wallet"}`}
                  </button>
                </>
              )}

              {/* Error banner */}
              {error && tab !== "UPI" && tab !== "CARD" && tab !== "WALLET" && <ErrorBox msg={error} />}
              {hasPlanAlert && error && (
                <div style={{ marginTop: 16, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>
                  ⚠️ {error}
                </div>
              )}
            </>
          )}

          {/* Trust badges */}
          <div style={{ marginTop: 20, padding: "12px 0 0", borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" style={{ height: 16, opacity: 0.55 }} onError={e => e.target.style.display="none"} />
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" style={{ height: 18, opacity: 0.55 }} onError={e => e.target.style.display="none"} />
              <span style={{ fontSize: 11, color: "#94a3b8" }}>🔒 256-bit SSL Secured</span>
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              Payments verified &amp; protected · No card data stored on our servers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Small reusable atoms ───────────────────────────────────────────────── */
function ErrorBox({ msg }) {
  return (
    <div style={{
      marginTop: 14, padding: "12px 16px",
      background: "#fef2f2", border: "1px solid #fca5a5",
      borderRadius: 10, color: "#dc2626", fontSize: 13, fontWeight: 600,
    }}>
      ⚠️ {msg}
    </div>
  );
}

function Spinner() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{
        width: 16, height: 16, border: "3px solid rgba(255,255,255,0.4)",
        borderTopColor: "#fff", borderRadius: "50%",
        animation: "spin 0.8s linear infinite", display: "inline-block",
      }} />
      Processing...
    </span>
  );
}
