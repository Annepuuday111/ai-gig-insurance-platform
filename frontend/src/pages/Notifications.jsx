import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NotificationCard from '../components/NotificationCard'

export default function Notifications(){

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, []);

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
      <div className="space-y-2 card">
        <NotificationCard title="Heavy rain detected in your zone" desc="Claim initiated automatically" time="5m ago" />
        <NotificationCard title="Claim approved" desc="₹600 payout processed" time="2d ago" />
        <NotificationCard title="Weekly premium due" desc="₹40 scheduled" time="3d ago" />
      </div>
    </>
  )
}
