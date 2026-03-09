import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FaShieldAlt,
  FaHome,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaChartBar,
  FaUser,
  FaSignOutAlt
} from "react-icons/fa";

export default function Sidebar() {

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");

    navigate("/login");
  };

  const menuItem =
    "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-600 transition";

  const activeItem =
    "flex items-center gap-3 px-4 py-3 rounded-lg bg-green-100 text-green-700 font-medium";

  return (

    <aside className="w-64 h-screen bg-white border-r shadow-sm flex flex-col">

      {/* LOGO */}
      <div className="flex items-center gap-3 px-6 py-5 border-b">

        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white shadow">
          <FaShieldAlt />
        </div>

        <span className="text-lg font-semibold text-gray-800">
          Gig Insurance
        </span>

      </div>


      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-2">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? activeItem : menuItem
          }
        >
          <FaHome />
          Dashboard
        </NavLink>


        <NavLink
          to="/plans"
          className={({ isActive }) =>
            isActive ? activeItem : menuItem
          }
        >
          <FaFileInvoiceDollar />
          Plans
        </NavLink>


        <NavLink
          to="/claims"
          className={({ isActive }) =>
            isActive ? activeItem : menuItem
          }
        >
          <FaClipboardList />
          Claims
        </NavLink>


        <NavLink
          to="/reports"
          className={({ isActive }) =>
            isActive ? activeItem : menuItem
          }
        >
          <FaChartBar />
          Reports
        </NavLink>


        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? activeItem : menuItem
          }
        >
          <FaUser />
          Profile
        </NavLink>

      </nav>


      {/* LOGOUT */}
      <div className="px-4 pb-6">

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
        >
          <FaSignOutAlt />
          Logout
        </button>

      </div>


      {/* FOOTER */}
      <div className="px-6 py-4 border-t text-sm text-gray-400">
        © 2026 Gig Insurance
      </div>

    </aside>
  );
}