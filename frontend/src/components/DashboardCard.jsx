import React from 'react'

export default function DashboardCard({title, value, small}){
  return (
    <div className="card p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
      {small && <div className="text-xs text-gray-400 mt-1">{small}</div>}
    </div>
  )
}
