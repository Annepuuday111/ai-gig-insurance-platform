import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationCard from '../components/NotificationCard'
import { getMyNotifications, markNotificationAsRead } from '../api'

export default function Notifications(){
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    const res = await getMyNotifications();
    if (res && Array.isArray(res)) setNotifications(res);
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    loadNotifications();
  }, [navigate]);

  const handleRead = async (id) => {
    await markNotificationAsRead(id);
    loadNotifications();
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          Recent <span className="text-indigo-600">Notifications</span>
        </h2>
        <button 
          onClick={loadNotifications}
          className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Notifications</h3>
              <p className="text-slate-400 text-sm">You'll see updates about your claims and account here.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} onClick={() => !n.read && handleRead(n.id)} className={`p-4 rounded-xl cursor-pointer transition ${n.read ? 'bg-slate-50 opacity-60 border border-transparent' : 'bg-white border border-slate-200 shadow-sm'}`}>
                <NotificationCard 
                  title={n.title} 
                  desc={n.message} 
                  time={new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
