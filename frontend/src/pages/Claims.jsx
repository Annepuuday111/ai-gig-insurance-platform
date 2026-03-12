import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationCard from '../components/NotificationCard'
import ClaimCard from '../components/ClaimCard'
import { getPaymentHistory, claimPayment, getMyClaimRequests, submitClaimRequest, claimRequestPayout, getCurrentUser } from "../api";
import { FaFileAlt, FaCloudRain, FaShieldAlt, FaHistory, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

export default function Claims() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ situation: 'FLOOD', description: '' });

  const loadData = async () => {
    setLoading(true);
    const [pRes, rRes] = await Promise.all([getPaymentHistory(), getMyClaimRequests()]);
    if (pRes && Array.isArray(pRes)) setPayments(pRes.filter(p => ["APPROVED", "REJECTED", "SUCCESS", "CLAIMED"].includes(p.status)));
    if (rRes && Array.isArray(rRes)) setRequests(rRes);
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    loadData();
  }, [navigate]);

  const handleClaim = async (id, type) => {
    const res = type === 'request' ? await claimRequestPayout(id) : await claimPayment(id);
     if (res.error) {
        setMessage({ text: res.error, type: 'error' });
     } else {
        const balance = res.newBalance !== undefined ? res.newBalance : "updated";
        setMessage({ text: `Amount claimed successfully! New Balance: ₹${balance}`, type: 'success' });
        loadData();
     }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await submitClaimRequest(formData);
    if (res.error) {
      setMessage({ text: res.error, type: 'error' });
    } else {
      setMessage({ text: "Claim request submitted!", type: 'success' });
      setShowForm(false);
      loadData();
    }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Insurance <span className="text-indigo-600">Claims</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage situation requests and payouts</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <FaFileAlt /> {showForm ? 'View Claims' : 'File New Claim'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-bold border ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
          {message.type === 'error' ? <FaTimesCircle className="inline mr-2" /> : <FaCheckCircle className="inline mr-2" />}
          {message.text}
        </div>
      )}

      {showForm ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <FaCloudRain className="text-indigo-500" /> New Situation Request
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Situation Type</label>
              <select 
                value={formData.situation}
                onChange={(e) => setFormData({...formData, situation: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
              >
                <option value="FLOOD">Floods / Heavy Rain</option>
                <option value="CURFEW">Curfew / Local Lockdown</option>
                <option value="DISESTER">Natural Disaster</option>
                <option value="CRITICAL">Critical Emergency</option>
                <option value="WEATHER">Extreme Weather Alert</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Description / Reason</label>
              <textarea 
                required
                placeholder="Describe the situation and why you are unable to work..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <p className="text-[10px] text-slate-400 italic">
              * Note: Your request will be reviewed by the admin. Once approved, you can claim the payout. Each plan allows only one successful claim per week.
            </p>
            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
              Submit Request
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Situation Requests Section */}
          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FaShieldAlt /> Situation Requests
            </h4>
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-sm text-slate-400">No situation requests filed</p>
              </div>
            ) : (
              requests.map(req => (
                <div key={req.id} className="bg-white border border-slate-100 rounded-2xl p-5 mb-3 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      {req.situation} 
                      {req.status === 'PENDING' && <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter flex items-center gap-1"><FaHourglassHalf className="text-[8px]"/> Pending</span>}
                      {req.status === 'APPROVED' && <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter flex items-center gap-1"><FaCheckCircle className="text-[8px]"/> Approved</span>}
                      {req.status === 'REJECTED' && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter flex items-center gap-1"><FaTimesCircle className="text-[8px]"/> Rejected</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 max-w-[200px] truncate">{req.description}</div>
                    <div className="text-xs font-bold text-indigo-600 mt-2">Coverage: ₹{req.amount}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {req.status === 'APPROVED' && !req.isClaimed ? (
                      <button 
                        onClick={() => handleClaim(req.id, 'request')}
                        className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
                      >
                        Claim Payout
                      </button>
                    ) : req.isClaimed ? (
                      <span className="text-[10px] font-black text-slate-300 uppercase italic">Claimed</span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Insurance Payments Section */}
          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FaHistory /> Insurance History
            </h4>
            <div className="space-y-3">
              {loading ? null : payments.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-sm text-slate-400">No insurance history available</p>
                </div>
              ) : (
                payments.map((p) => {
                  const planName = p.subscription?.plan?.name || 'Insurance';
                  const coverageAmount = p.subscription?.plan?.coverageAmount || p.amount;
                  return (
                    <ClaimCard
                      key={p.id}
                      title={`${planName} Plan Active`}
                      amount={coverageAmount}
                      status={p.status}
                      isClaimed={p.isClaimed || p.status === 'CLAIMED'}
                      onClaim={() => handleClaim(p.id, 'payment')}
                    />
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}