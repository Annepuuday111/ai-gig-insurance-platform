import React from 'react'

export default function NotificationCard({title, desc, time}){
  return (
    <div className="p-3 rounded-md hover:bg-gray-50 transition">
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-gray-500">{desc}</div>
      <div className="text-xs text-gray-400 mt-1">{time}</div>
    </div>
  )
}
