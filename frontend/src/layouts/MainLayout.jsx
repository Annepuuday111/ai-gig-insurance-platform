import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";

export default function MainLayout() {

  return (

    <div className="min-h-screen bg-gray-100 flex">

      {/* Sidebar (Desktop only) */}
      <aside className="hidden lg:flex w-64 fixed left-0 top-0 h-screen bg-white shadow">
        <Sidebar />
      </aside>

      {/* Content */}
      <div className="flex-1 lg:ml-64 pb-20">

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <Outlet />
        </main>

      </div>

      {/* Bottom Nav (Mobile only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <BottomNav />
      </div>

    </div>

  );
}