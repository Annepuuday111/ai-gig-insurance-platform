import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClaimCard from "../components/ClaimCard";

export default function Claims() {

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, []);

  return (

    <>
      <h2 className="text-2xl font-bold mb-6">
        Claims
      </h2>

      <div className="space-y-4">

        <ClaimCard
          title="Heavy Rain Detected"
          amount={600}
          status="Processing"
        />

        <ClaimCard
          title="Pollution Alert"
          amount={600}
          status="Approved"
        />

      </div>

    </>
  );
}