import React from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import NotificationCard from '../components/NotificationCard'

export default function Notifications(){
  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <Sidebar />
        <main className="flex-1">
          <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-2 card">
            <NotificationCard title="Heavy rain detected in your zone" desc="Claim initiated automatically" time="5m ago" />
            <NotificationCard title="Claim approved" desc="₹600 payout processed" time="2d ago" />
            <NotificationCard title="Weekly premium due" desc="₹40 scheduled" time="3d ago" />
          </div>
        </main>
      </div>
    </div>
  )
}
