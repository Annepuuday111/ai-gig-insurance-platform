import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminListUsers,
  adminDeleteUser,
  adminListPlans,
  adminUpdatePlan,
  adminListPayments,
  adminApprovePayment,
  adminRejectPayment,
  adminDeletePayment,
  adminListQueries,
  adminReplyQuery,
  adminChangeCredentials,
  getPartners,
  adminAddPartner,
  adminDeletePartner,
  adminListClaimRequests,
  adminApproveClaimRequest,
  adminRejectClaimRequest,
  adminGetWallet,
} from "../api";
import adminBanner from "../../../assets/adminbanner.png";
import {
  FaShieldAlt, FaTachometerAlt, FaUsers, FaClipboardCheck,
  FaQuestionCircle, FaClipboardList, FaMoneyBillWave, FaCog,
  FaSignOutAlt, FaCheckCircle, FaTimesCircle, FaHourglassHalf,
  FaEnvelope, FaPhone, FaTrashAlt, FaReply, FaLock,
  FaUserEdit, FaIdBadge, FaKey, FaSave, FaChevronRight,
  FaBell, FaUserCircle, FaBars, FaTimes,
  FaPlus, FaGlobe, FaBuilding, FaLink,
  FaCloudRain, FaWallet, FaArrowUp, FaArrowDown,
  FaSeedling, FaLightbulb, FaRocket, FaCrown,
} from "react-icons/fa";

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */

function ReplyForm({ onReply }) {
  const [text, setText] = useState("");
  return (
    <div className="mt-4 bg-green-50 rounded-xl p-4 border border-green-100">
      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <FaReply className="text-green-500" /> Write Reply
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white resize-none"
        placeholder="Type your answer here…"
      />
      <button
        onClick={() => { if (text.trim()) { onReply(text); setText(""); } }}
        className="mt-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center gap-2 font-medium"
      >
        <FaReply className="text-xs" /> Send Reply
      </button>
    </div>
  );
}

function StatCard({ icon, label, value, bgColor, iconColor, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-all border border-gray-100">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 ${bgColor} rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-sm shrink-0`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{sub}</p>}
      </div>
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const map = {
    PENDING: "bg-amber-50 text-amber-600 border border-amber-200",
    APPROVED: "bg-green-50 text-green-600 border border-green-200",
    REJECTED: "bg-red-50   text-red-500   border border-red-200",
  };
  const icons = { PENDING: <FaHourglassHalf />, APPROVED: <FaCheckCircle />, REJECTED: <FaTimesCircle /> };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {icons[status]} {status}
    </span>
  );
};

// Global styles for specific elements
const globalStyles = `
  .banner-content { bottom: 110px; }
  @media (max-width: 640px) { .banner-content { bottom: 75px; } }

  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// Inject global styles once
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = globalStyles;
  document.head.appendChild(styleSheet);
}

function Avatar({ name }) {
  const str = name || "?";
  const initials = str.includes("@")
    ? str[0].toUpperCase()
    : str.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-rose-400"];
  const color = colors[str.charCodeAt(0) % colors.length];
  return (
    <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function InputField({ label, icon, type = "text", value, onChange, placeholder, errorMsg, successMsg }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
        {icon} {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-sm">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 focus:bg-white
            ${errorMsg ? "border-red-200 focus:ring-red-300 bg-red-50" : "border-gray-200 focus:ring-green-400"}`}
        />
      </div>
      {errorMsg && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><FaTimesCircle /> {errorMsg}</p>}
      {successMsg && <p className="text-xs text-green-500 mt-1.5 flex items-center gap-1"><FaCheckCircle /> {successMsg}</p>}
    </div>
  );
}

function getUsageStats(date) {
  if (!date) return { duration: "N/A", totalHours: "0.0" };
  const start = new Date(date);
  const now = new Date();
  const diffMs = Math.max(0, now - start); // Handle slight clock drifts
  const hours = diffMs / (1000 * 60 * 60);
  
  let duration = "";
  const totalHoursInt = Math.floor(hours);
  
  if (totalHoursInt < 24) {
    if (totalHoursInt < 1) {
      const mins = Math.floor(diffMs / (1000 * 60));
      duration = mins < 1 ? "Just joined" : `${mins}m active`;
    } else {
      const remMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      duration = `${totalHoursInt}h ${remMins}m active`;
    }
  } else {
    const days = Math.floor(totalHoursInt / 24);
    const remHours = totalHoursInt % 24;
    if (days < 7) {
      duration = `${days}d ${remHours}h active`;
    } else if (days < 30) {
      duration = `${days}d active`;
    } else {
      const months = Math.floor(days / 30);
      duration = months < 12 ? `${months}mo active` : `${Math.floor(months / 12)}y active`;
    }
  }
  
  return { 
    duration, 
    totalHours: hours.toFixed(1) 
  };
}

/* ══════════════════════════════════════════
   NAV CONFIG
══════════════════════════════════════════ */

const NAV_ITEMS = [
  { key: "overview",  label: "Dashboard",         icon: <FaTachometerAlt /> },
  { key: "users",     label: "Active Users",       icon: <FaUsers /> },
  { key: "approvals", label: "Insurance Approvals", icon: <FaClipboardCheck /> },
  { key: "queries",   label: "Worker Queries",     icon: <FaQuestionCircle /> },
  { key: "plans",     label: "Premium Plans",      icon: <FaClipboardList /> },
  { key: "payments",  label: "Payments History",   icon: <FaMoneyBillWave /> },
  { key: "wallet",    label: "Admin Wallet",       icon: <FaWallet /> },
  { key: "disaster",  label: "Disaster Claims",    icon: <FaCloudRain /> },
  { key: "partners",  label: "Partner Platforms",  icon: <FaGlobe /> },
  { key: "settings",  label: "Settings",           icon: <FaCog /> },
];

