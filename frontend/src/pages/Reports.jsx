import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChartBar, FaMoneyBillWave, FaExclamationTriangle } from "react-icons/fa";
import ReportCard from "../components/ReportCard";

export default function Reports(){

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, []);

  return(

    <>
      <h2 className="text-2xl font-bold mb-6">
        Reports
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <ReportCard
          title="Total Claims"
          value="5"
          icon={<FaChartBar className="text-green-500"/>}
        />

        <ReportCard
          title="Total Payout"
          value="₹3000"
          icon={<FaMoneyBillWave className="text-blue-500"/>}
        />

        <ReportCard
          title="Risk Alerts"
          value="3"
          icon={<FaExclamationTriangle className="text-orange-500"/>}
        />

      </div>

    </>
  )

}