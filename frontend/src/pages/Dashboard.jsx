import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "../components/DashboardCard";
import NotificationCard from "../components/NotificationCard";
import ClaimCard from "../components/ClaimCard";

export default function Dashboard() {

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, []);

  return (

    <>
      {/* Welcome */}
      <div className="mb-6">
        {localStorage.getItem("userName") && (
          <div className="text-sm text-gray-600">
            Welcome,
            <span className="font-semibold ml-1">
              {localStorage.getItem("userName")}
            </span>
          </div>
        )}
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

        <DashboardCard
          title="Active Plan"
          value="Standard"
          small="₹40/week · ₹600 coverage"
        />

        <DashboardCard
          title="Weekly Premium"
          value="₹40"
        />

        <DashboardCard
          title="Coverage Amount"
          value="₹600"
        />

        <DashboardCard
          title="Risk Level"
          value="Moderate"
          small="Weather sensitive"
        />

      </div>


      {/* Notifications + Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 card">

          <h3 className="text-lg font-semibold mb-3">
            Recent Notifications
          </h3>

          <div className="space-y-2">

            <NotificationCard
              title="Heavy rain detected in your zone"
              desc="System initiated claim process"
              time="10m ago"
            />

            <NotificationCard
              title="₹600 payout processed"
              desc="Your recent claim was approved"
              time="2d ago"
            />

          </div>

        </div>


        <div className="card">

          <h3 className="text-lg font-semibold mb-3">
            Claim Status
          </h3>

          <div className="space-y-2">

            <ClaimCard
              title="Heavy Rain Detected"
              amount={600}
              status="Processing"
            />

            <ClaimCard
              title="Claim Approved"
              amount={600}
              status="Approved"
            />

          </div>

        </div>

      </div>


      {/* Quick Actions */}
      <div className="mt-6 card">

        <h3 className="text-lg font-semibold mb-3">
          Quick Actions
        </h3>

        <div className="flex gap-3 flex-wrap">

          <button className="px-4 py-2 bg-green-500 text-white rounded">
            Buy Plan
          </button>

          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            File Claim
          </button>

          <button className="px-4 py-2 border rounded">
            View Reports
          </button>

        </div>

      </div>

    </>
  );
}