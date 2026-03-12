import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChartBar, FaMoneyBillWave, FaExclamationTriangle } from "react-icons/fa";
import ReportCard from "../components/ReportCard";
import api from "../api";

export default function Reports(){
  const navigate = useNavigate();
  const [data, setData] = useState({ totalClaims: 0, totalPayout: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    api.getDashboardSummary().then(res => {
      if (res && !res.error) {
        setData({
          totalClaims: res.totalClaims || 0,
          totalPayout: res.totalPayout || 0
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [navigate]);

  return(
    <div className="p-6">
      <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-8">
        Insurance <span className="text-indigo-600">Reports</span>
      </h2>

      {loading ? (
        <div className="flex justify-center p-12">
           <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <ReportCard
            title="Success Claims"
            value={data.totalClaims.toString()}
            icon={<FaChartBar className="text-green-500"/>}
          />

          <ReportCard
            title="Total Payout"
            value={`₹${data.totalPayout}`}
            icon={<FaMoneyBillWave className="text-blue-500"/>}
          />

          <ReportCard
            title="Risk Alerts"
            value="0"
            icon={<FaExclamationTriangle className="text-orange-500"/>}
          />
        </div>
      )}
    </div>
  )
}