import React from 'react'

export default function ClaimCard({title, amount, status}){
  const statusColor = status === 'Approved' ? 'text-green-600' : status === 'Processing' ? 'text-orange-500' : 'text-gray-500'
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-gray-400">Claim Amount: ₹{amount}</div>
        </div>
        <div className={`text-sm font-semibold ${statusColor}`}>{status}</div>
      </div>
    </div>
  )
}
