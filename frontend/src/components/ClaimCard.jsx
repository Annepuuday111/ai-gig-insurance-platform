import React from 'react'

export default function ClaimCard({title, amount, status, onClaim, isClaimed}){
  const statusColor = status === 'APPROVED' ? 'text-green-600' : status === 'PENDING' ? 'text-orange-500' : 'text-gray-500'
  return (
    <div className="card p-4 bg-white border border-slate-100 shadow-sm rounded-xl mb-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-slate-800">{title}</div>
          <div className="text-xs text-slate-400 mt-0.5">Insurance Payout: ₹{amount}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-xs font-black uppercase tracking-wider ${statusColor}`}>
            {isClaimed ? 'Claimed' : status}
          </div>
          {status === 'APPROVED' && !isClaimed && onClaim && (
            <button 
              onClick={onClaim}
              className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              Claim Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