const PAGE_META = {
  users:     { title: "User Management",      subtitle: "View and manage all registered users",               icon: <FaUsers />,          color: "bg-blue-500" },
  approvals: { title: "Insurance Approvals",  subtitle: "Review and approve insurance payment requests",       icon: <FaClipboardCheck />, color: "bg-amber-500" },
  queries:   { title: "User Queries",         subtitle: "Respond to questions from your users",               icon: <FaQuestionCircle />, color: "bg-violet-500" },
  plans:     { title: "Plan Management",      subtitle: "Edit and update insurance plan pricing",              icon: <FaClipboardList />,  color: "bg-teal-500" },
  payments:  { title: "Payment Records",      subtitle: "Track all payment transactions",                      icon: <FaMoneyBillWave />,  color: "bg-emerald-500" },
  wallet:    { title: "Admin Wallet",         subtitle: "Insurance fund balance and transaction ledger",        icon: <FaWallet />,         color: "bg-indigo-600" },
  disaster:  { title: "Disaster Claims",      subtitle: "Review and approve situation-based requests",         icon: <FaCloudRain />,      color: "bg-indigo-500" },
  partners:  { title: "Partner Platforms",   subtitle: "Manage the supported application platforms",          icon: <FaGlobe />,          color: "bg-indigo-500" },
  settings:  { title: "Account Settings",    subtitle: "Manage your admin profile and credentials",           icon: <FaCog />,            color: "bg-slate-500" },
};

/* ══════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════ */

