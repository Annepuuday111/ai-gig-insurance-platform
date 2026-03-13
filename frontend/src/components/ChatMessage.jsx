import React from 'react'

export default function ChatMessage({from, text, time, theme}){
  const isAgent = from === 'agent'
  const date = time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div style={{ 
      display: "flex", 
      width: "100%", 
      justifyContent: isAgent ? "flex-start" : "flex-end", 
      marginBottom: 16, 
      padding: "0 8px" 
    }}> 
      <div 
        style={{
          maxWidth: "85%",
          padding: "12px 16px",
          borderRadius: 20,
          borderBottomRightRadius: isAgent ? 20 : 4,
          borderBottomLeftRadius: isAgent ? 4 : 20,
          background: isAgent ? '#fff' : (theme?.gradient || "linear-gradient(135deg,#16a34a,#4ade80)"),
          color: isAgent ? "#1e293b" : "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          border: isAgent ? "1px solid #e2e8f0" : "none",
          position: "relative",
          animation: "slideUp 0.3s ease-out"
        }}
      > 
        <div style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.6 }}>{text}</div>
        <div style={{ 
          fontSize: 10, 
          marginTop: 6, 
          fontWeight: 700, 
          textTransform: "uppercase", 
          letterSpacing: "0.5px",
          opacity: 0.7,
          textAlign: "right"
        }}>
          {isAgent ? 'Support' : 'You'} • {date}
        </div>
      </div>
    </div>
  )
}
