import React from 'react'
import { Link } from 'react-router-dom'
import { IconBell, IconChat, IconUser, IconLogo, IconCard } from './Icons'

export default function BottomNav(){
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between">
        <Link to="/dashboard" className="flex-1 text-center text-gray-600"><IconLogo className="w-6 h-6 mx-auto"/><div className="text-xs">Home</div></Link>
        <Link to="/plans" className="flex-1 text-center text-gray-600"><IconCard className="w-6 h-6 mx-auto"/><div className="text-xs">Plans</div></Link>
        <Link to="/chat" className="flex-1 text-center text-gray-600"><IconChat className="w-6 h-6 mx-auto"/><div className="text-xs">Chat</div></Link>
        <Link to="/notifications" className="flex-1 text-center text-gray-600"><IconBell className="w-6 h-6 mx-auto"/><div className="text-xs">Notifs</div></Link>
        <Link to="/profile" className="flex-1 text-center text-gray-600"><IconUser className="w-6 h-6 mx-auto"/><div className="text-xs">Me</div></Link>
      </div>
    </nav>
  )
}
