import React from 'react'

export default function ChatMessage({from, text, time, theme}){
  const isAgent = from === 'agent'
  const date = time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'} mb-4 px-2`}> 
      <div 
        className={`px-4 py-3 rounded-2xl shadow-sm max-w-[85%] sm:max-w-md animate-fade-in ${
          isAgent ? 'bg-white text-gray-800 border-l-4' : 'text-white'
        }`}
        style={{
          borderLeftColor: isAgent ? (theme?.accent || '#16a34a') : 'transparent',
          background: isAgent ? '#fff' : (theme?.gradient || 'linear-gradient(135deg,#16a34a,#4ade80)'),
          boxShadow: isAgent ? '0 4px 12px rgba(0,0,0,0.05)' : '0 4px 12px rgba(0,0,0,0.1)'
        }}
      > 
        <div className="text-[14.5px] font-medium leading-relaxed">{text}</div>
        <div className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider ${isAgent ? 'text-gray-400' : 'text-white/70'} text-right`}>
          {isAgent ? 'Support' : 'You'} • {date}
        </div>
      </div>
    </div>
  )
}