function AdminSidebar({ section, setSection, onLogout, pendingCount, unansweredCount, pendingClaims, open, onClose }) {
  const badges = { approvals: pendingCount, queries: unansweredCount, disaster: pendingClaims };

  const handleNav = (key) => {
    setSection(key);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 shadow-lg flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:shadow-sm lg:z-10
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow text-base">
              <FaShieldAlt />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">Gig Insurance</p>
              <p className="text-xs font-semibold text-emerald-500 tracking-widest uppercase">Admin Panel</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => handleNav(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-medium
                ${section === key
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
            >
              <span className="text-base shrink-0">{icon}</span>
              <span className="flex-1 text-left">{label}</span>
              {badges[key] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center
                  ${section === key ? "bg-white/25 text-white" : "bg-red-100 text-red-500"}`}>
                  {badges[key]}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 transition text-sm font-medium"
          >
            <FaSignOutAlt className="text-base" /> Logout
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-300">© 2026 Gig Insurance · Admin v1.0</p>
        </div>
      </aside>
    </>
  );
}

/* ══════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════ */

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [replies, setReplies]     = useState({});
  const [queries, setQueries]     = useState([]);
  const [claimRequests, setClaimRequests] = useState([]);
  const [partners, setPartners]   = useState([]);
  const [adminWallet, setAdminWallet] = useState({ walletBalance: 0, transactions: [], totalCredits: 0, totalDebits: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: "", logoUrl: "", dashboardBannerUrl: "", profileBannerUrl: "", borderColor: "#E2E8F0" });
  const [adminInfo, setAdminInfo] = useState({ email: "admin@giginsurance.com", username: "Admin" });
  const [settings, setSettings] = useState({ email: "", username: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState(null);
  const [msgType, setMsgType] = useState("success");
  const [loading, setLoading] = useState(true);
  
  const carouselRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin");
    if (!token || isAdmin !== "true") { navigate("/login"); return; }
    loadAll();
  }, []);

  useEffect(() => {
    if (section !== "overview" || partners.length <= 1) return;
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carouselRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [section, partners.length]);

  useEffect(() => {
    if (section === "users") loadUsers();
    if (section === "plans") loadPlans();
    if (section === "payments" || section === "approvals") loadPayments();
    if (section === "queries") loadQueries();
    if (section === "partners") loadPartners();
    if (section === "disaster") loadClaimRequests();
    if (section === "wallet") loadWallet();
  }, [section]);

  const safeLoad = (fn, setter) => async () => {
    try {
      const res = await fn();
      if (res?.error) { navigate("/login"); return; }
      setter(Array.isArray(res) ? res : []);
    } catch (e) { console.error(e); }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadUsers(), loadPlans(), loadPayments(), loadQueries(), loadPartners(), loadClaimRequests(), loadWallet()]);
    setLoading(false);
  };
  const loadUsers = safeLoad(adminListUsers, setUsers);
  const loadPlans = safeLoad(adminListPlans, setPlans);
  const loadPayments = safeLoad(adminListPayments, setPayments);
  const loadQueries = safeLoad(adminListQueries, setQueries);
  const loadPartners = safeLoad(getPartners, setPartners);
  const loadClaimRequests = safeLoad(adminListClaimRequests, setClaimRequests);
  const loadWallet = async () => {
    try {
      const res = await adminGetWallet();
      if (res && !res.error) setAdminWallet(res);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => { if (!window.confirm("Delete this user?")) return; await adminDeleteUser(id); loadUsers(); };
  const handleApprove = async (id) => { 
    try {
      const res = await adminApprovePayment(id);
      if (res?.error) throw new Error(res.error);
      await loadPayments(); 
      showMsg("Payment approved!"); 
    } catch(err) {
      showMsg(err.message || "Failed to approve payment", "error");
    }
  };
  const handleReject = async (id) => { if (!window.confirm("Reject this payment?")) return; await adminRejectPayment(id); await loadPayments(); showMsg("Payment rejected", "error"); };

  const handleApproveClaimReq = async (id) => { await adminApproveClaimRequest(id); loadClaimRequests(); showMsg("Claim request approved!"); };
  const handleRejectClaimReq = async (id) => { if (!window.confirm("Reject this request?")) return; await adminRejectClaimRequest(id); loadClaimRequests(); showMsg("Claim request rejected", "error"); };

  const handleReply = async (id, answer) => { await adminReplyQuery(id, { answer }); loadQueries(); showMsg("Reply sent!"); };

  const handlePartnerDelete = async (id) => { if (!window.confirm("Delete this partner?")) return; await adminDeletePartner(id); loadPartners(); showMsg("Partner deleted!"); };
  const handlePaymentDelete = async (id) => { if (!window.confirm("Delete this payment record?")) return; await adminDeletePayment(id); loadPayments(); showMsg("Payment deleted!"); };
  
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPartner(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePartnerAdd = async () => {
    if (!newPartner.name || !newPartner.logoUrl || !newPartner.profileBannerUrl || !newPartner.dashboardBannerUrl) { 
      showMsg("Name, Logo, and Banners are required", "error"); 
      return; 
    }
    await adminAddPartner(newPartner);
    setNewPartner({ name: "", logoUrl: "", dashboardBannerUrl: "", profileBannerUrl: "", borderColor: "#E2E8F0" });
    loadPartners();
    showMsg("Partner added successfully!");
  };

  const handlePlanChange = (idx, field, value) => {
    const copy = [...plans]; copy[idx][field] = value; setPlans(copy);
  };
  const handleSavePlan = async (id, plan) => {
    await adminUpdatePlan(id, { weeklyPremium: plan.weeklyPremium, coverageAmount: plan.coverageAmount }); 
    showMsg("Plan updated successfully!"); loadPlans();
  };

  const handleSettingsSave = async () => {
    if (settings.password && settings.password !== settings.confirmPassword) {
      showMsg("Passwords do not match!", "error"); return;
    }
    try {
      const payload = {};
      if (settings.email) payload.email = settings.email;
      if (settings.username) payload.username = settings.username;
      if (settings.password) payload.password = settings.password;
      const res = await adminChangeCredentials(payload);
      showMsg(res.message || "Credentials updated successfully!");
      if (res.token) localStorage.setItem("token", res.token);
      if (settings.email) setAdminInfo(p => ({ ...p, email: settings.email }));
      if (settings.username) setAdminInfo(p => ({ ...p, username: settings.username }));
      setSettings({ email: "", username: "", password: "", confirmPassword: "" });
    } catch { showMsg("Failed to update credentials", "error"); }
  };

  const showMsg = (msg, type = "success") => {
    setMessage(msg); setMsgType(type);
    setTimeout(() => setMessage(null), 3500);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  const pendingApprovals = payments.filter(p => p.status === "PENDING").length;
  const unansweredQ = queries.filter(q => !q.answer).length;
  const pendingClaimReqs = claimRequests.filter(c => c.status === "PENDING").length;

  /* ══════════════════════════════════════
     SECTION: OVERVIEW
  ══════════════════════════════════════ */
  const renderOverview = () => (
    <>
      {/* Banner — overview only, using adminbanner image */}
      <div className="relative w-full rounded-2xl overflow-hidden mb-6 shadow-sm bg-green-600 h-40 sm:h-48 lg:h-56">
        {/* Banner image — covers full area, object-cover for all screens */}
        <img
          src={adminBanner}
          alt="Admin Banner"
          className="absolute inset-0 w-full h-full object-cover object-center"
          draggable={false}
        />
        {/* Dark overlay so text stays readable over any image */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 sm:px-8 py-6 sm:py-8">
          <div>
            <p className="text-green-200 text-xs font-semibold uppercase tracking-[0.18em] mb-1.5">
              Welcome back, Admin
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mb-2 drop-shadow">
              Admin Dashboard
            </h1>
            <p className="text-gray-200 text-sm">
              Here's what's happening on your platform today.
            </p>
          </div>

          <div className="shrink-0">
            <div className="inline-flex items-center gap-3 bg-black/30 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <FaBell className="text-white text-sm" />
              </div>
              <div>
                <p className="text-gray-300 text-xs">Pending actions</p>
                <p className="text-2xl font-black text-white leading-none">{pendingApprovals + unansweredQ + pendingClaimReqs}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3">
        <StatCard icon={<FaUsers />} label="Total Users" value={users.length} bgColor="bg-blue-50" iconColor="text-blue-500" sub="Registered accounts" />
        <StatCard icon={<FaClipboardList />} label="Active Plans" value={plans.length} bgColor="bg-teal-50" iconColor="text-teal-500" sub="Insurance plans" />
        <StatCard icon={<FaGlobe />} label="Platforms" value={partners.length} bgColor="bg-indigo-50" iconColor="text-indigo-500" sub="Supported partners" />
        <StatCard icon={<FaWallet />} label="Total Funds" value={`₹${(adminWallet.walletBalance || 0).toLocaleString("en-IN")}`} bgColor="bg-emerald-50" iconColor="text-emerald-500" sub="Combined admin wallet" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard icon={<FaHourglassHalf />} label="Pending" value={pendingApprovals + pendingClaimReqs} bgColor="bg-amber-50" iconColor="text-amber-500" sub="Awaiting approval" />
        <StatCard icon={<FaCheckCircle />} label="Approved" value={payments.filter(p => p.status === "APPROVED").length + claimRequests.filter(c => c.status === "APPROVED").length} bgColor="bg-green-50" iconColor="text-green-500" sub="Successfully processed" />
        <StatCard icon={<FaTimesCircle />} label="Rejected" value={payments.filter(p => p.status === "REJECTED").length + claimRequests.filter(c => c.status === "REJECTED").length} bgColor="bg-red-50" iconColor="text-red-500" sub="Declined requests" />
        <StatCard icon={<FaMoneyBillWave />} label="Transactions" value={payments.length} bgColor="bg-slate-50" iconColor="text-slate-500" sub="Total records" />
      </div>

      {/* Mini tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-5">
        {/* Recent users */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center"><FaUsers className="text-blue-500 text-xs" /></span>
              Recent Users
            </h3>
            <button onClick={() => setSection("users")} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-0.5 font-medium">
              View all <FaChevronRight className="text-[10px]" />
            </button>
          </div>
          <div>
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                <Avatar name={u.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 text-sm truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <p className="text-xs text-gray-400 hidden sm:block shrink-0">{u.phone}</p>
              </div>
            ))}
            {users.length === 0 && <p className="px-5 py-8 text-center text-gray-300 text-sm">No users yet</p>}
          </div>
        </div>

        {/* Pending approvals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <span className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center"><FaHourglassHalf className="text-amber-500 text-xs" /></span>
              Pending Approvals
            </h3>
            <button onClick={() => setSection("approvals")} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-0.5 font-medium">
              View all <FaChevronRight className="text-[10px]" />
            </button>
          </div>
          <div>
            {payments.filter(p => p.status === "PENDING").slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                <Avatar name={p.user?.email} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 text-sm truncate">{p.user?.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-gray-700 text-sm">₹{p.amount}</span>
                  <button onClick={() => handleApprove(p.id)} className="px-2.5 py-1 bg-green-50 text-green-600 hover:bg-green-100 text-xs rounded-lg font-medium transition border border-green-200">
                    Approve
                  </button>
                </div>
              </div>
            ))}
            {pendingApprovals === 0 && <p className="px-5 py-8 text-center text-gray-300 text-sm">All caught up 🎉</p>}
          </div>
        </div>

        {/* Top Platforms Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center"><FaGlobe className="text-indigo-500 text-xs" /></span>
              Platform Usage
            </h3>
            <button onClick={() => setSection("partners")} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-0.5 font-medium">
              View all <FaChevronRight className="text-[10px]" />
            </button>
          </div>
          <div className="flex-1 relative bg-gray-50/50 min-h-[380px]">
            {partners.length > 0 ? (
              <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar h-full absolute inset-0 items-center" style={{ scrollBehavior: "smooth" }}>
                {partners.map(p => {
                  const count = users.filter(u => u.platform === p.name).length;
                  const percent = users.length ? Math.round((count / users.length) * 100) : 0;
                  return { ...p, count, percent };
                }).sort((a, b) => b.count - a.count).map((p, i) => (
                  <div key={p.id} className="w-full h-full shrink-0 snap-center flex flex-col items-center justify-center p-6" style={{ minWidth: "100%" }}>
                    <div className="w-32 h-32 bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex items-center justify-center shrink-0 mb-6 transition-transform hover:scale-105">
                      <img src={p.logoUrl} alt={p.name} className="w-full h-full object-contain" onError={e => e.target.style.display="none"} />
                    </div>
                    
                    <div className="text-center w-full max-w-[240px]">
                      <h4 className="text-gray-800 font-extrabold text-2xl truncate leading-tight mb-3 px-2">{p.name}</h4>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm mb-6 w-full justify-center" style={{ background: p.borderColor ? `${p.borderColor}15` : '#f1f5f9', color: p.borderColor || '#64748b' }}>
                        <FaUsers className="text-lg" /> 
                        <span>{p.count} Active User{p.count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    <div className="w-full max-w-[280px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Usage Share</span>
                        <span className="text-sm font-black text-gray-700">{p.percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100/80 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p.percent}%`, background: p.borderColor || '#16a34a' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-12 text-center text-gray-300 text-sm h-full flex items-center justify-center">No platforms yet</p>
            )}
            
            {/* Scroll Indicator */}
            {partners.length > 1 && (
              <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1.5 pb-2 pointer-events-none">
                {partners.map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {unansweredQ > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-amber-500 shrink-0"><FaQuestionCircle /></div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-800 text-sm">Unanswered Queries</p>
            <p className="text-xs text-amber-600">You have <strong>{unansweredQ}</strong> pending {unansweredQ === 1 ? "query" : "queries"}.</p>
          </div>
          <button onClick={() => setSection("queries")} className="shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-lg font-semibold transition">
            Reply Now
          </button>
        </div>
      )}
    </>
  );

  /* ══════════════════════════════════════
     SECTION: USERS
  ══════════════════════════════════════ */
  const renderUsers = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">{users.length}</span> users registered</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-left font-semibold w-12">#</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">User</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Phone</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Platform</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold whitespace-nowrap">Joined On</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold whitespace-nowrap">Hours Used</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Address</th>
              <th className="px-5 sm:px-6 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u, idx) => {
              const { duration, totalHours } = getUsageStats(u.createdAt);
              return (
                <tr key={u.id} className="hover:bg-gray-50/60 transition">
                <td className="px-4 py-3.5 text-gray-300 text-xs font-bold">{idx + 1}</td>
                <td className="px-5 sm:px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} />
                      <span className="font-medium text-gray-700">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 sm:px-6 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-5 sm:px-6 py-3.5 text-gray-500">{u.phone}</td>
                  <td className="px-5 sm:px-6 py-3.5 italic text-gray-400">{u.platform || "Not set"}</td>
                  <td className="px-5 sm:px-6 py-3.5">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-700 font-bold text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}</span>
                      <span className="w-fit px-1.5 py-0.5 bg-green-50 text-green-600 rounded-md text-[9px] font-black uppercase tracking-tight border border-green-100">{duration}</span>
                    </div>
                  </td>
                  <td className="px-5 sm:px-6 py-3.5">
                    <div className="flex items-center gap-1.5 bg-amber-50/50 border border-amber-100 rounded-lg px-2 py-1 w-fit">
                      <FaHourglassHalf className="text-[10px] text-amber-500" />
                      <span className="text-[11px] text-gray-700 font-bold whitespace-nowrap">{totalHours} <span className="text-gray-400 font-medium">Hrs</span></span>
                    </div>
                  </td>
                  <td className="px-5 sm:px-6 py-3.5 text-xs text-gray-500">
                  {u.mandal || u.district || u.state ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-gray-700">{u.mandal && `${u.mandal}, `}{u.district}</span>
                      <span className="text-[10px] uppercase tracking-wider">{u.state}</span>
                    </div>
                  ) : (
                    <span className="text-gray-300">No address</span>
                  )}
                </td>
                <td className="px-5 sm:px-6 py-3.5 text-center">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 rounded-lg text-xs font-medium transition border border-red-100"
                  >
                    <FaTrashAlt className="text-[10px]" /> Delete
                  </button>
                </td>
              </tr>
            )})}
            {users.length === 0 && <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-300">No users found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ══════════════════════════════════════
     SECTION: APPROVALS
  ══════════════════════════════════════ */
  const renderApprovals = () => {
    const pending = payments.filter(p => p.status === "PENDING");
    const approved = payments.filter(p => p.status === "APPROVED");
    const rejected = payments.filter(p => p.status === "REJECTED");
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: "Pending", count: pending.length, bg: "bg-amber-50", border: "border-amber-100", icon: <FaHourglassHalf className="text-amber-400" />, num: "text-amber-600", lbl: "text-amber-500" },
            { label: "Approved", count: approved.length, bg: "bg-green-50", border: "border-green-100", icon: <FaCheckCircle className="text-green-500" />, num: "text-green-600", lbl: "text-green-500" },
            { label: "Rejected", count: rejected.length, bg: "bg-red-50", border: "border-red-100", icon: <FaTimesCircle className="text-red-400" />, num: "text-red-500", lbl: "text-red-400" },
          ].map(({ label, count, bg, border, icon, num, lbl }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl p-4 sm:p-5 flex flex-col justify-center`}>
              <div className="flex items-center gap-2 mb-1">{icon}<p className={`text-xs font-semibold ${lbl} uppercase tracking-wide`}>{label}</p></div>
              <p className={`text-2xl sm:text-3xl font-black ${num}`}>{count}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[540px]">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left font-semibold w-12">#</th>
                  <th className="px-5 sm:px-6 py-3 text-left font-semibold">User</th>
                  <th className="px-5 sm:px-6 py-3 text-left font-semibold">Amount Paid</th>
                  <th className="px-5 sm:px-6 py-3 text-left font-semibold">Coverage</th>
                  <th className="px-5 sm:px-6 py-3 text-left font-semibold">UPI ID</th>
                  <th className="px-5 sm:px-6 py-3 text-left font-semibold">Payment Date</th>
                  <th className="px-5 sm:px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 sm:px-6 py-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-4 py-3.5 text-gray-300 text-xs font-bold">{idx + 1}</td>
                  <td className="px-5 sm:px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={p.user?.email} />
                        <span className="font-medium text-gray-700 truncate max-w-[160px]">{p.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 font-semibold text-gray-700">₹{p.amount}</td>
                    <td className="px-5 sm:px-6 py-3.5 font-bold text-indigo-600">₹{p.subscription?.plan?.coverageAmount || 0}</td>
                    <td className="px-5 sm:px-6 py-3.5">
                      <span className="text-xs font-bold text-indigo-500">{p.upiId || "N/A"}</span>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5">
                      <span className="text-[10px] text-gray-400 font-medium italic">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "N/A"}</span>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-5 sm:px-6 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {p.status === "PENDING" ? (
                          <>
                            <button onClick={() => handleApprove(p.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 text-xs rounded-lg font-medium transition border border-green-200">
                              <FaCheckCircle className="text-[10px]" /> Approve
                            </button>
                            <button onClick={() => handleReject(p.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-400 hover:bg-red-100 text-xs rounded-lg font-medium transition border border-red-200">
                              <FaTimesCircle className="text-[10px]" /> Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1 tracking-wider opacity-60">
                            <FaLock className="text-[8px]" /> Locked
                          </span>
                        )}
                        <button onClick={() => handlePaymentDelete(p.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition border border-red-100" title="Delete record">
                          <FaTrashAlt className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-300">No records found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════
     SECTION: QUERIES
  ══════════════════════════════════════ */
  const renderQueries = () => (
    <div className="space-y-4">
      {queries.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-300">No queries yet</div>
      )}
      {queries.map((q) => (
        <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3">
              <Avatar name={q.user?.email} />
              <div>
                <p className="font-semibold text-gray-700 text-sm">{q.user?.email || "Anonymous User"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(q.createdAt).toLocaleString()}</p>
              </div>
            </div>
            {q.answer
              ? <span className="shrink-0 inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 border border-green-200 px-2.5 py-1 rounded-full font-medium"><FaCheckCircle /> Answered</span>
              : <span className="shrink-0 inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full font-medium"><FaHourglassHalf /> Pending</span>
            }
          </div>
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 mb-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Question</p>
            <p className="text-gray-700 text-sm">{q.question}</p>
          </div>
          {q.answer ? (
            <div className="bg-green-50 rounded-xl p-3.5 border border-green-100">
              <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1"><FaReply /> Reply</p>
              <p className="text-gray-700 text-sm">{q.answer}</p>
              <p className="text-xs text-green-400 mt-1">{new Date(q.answeredAt).toLocaleString()}</p>
            </div>
          ) : (
            <ReplyForm onReply={(ans) => handleReply(q.id, ans)} />
          )}
        </div>
      ))}
    </div>
  );

  /* ══════════════════════════════════════
     SECTION: PLANS
  ══════════════════════════════════════ */
  const renderPlans = () => {
    const PLAN_THEMES = {
      Starter: { icon: <FaSeedling />, color: "text-sky-500", bg: "bg-sky-50", border: "border-sky-100", accent: "bg-sky-500" },
      Smart:   { icon: <FaLightbulb />, color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-100", accent: "bg-violet-500" },
      Pro:     { icon: <FaRocket />, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", accent: "bg-emerald-500" },
      Max:     { icon: <FaCrown />, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100", accent: "bg-amber-500" },
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {plans.map((plan, idx) => {
          const theme = PLAN_THEMES[plan.name] || { icon: <FaClipboardList />, color: "text-teal-500", bg: "bg-teal-50", border: "border-teal-100", accent: "bg-teal-500" };
          return (
            <div key={plan.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${theme.bg} rounded-xl flex items-center justify-center text-lg ${theme.color}`}>
                    {theme.icon}
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm whitespace-nowrap">{plan.name}</h3>
                </div>
                
                <div className={`${theme.bg} rounded-xl p-3 border ${theme.border} mb-4`}>
                  <p className={`text-[10px] ${theme.color} font-semibold uppercase tracking-wide mb-1`}>Weekly Premium</p>
                  <p className={`text-xl font-black ${theme.color}`}>₹{plan.weeklyPremium}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Weekly Premium</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-xs">₹</span>
                      <input
                        type="number"
                        value={plan.weeklyPremium}
                        onChange={(e) => handlePlanChange(idx, "weeklyPremium", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg pl-6 pr-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Coverage Amount</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-xs">₹</span>
                      <input
                        type="number"
                        value={plan.coverageAmount}
                        onChange={(e) => handlePlanChange(idx, "coverageAmount", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg pl-6 pr-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleSavePlan(plan.id, plan)}
                className={`w-full mt-5 px-3 py-2 ${theme.accent} hover:opacity-90 text-white text-xs rounded-lg font-semibold transition flex items-center justify-center gap-1.5 shadow-sm`}
              >
                <FaSave className="text-[10px]" /> Save Changes
              </button>
            </div>
          );
        })}
        {plans.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-300">No plans found</div>
        )}
      </div>
    );
  };

  /* ══════════════════════════════════════
     SECTION: PAYMENTS
  ══════════════════════════════════════ */
  const renderPayments = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">{payments.length}</span> total payment records</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-left font-semibold w-12">#</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">User</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Amount Paid</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Coverage</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">UPI ID</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Payment Date</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-5 sm:px-6 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.map((p, idx) => (
              <tr key={p.id} className="hover:bg-gray-50/60 transition">
                <td className="px-4 py-3.5 text-gray-300 text-xs font-bold">{idx + 1}</td>
                <td className="px-5 sm:px-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={p.user?.email} />
                    <span className="font-medium text-gray-700 truncate max-w-[150px]">{p.user?.email}</span>
                  </div>
                </td>
                <td className="px-5 sm:px-6 py-3.5 font-semibold text-gray-700">₹{p.amount}</td>
                <td className="px-5 sm:px-6 py-3.5 font-bold text-indigo-600">₹{p.subscription?.plan?.coverageAmount || 0}</td>
                <td className="px-5 sm:px-6 py-3.5">
                  <span className="text-xs font-bold text-indigo-500">{p.upiId || "N/A"}</span>
                </td>
                <td className="px-5 sm:px-6 py-3.5">
                  <span className="text-[10px] text-gray-400 font-medium italic">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "N/A"}</span>
                </td>
                <td className="px-5 sm:px-6 py-3.5"><StatusBadge status={p.status} /></td>
                <td className="px-5 sm:px-6 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {p.status === "PENDING" ? (
                      <>
                        <button onClick={() => handleApprove(p.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 text-xs rounded-lg font-medium transition border border-green-200">
                          <FaCheckCircle className="text-[10px]" /> Approve
                        </button>
                        <button onClick={() => handleReject(p.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-400 hover:bg-red-100 text-xs rounded-lg font-medium transition border border-red-200">
                          <FaTimesCircle className="text-[10px]" /> Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1 tracking-wider opacity-60">
                        <FaLock className="text-[8px]" /> Locked
                      </span>
                    )}
                    <button onClick={() => handlePaymentDelete(p.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition border border-red-100" title="Delete record">
                      <FaTrashAlt className="text-xs" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-300">No payment records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ══════════════════════════════════════
     SECTION: PARTNERS
  ══════════════════════════════════════ */
  const renderPartners = () => (
    <div className="space-y-6">
      {/* Add Partner Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 shrink-0">
            <FaPlus />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Add New Partner Platform</h3>
            <p className="text-xs text-gray-400">Add a new delivery platform to support</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField label="Platform Name" icon={<FaBuilding className="text-gray-300" />} value={newPartner.name} onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })} placeholder="e.g. Zomato" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">Logo Image (Upload)</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "logoUrl")} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 border border-gray-200 rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">Profile Banner (Upload)</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "profileBannerUrl")} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 border border-gray-200 rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">Dashboard Banner (Upload)</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "dashboardBannerUrl")} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 border border-gray-200 rounded-xl" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">Border/Accent Color</label>
            <input type="color" value={newPartner.borderColor} onChange={(e) => setNewPartner({ ...newPartner, borderColor: e.target.value })} className="w-full h-10 rounded-xl cursor-pointer p-1 bg-gray-50 border border-gray-200" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={handlePartnerAdd} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-xl font-semibold transition flex items-center gap-2">
            <FaPlus className="text-xs" /> Add Platform
          </button>
        </div>
      </div>

      {/* Partners List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {partners.map(p => {
          const activeUsersCount = users.filter(u => u.platform === p.name).length;
          return (
            <div key={p.id} className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col items-center justify-between hover:shadow-md transition relative group" style={{ borderColor: p.borderColor }}>
              <button onClick={() => handlePartnerDelete(p.id)} className="absolute top-2 right-2 w-7 h-7 bg-red-50 hover:bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm">
                <FaTrashAlt className="text-[10px]" />
              </button>
              <div className="w-16 h-16 flex items-center justify-center mb-2 mt-2">
                <img src={p.logoUrl} alt={p.name} className="max-w-[56px] max-h-[56px] object-contain" />
              </div>
              <div className="text-center w-full mt-auto">
                <p className="font-bold text-sm text-gray-800 w-full truncate leading-tight">{p.name}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: p.borderColor ? `${p.borderColor}15` : '#f1f5f9' }}>
                  <FaUsers className="text-[10px]" style={{ color: p.borderColor || '#64748b' }} />
                  <span className="text-xs font-bold" style={{ color: p.borderColor || '#64748b' }}>
                    {activeUsersCount} Active {activeUsersCount === 1 ? 'User' : 'Users'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {partners.length === 0 && <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">No partner platforms configured</div>}
      </div>
    </div>
  );

  /* ══════════════════════════════════════
     SECTION: DISASTER CLAIMS
  ══════════════════════════════════════ */
  const renderDisasterClaims = () => {
    const pending = claimRequests.filter(c => c.status === "PENDING");
    const approved = claimRequests.filter(c => c.status === "APPROVED");
    const rejected = claimRequests.filter(c => c.status === "REJECTED");
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: "Pending", count: pending.length, bg: "bg-amber-50", border: "border-amber-100", icon: <FaHourglassHalf className="text-amber-400" />, num: "text-amber-600", lbl: "text-amber-500" },
            { label: "Approved", count: approved.length, bg: "bg-green-50", border: "border-green-100", icon: <FaCheckCircle className="text-green-500" />, num: "text-green-600", lbl: "text-green-500" },
            { label: "Rejected", count: rejected.length, bg: "bg-red-50", border: "border-red-100", icon: <FaTimesCircle className="text-red-400" />, num: "text-red-500", lbl: "text-red-400" },
          ].map(({ label, count, bg, border, icon, num, lbl }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl p-4 sm:p-5 flex flex-col justify-center`}>
              <div className="flex items-center gap-2 mb-1">{icon}<p className={`text-xs font-semibold ${lbl} uppercase tracking-wide`}>{label}</p></div>
              <p className={`text-2xl sm:text-3xl font-black ${num}`}>{count}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">{claimRequests.length}</span> situation requests</p>
          </div>
          <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[650px]">
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-left font-semibold w-12">#</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">User</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Situation</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Description</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold text-green-600">Coverage</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-5 sm:px-6 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {claimRequests.map((req, idx) => (
              <tr key={req.id} className="hover:bg-gray-50/60 transition">
                <td className="px-4 py-3.5 text-gray-300 text-xs font-bold">{idx + 1}</td>
                <td className="px-5 sm:px-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={req.user?.name || req.user?.email} />
                    <span className="font-medium text-gray-700 truncate max-w-[120px]">{req.user?.name || "User"}</span>
                  </div>
                </td>
                <td className="px-5 sm:px-6 py-3.5">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase">{req.situation}</span>
                </td>
                <td className="px-5 sm:px-6 py-3.5 text-gray-400 text-xs max-w-[180px] truncate">{req.description}</td>
                <td className="px-5 sm:px-6 py-3.5 font-bold text-green-600">₹{req.amount}</td>
                <td className="px-5 sm:px-6 py-3.5"><StatusBadge status={req.status} /></td>
                <td className="px-5 sm:px-6 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {req.status === "PENDING" ? (
                      <>
                        <button onClick={() => handleApproveClaimReq(req.id)} className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm">
                          Approve
                        </button>
                        <button onClick={() => handleRejectClaimReq(req.id)} className="px-3 py-1.5 bg-white text-red-500 border border-red-100 text-xs rounded-lg font-bold hover:bg-red-50 transition">
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-gray-300 flex items-center gap-1 italic">
                        <FaLock className="text-[8px]" /> Processed
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {claimRequests.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-300">No situation requests found</td></tr>}
          </tbody>
        </table>
        </div>
      </div>
      </div>
    );
  };

  /* ══════════════════════════════════════
     SECTION: ADMIN WALLET
  ══════════════════════════════════════ */
  const renderWallet = () => {
    const balance   = adminWallet.walletBalance  || 0;
    const txns      = adminWallet.transactions   || [];

    // Calculate Weekly Cycle Stats (Last 7 Days)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let weeklyCredits = 0;
    let weeklyDebits = 0;
    
    txns.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate >= oneWeekAgo) {
        if (t.type === "CREDIT") weeklyCredits += t.amount || 0;
        if (t.type === "DEBIT") weeklyDebits += t.amount || 0;
      }
    });

    return (
      <div className="space-y-6">
        {/* Wallet Hero Card */}
        <div className="relative overflow-hidden rounded-2xl shadow-lg" style={{ background: "linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)" }}>
          {/* decorative circles */}
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-20" style={{ background: "rgba(255,255,255,0.3)" }} />
          <div className="absolute -right-4 top-16 w-24 h-24 rounded-full opacity-10" style={{ background: "rgba(255,255,255,0.5)" }} />
          <div className="absolute left-0 bottom-0 w-32 h-32 rounded-full opacity-10" style={{ background: "rgba(255,255,255,0.2)", transform: "translate(-40%,40%)" }} />

          <div className="relative z-10 px-6 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <FaWallet className="text-white text-sm" />
                </div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest">Insurance Fund</p>
              </div>
              <p className="text-white/70 text-sm mb-1">Admin Wallet Balance</p>
              <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-indigo-200 text-xs mt-2">Total accumulated insurance fund</p>
            </div>

            <div className="flex flex-row sm:flex-col gap-3">
              <div className="flex-1 sm:flex-none bg-white/15 border border-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[130px]">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <FaArrowUp className="text-green-300 text-xs" />
                  <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wide">Weekly Premiums</p>
                </div>
                <p className="text-xl font-black text-white">₹{weeklyCredits.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-indigo-300 mt-0.5">Collected this week</p>
              </div>
              <div className="flex-1 sm:flex-none bg-white/15 border border-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[130px]">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <FaArrowDown className="text-red-300 text-xs" />
                  <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wide">Weekly Payouts</p>
                </div>
                <p className="text-xl font-black text-white">₹{weeklyDebits.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-indigo-300 mt-0.5">Paid out this week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary mini cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Net Balance</p>
            <p className="text-2xl font-black text-indigo-600">₹{balance.toLocaleString("en-IN")}</p>
            <p className="text-xs text-gray-400 mt-1">Credits − Debits</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Transactions</p>
            <p className="text-2xl font-black text-gray-800">{txns.length}</p>
            <p className="text-xs text-gray-400 mt-1">Total entries</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Claims Paid</p>
            <p className="text-2xl font-black text-red-500">{txns.filter(t => t.type === "DEBIT").length}</p>
            <p className="text-xs text-gray-400 mt-1">Coverage payouts</p>
          </div>
        </div>

        {/* Transaction Ledger */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 text-xs">
                <FaMoneyBillWave />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm">Transaction Ledger</p>
                <p className="text-xs text-gray-400">{txns.length} total entries</p>
              </div>
            </div>
            <button onClick={loadWallet} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition">
              Refresh
            </button>
          </div>

          {txns.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaWallet className="text-indigo-400 text-2xl" />
              </div>
              <p className="text-gray-400 text-sm font-medium">No transactions yet</p>
              <p className="text-gray-300 text-xs mt-1">Premiums will appear here once payments are approved</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-left font-semibold w-12">#</th>
                    <th className="px-5 py-3 text-left font-semibold">Type</th>
                    <th className="px-5 py-3 text-left font-semibold">User</th>
                    <th className="px-5 py-3 text-right font-semibold">Premium</th>
                    <th className="px-5 py-3 text-right font-semibold">Coverage</th>
                    <th className="px-5 py-3 text-left font-semibold">Payment / UPI</th>
                    <th className="px-5 py-3 text-left font-semibold">Cycle Status</th>
                    <th className="px-5 py-3 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {txns.map((txn, idx) => {
                    const isCredit = txn.type === "CREDIT";
                    // Fallbacks in case old records lack these fields
                    const userEmail = txn.userEmail || "—";
                    const userName = txn.userName || "—";
                    const upiId = txn.upiId || "—";
                    const method = txn.method || "—";
                    const cycleStatus = txn.cycleStatus || "Unknown";
                    
                    // For UI display: both credit/debit have premium and coverage available in the txn map
                    const premiumAmount = isCredit ? txn.amount : (txn.premiumAmount || 0);
                    const coverageAmount = txn.coverageAmount || 0;

                    return (
                      <tr key={txn.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-4 py-3.5 text-gray-300 text-xs font-bold">{idx + 1}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest
                            ${isCredit
                              ? "bg-green-50 text-green-600 border-green-200"
                              : "bg-red-50 text-red-500 border-red-200"
                            }`}>
                            {isCredit ? <FaArrowUp className="text-[8px]" /> : <FaArrowDown className="text-[8px]" />}
                            {isCredit ? "PREMIUM (CREDIT)" : "CLAIM (DEBIT)"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col">
                            <span className="text-gray-800 font-bold text-xs">{userName}</span>
                            <span className="text-gray-500 text-[10px] truncate max-w-[150px]">{userEmail}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="font-bold text-gray-700 text-sm">
                            ₹{Number(premiumAmount).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`font-black text-sm ${!isCredit ? 'text-red-500' : 'text-indigo-600'}`}>
                            ₹{Number(coverageAmount).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                           <div className="flex flex-col">
                            <span className="text-gray-700 font-semibold text-xs">{method}</span>
                            {method === "UPI" && (
                              <span className="text-gray-500 text-[10px] truncate max-w-[120px]">{upiId}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                            ${cycleStatus === 'On Going' 
                              ? "bg-indigo-50 text-indigo-600 border-indigo-200" 
                              : cycleStatus === 'Completed' 
                                ? "bg-slate-100 text-slate-500 border-slate-200"
                                : "bg-gray-50 text-gray-500 border-gray-200"
                            }`}>
                            {cycleStatus}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                            {txn.date ? new Date(txn.date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════
     SECTION: SETTINGS
  ══════════════════════════════════════ */
  const renderSettings = () => (
    <div className="w-full space-y-5">

      {/* Settings Banner */}
      <div className="w-full bg-gradient-to-r from-slate-600 to-slate-800 rounded-2xl px-6 sm:px-8 py-6 sm:py-7 overflow-hidden relative shadow-sm">
        {/* SVG illustration */}
        <div className="absolute right-0 top-0 h-full pointer-events-none select-none flex items-center">
          <svg viewBox="0 0 280 140" className="h-full w-auto opacity-[0.1]" fill="white" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="70" r="95" />
            <circle cx="200" cy="48" r="30" />
            <path d="M155 130 c0-25 20-45 45-45 s45 20 45 45" />
            <rect x="30" y="30" width="90" height="12" rx="6" fillOpacity="0.5" />
            <rect x="30" y="52" width="65" height="12" rx="6" fillOpacity="0.35" />
            <rect x="30" y="74" width="78" height="12" rx="6" fillOpacity="0.25" />
            <circle cx="260" cy="20" r="18" fillOpacity="0.15" />
            <circle cx="20" cy="120" r="28" fillOpacity="0.1" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-[0.18em] mb-1.5">Admin Panel</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mb-1.5">Account Settings</h1>
            <p className="text-slate-300 text-sm">Manage your profile and security settings</p>
          </div>
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-3 shrink-0">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
              <FaUserCircle className="text-white text-xl" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Logged in as</p>
              <p className="text-white font-bold text-sm leading-tight">{adminInfo.username}</p>
              <p className="text-slate-300 text-xs truncate max-w-[150px]">{adminInfo.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column cards — stack on mobile */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Profile info card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
            <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-xs"><FaIdBadge /></span>
            <div>
              <p className="font-semibold text-gray-700 text-sm">Account Information</p>
              <p className="text-xs text-gray-400">Your current admin details</p>
            </div>
          </div>
          <div className="p-5">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl flex items-center justify-center text-white text-2xl shadow shrink-0">
                <FaUserCircle />
              </div>
              <div>
                <p className="text-lg font-black text-gray-800 leading-tight">{adminInfo.username}</p>
                <p className="text-xs font-semibold text-green-500 uppercase tracking-widest mt-0.5">Administrator</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <FaEnvelope className="text-gray-300 shrink-0" />
                  <span className="truncate">{adminInfo.email}</span>
                </p>
              </div>
            </div>
            {/* Info rows */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 shrink-0 text-xs"><FaIdBadge /></div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium">Username</p>
                  <p className="font-bold text-gray-700 text-sm">{adminInfo.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 shrink-0 text-xs"><FaEnvelope /></div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium">Email</p>
                  <p className="font-bold text-gray-700 text-sm truncate">{adminInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3 border border-green-100">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-500 shrink-0 text-xs"><FaShieldAlt /></div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Role</p>
                  <p className="font-bold text-green-600 text-sm">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Update credentials card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
            <span className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xs"><FaUserEdit /></span>
            <div>
              <p className="font-semibold text-gray-700 text-sm">Update Credentials</p>
              <p className="text-xs text-gray-400">Leave blank to keep existing values</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <InputField
              label="New Username"
              icon={<FaIdBadge className="text-gray-300" />}
              value={settings.username}
              onChange={(e) => setSettings({ ...settings, username: e.target.value })}
              placeholder={`Current: ${adminInfo.username}`}
            />
            <InputField
              label="New Email"
              icon={<FaEnvelope className="text-gray-300" />}
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder={`Current: ${adminInfo.email}`}
            />

            {/* Password divider */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 border-t border-dashed border-gray-200" />
              <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5 px-1 uppercase tracking-wide whitespace-nowrap">
                <FaLock className="text-gray-300" /> Change Password
              </span>
              <div className="flex-1 border-t border-dashed border-gray-200" />
            </div>

            <InputField
              label="New Password"
              icon={<FaLock className="text-gray-300" />}
              type="password"
              value={settings.password}
              onChange={(e) => setSettings({ ...settings, password: e.target.value })}
              placeholder="Enter new password"
            />
            <InputField
              label="Confirm Password"
              icon={<FaKey className="text-gray-300" />}
              type="password"
              value={settings.confirmPassword}
              onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              errorMsg={settings.confirmPassword && settings.password !== settings.confirmPassword ? "Passwords do not match" : null}
              successMsg={settings.confirmPassword && settings.password === settings.confirmPassword && settings.password ? "Passwords match" : null}
            />

            <button
              onClick={handleSettingsSave}
              className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 mt-1"
            >
              <FaSave /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */

  const sectionRenderers = {
    overview: renderOverview,
    users: renderUsers,
    approvals: renderApprovals,
    queries: renderQueries,
    plans: renderPlans,
    payments: renderPayments,
    wallet: renderWallet,
    disaster: renderDisasterClaims,
    partners: renderPartners,
    settings: renderSettings,
  };

  const meta = PAGE_META[section];

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <AdminSidebar
        section={section}
        setSection={setSection}
        onLogout={logout}
        pendingCount={pendingApprovals}
        unansweredCount={unansweredQ}
        pendingClaims={pendingClaimReqs}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            <FaBars />
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-xs shrink-0">
              <FaShieldAlt />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 leading-tight truncate">
                {section === "overview" ? "Dashboard" : (meta?.title || "Dashboard")}
              </p>
              <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>
          {/* Notification dot */}
          {(pendingApprovals + unansweredQ) > 0 && (
            <div className="relative">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                <FaBell className="text-sm" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                {pendingApprovals + unansweredQ}
              </span>
            </div>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Toast */}
          {message && (
            <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 max-w-xs
              ${msgType === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
              {msgType === "error" ? <FaTimesCircle /> : <FaCheckCircle />}
              {message}
            </div>
          )}

          {/* Page heading (all pages except overview) */}
          {section !== "overview" && meta && (
            <div className="mb-5 flex items-center gap-3">
              <div className={`w-10 h-10 ${meta.color} rounded-xl flex items-center justify-center text-white text-base shadow-sm`}>
                {meta.icon}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-800 leading-tight">{meta.title}</h1>
                <p className="text-xs sm:text-sm text-gray-400">{meta.subtitle}</p>
              </div>
            </div>
          )}

          {(sectionRenderers[section] || renderOverview)()}
        </main>
      </div>
    </div>
  );
}