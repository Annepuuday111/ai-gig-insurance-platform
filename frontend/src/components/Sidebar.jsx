import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api";

import {
  FaShieldAlt,
  FaHome,
  FaClipboardList,
  FaChartBar,
  FaUser,
  FaSignOutAlt,
  FaCommentDots,
  FaBell
} from "react-icons/fa";

const defaultTheme = { accent: "#16a34a", light: "#f0fdf4", gradient: "linear-gradient(135deg,#16a34a,#4ade80)" };

export default function Sidebar() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(defaultTheme);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const u = await api.getCurrentUser();
        if (u && u.platform) {
          const partners = await api.getPartners();
          if (Array.isArray(partners)) {
            const p = partners.find(ptr => ptr.name === u.platform);
            if (p) {
              setTheme({
                accent: p.borderColor || "#16a34a",
                light: p.borderColor ? `${p.borderColor}22` : "#f0fdf4",
                gradient: `linear-gradient(135deg, ${p.borderColor}, ${p.borderColor}bb)`
              });
            }
          }
        }
      } catch (err) { }
    };
    fetchTheme();

    const fetchNotifications = async () => {
      try {
        const res = await api.getMyNotifications();
        if (Array.isArray(res)) {
          setUnreadCount(res.filter(n => !n.read).length);
        }
      } catch (e) { }
    }
    fetchNotifications();
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const menuItem =
    "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 transition hover:bg-[var(--s-light)] hover:text-[var(--s-accent)]";

  const activeItem =
    "flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--s-light)] text-[var(--s-accent)] font-medium";

  return (
    <aside
      className="w-64 h-screen bg-white border-r shadow-sm flex flex-col"
      style={{
        "--s-accent": theme.accent,
        "--s-light": theme.light,
        "--s-gradient": theme.gradient
      }}
    >
      {/* LOGO */}
      <div className="flex items-center gap-3 px-6 py-5 border-b">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow"
          style={{ background: theme.gradient }}
        >
          <FaShieldAlt />
        </div>
        <span className="text-lg font-semibold text-gray-800">
          Gig Insurance
        </span>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {/* OVERVIEW */}
        <div>
          <h3 className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Overview</h3>
          <div className="space-y-1">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? activeItem : menuItem}>
              <FaHome size={18} /> Dashboard
            </NavLink>
          </div>
        </div>

        {/* INSURANCE */}
        <div>
          <h3 className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Insurance</h3>
          <div className="space-y-1">
            <NavLink to="/plans" className={({ isActive }) => isActive ? activeItem : menuItem}>
              <FaShieldAlt size={18} /> Insurance Plans
            </NavLink>
            <NavLink to="/claims" className={({ isActive }) => isActive ? activeItem : menuItem}>
              <FaClipboardList size={18} /> Insurance Claims
            </NavLink>
          </div>
        </div>

        {/* ANALYTICS */}
        <div>
          <h3 className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Analytics</h3>
          <div className="space-y-1">
            <NavLink to="/reports" className={({ isActive }) => isActive ? activeItem : menuItem}>
              <FaChartBar size={18} /> Reports & Insights
            </NavLink>
          </div>
        </div>

        {/* UPDATES */}
        <div>
          <h3 className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Updates</h3>
          <div className="space-y-1">
            <NavLink to="/notifications" className={({ isActive }) => isActive ? activeItem : menuItem}>
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center gap-3"><FaBell size={18} /> Notifications</span>
                {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
              </div>
            </NavLink>
          </div>
        </div>

        {/* ACCOUNT */}
        <div>
          <h3 className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Account</h3>
          <div className="space-y-1">
            <NavLink to="/profile" className={({ isActive }) => isActive ? activeItem : menuItem}>
              <FaUser size={18} /> My Profile
            </NavLink>
          </div>
        </div>

        {/* SUPPORT */}
        <div>
          <h3 className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Support</h3>
          <div className="space-y-1">
            <NavLink to="/chat" className={({ isActive }) => isActive ? activeItem : menuItem}>
              <FaCommentDots size={18} /> Support Chat
            </NavLink>
          </div>
        </div>
      </nav>

      {/* LOGOUT */}
      <div className="px-4 pb-6">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t text-sm text-gray-400">
        © 2026 Gig Insurance
      </div>
    </aside>
  );
}