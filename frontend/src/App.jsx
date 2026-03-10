import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import Payment from "./pages/Payment";
import Claims from "./pages/Claims";
import Notifications from "./pages/Notifications";
import ChatSupport from "./pages/ChatSupport";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";

import Wireframes from "./pages/Wireframes";
import AdminDashboard from "./pages/AdminDashboard";
import MainLayout from "./layouts/MainLayout";

export default function App() {
  return (
    <div className="min-h-screen font-sans bg-gray-100 text-gray-800">

      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wireframes" element={<Wireframes />} />

        {/* Dashboard Layout */}
        <Route element={<MainLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/chat" element={<ChatSupport />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />

        </Route>

        {/* Admin area (separate layout) */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </div>
  );
}