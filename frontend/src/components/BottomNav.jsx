import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FaHome,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaChartBar,
  FaUser,
  FaSignOutAlt
} from 'react-icons/fa'

export default function BottomNav(){
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const navItemClass = ({ isActive }) =>
    `flex flex-col items-center justify-center py-3 px-2 flex-1 transition ${
      isActive
        ? 'text-green-500'
        : 'text-gray-500 hover:text-green-500'
    }`

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl lg:hidden z-50" style={{boxShadow: '0 -4px 20px rgba(22,163,74,0.12)'}}>
      <div className="flex justify-around">
        <NavLink
          to="/dashboard"
          className={navItemClass}
        >
          <FaHome className="w-5 h-5" />
          <span className="text-xs mt-1">Home</span>
        </NavLink>

        <NavLink
          to="/plans"
          className={navItemClass}
        >
          <FaFileInvoiceDollar className="w-5 h-5" />
          <span className="text-xs mt-1">Plans</span>
        </NavLink>

        <NavLink
          to="/claims"
          className={navItemClass}
        >
          <FaClipboardList className="w-5 h-5" />
          <span className="text-xs mt-1">Claims</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={navItemClass}
        >
          <FaChartBar className="w-5 h-5" />
          <span className="text-xs mt-1">Reports</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={navItemClass}
        >
          <FaUser className="w-5 h-5" />
          <span className="text-xs mt-1">Profile</span>
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
