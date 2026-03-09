import React from 'react'

export default function ChatMessage({from, text, time}){
  const isAgent = from === 'agent'
  return (
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'} mb-2`}> 
      <div className={`${isAgent ? 'bg-white' : 'bg-primary text-white'} px-4 py-2 rounded-lg shadow-sm max-w-xs`}> 
        <div className="text-sm">{text}</div>
        <div className="text-xs text-gray-400 mt-1 text-right">{time}</div>
      </div>
    </div>
  )
}
