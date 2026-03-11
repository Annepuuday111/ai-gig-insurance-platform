import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import api from "../api";
import {
  FaHome,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaChartBar,
  FaUser,
  FaSignOutAlt,
  FaCommentDots
} from 'react-icons/fa'

const defaultTheme = { accent: "#16a34a", light: "#f0fdf4" };

export default function BottomNav(){
  const navigate = useNavigate()
  const [theme, setTheme] = useState(defaultTheme);

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
                light: p.borderColor ? `${p.borderColor}22` : "#f0fdf4"
              });
            }
          }
        }
      } catch (err) { }
    };
    fetchTheme();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const navItemClass = ({ isActive }) =>
    `flex flex-col items-center justify-center py-3 px-2 flex-1 transition min-w-[75px] ${
      isActive
        ? 'text-[var(--bn-accent)]'
        : 'text-gray-500 hover:text-[var(--bn-accent)]'
    }`

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl lg:hidden z-50 overflow-hidden" 
      style={{
        boxShadow: `0 -4px 20px color-mix(in srgb, ${theme.accent} 12%, transparent)`,
        "--bn-accent": theme.accent
      }}
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="flex justify-start overflow-x-auto no-scrollbar px-2">
        <NavLink to="/dashboard" className={navItemClass}>
          <FaHome className="w-5 h-5" />
          <span className="text-xs mt-1">Home</span>
        </NavLink>

        <NavLink to="/plans" className={navItemClass}>
          <FaFileInvoiceDollar className="w-5 h-5" />
          <span className="text-xs mt-1">Plans</span>
        </NavLink>

        <NavLink to="/claims" className={navItemClass}>
          <FaClipboardList className="w-5 h-5" />
          <span className="text-xs mt-1">Claims</span>
        </NavLink>

        <NavLink to="/reports" className={navItemClass}>
          <FaChartBar className="w-5 h-5" />
          <span className="text-xs mt-1">Reports</span>
        </NavLink>

        <NavLink to="/profile" className={navItemClass}>
          <FaUser className="w-5 h-5" />
          <span className="text-xs mt-1">Profile</span>
        </NavLink>

        <NavLink to="/chat" className={navItemClass}>
          <FaCommentDots className="w-5 h-5" />
          <span className="text-xs mt-1">Chat</span>
        </NavLink>

        <button
          onClick={logout}
          className="flex flex-col items-center justify-center py-3 px-2 flex-1 text-gray-500 hover:text-red-500 transition"
          title="Logout"
        >
          <FaSignOutAlt className="w-5 h-5" />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </div>
    </nav>
  )
}
