import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminListUsers,
  adminDeleteUser,
  adminUpdateUser,
  adminListPlans,
  adminUpdatePlan,
  adminListPayments,
  adminApprovePayment,
  adminListQueries,
  adminReplyQuery,
  adminChangeCredentials,
} from "../api";
// icons for sidebar and cards
import { FaUsers, FaQuestionCircle, FaClipboardList, FaMoneyBillWave, FaCog, FaSignOutAlt } from "react-icons/fa";

function ReplyForm({ onReply }) {
  const [text, setText] = useState("");
  return (
    <div className="mt-2">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        className="w-full border p-2"
        placeholder="Type your answer here"
      />
      <button
        onClick={() => { onReply(text); setText(""); }}
        className="mt-1 px-3 py-1 bg-blue-600 text-white rounded"
      >Reply</button>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState("users");
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [queries, setQueries] = useState([]);
  const [settings, setSettings] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(null);

  // initial load and authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin");
    if (!token || isAdmin !== 'true') {
      navigate("/login");
      return;
    }
    // always fetch everything once so dashboard summary is accurate
    loadUsers();
    loadPlans();
    loadPayments();
    loadQueries();
  }, []);

  // reload when section changes (for actions like delete/approve)
  useEffect(() => {
    if (section === "users") loadUsers();
    if (section === "plans") loadPlans();
    if (section === "payments") loadPayments();
    if (section === "queries") loadQueries();
  }, [section]);

  async function loadUsers() {
    try {
      const res = await adminListUsers();
      if (res && res.error) {
        navigate("/login");
        return;
      }
      setUsers(res);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadPlans() {
    try {
      const res = await adminListPlans();
      if (res && res.error) {
        navigate("/login");
        return;
      }
      setPlans(res);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadPayments() {
    try {
      const res = await adminListPayments();
      if (res && res.error) {
        navigate("/login");
        return;
      }
      setPayments(res);
    } catch (e) {
      console.error(e);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await adminDeleteUser(id);
    loadUsers();
  };

  const handleApprove = async (id) => {
    await adminApprovePayment(id);
    loadPayments();
  };

  async function loadQueries() {
    try {
      const res = await adminListQueries();
      if (res && res.error) {
        navigate("/login");
        return;
      }
      setQueries(res);
    } catch (e) { console.error(e); }
  }

  const handleReply = async (id, answer) => {
    await adminReplyQuery(id, { answer });
    loadQueries();
  };

  const handlePlanChange = (idx, field, value) => {
    const copy = [...plans];
    copy[idx][field] = value;
    setPlans(copy);
  };

  const handleSavePlan = async (id, plan) => {
    await adminUpdatePlan(id, plan);
    setMessage("Plan updated");
    loadPlans();
  };

  const handleSettingsSave = async () => {
    try {
      const res = await adminChangeCredentials(settings);
      setMessage(res.message);
      if (res.token) {
        localStorage.setItem("token", res.token);
      }
      // if email changed we have a fresh token
    } catch (e) {
      setMessage("Failed to update credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <aside className="w-60 bg-white shadow h-screen sticky top-0 p-6">
          <nav className="flex flex-col gap-4">
            <button
              onClick={() => setSection("users")}
              className={`flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100 transition ${section==="users"?"bg-green-50 font-semibold": ""}`}
            ><FaUsers className="text-lg" /> Users</button>
            <button
              onClick={() => setSection("queries")}
              className={`flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100 transition ${section==="queries"?"bg-green-50 font-semibold": ""}`}
            ><FaQuestionCircle className="text-lg" /> Queries</button>
            <button
              onClick={() => setSection("plans")}
              className={`flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100 transition ${section==="plans"?"bg-green-50 font-semibold": ""}`}
            ><FaClipboardList className="text-lg" /> Plans</button>
            <button
              onClick={() => setSection("payments")}
              className={`flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100 transition ${section==="payments"?"bg-green-50 font-semibold": ""}`}
            ><FaMoneyBillWave className="text-lg" /> Payments</button>
            <button
              onClick={() => setSection("settings")}
              className={`flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100 transition ${section==="settings"?"bg-green-50 font-semibold": ""}`}
            ><FaCog className="text-lg" /> Settings</button>
            <button
              onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
              className="flex items-center gap-2 py-2 px-3 rounded text-red-600 hover:bg-red-50 transition mt-6"
            ><FaSignOutAlt className="text-lg" /> Logout</button>
          </nav>
        </aside>
        <main className="flex-1 p-6">
          {message && <div className="mb-4 text-green-600">{message}</div>}
          {/* banner and summary cards */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="card flex items-center">
                <FaUsers className="text-3xl text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-xl font-semibold">{users.length || 0}</p>
                </div>
              </div>
              <div className="card flex items-center">
                <FaClipboardList className="text-3xl text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Plans</p>
                  <p className="text-xl font-semibold">{plans.length || 0}</p>
                </div>
              </div>
              <div className="card flex items-center">
                <FaMoneyBillWave className="text-3xl text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Payments</p>
                  <p className="text-xl font-semibold">{payments.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {section === "users" && (
            <table className="w-full table-auto border border-gray-200">
              <thead className="bg-gray-100 text-gray-700">
                <tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Name</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Phone</th><th className="p-2 text-left">Action</th></tr>
              </thead>
              <tbody className="text-gray-600">
                {users.map((u,i) => (
                  <tr key={u.id} className={
                    `border-t ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`
                  }>
                    <td className="p-2">{u.id}</td>
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.phone}</td>
                    <td className="p-2"><button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {section === "queries" && (
            <div className="space-y-4">
              {queries.map(q => (
                <div key={q.id} className="p-4 bg-white shadow rounded hover:shadow-lg transition">
                  <p><strong>User:</strong> {q.user?.email || q.user?.id}</p>
                  <p><strong>Question:</strong> {q.question}</p>
                  <p className="text-xs text-gray-500"><strong>Asked:</strong> {new Date(q.createdAt).toLocaleString()}</p>
                  {q.answer ? (
                    <div className="mt-2">
                      <p><strong>Answer:</strong> {q.answer}</p>
                      <p className="text-xs text-gray-500"><strong>Answered:</strong> {new Date(q.answeredAt).toLocaleString()}</p>
                    </div>
                  ) : (
                    <ReplyForm onReply={ans => handleReply(q.id, ans)} />
                  )}
                </div>
              ))}
            </div>
          )}

          {section === "plans" && (
            <div className="space-y-4">
              {plans.map((plan, idx) => (
                <div key={plan.id} className="p-4 bg-white shadow rounded hover:shadow-lg transition">
                  <h3 className="font-semibold mb-2 text-lg">{plan.name}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="w-full sm:w-auto">Weekly Premium</label>
                    <input type="number" value={plan.weeklyPremium} onChange={e=>handlePlanChange(idx,'weeklyPremium',e.target.value)} className="border px-2 py-1" />
                    <button onClick={() => handleSavePlan(plan.id, { weeklyPremium: plan.weeklyPremium })} className="ml-2 px-3 py-1 bg-green-600 text-white rounded">Save</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === "payments" && (
            <table className="w-full table-auto border border-gray-200">
              <thead className="bg-gray-100 text-gray-700">
                <tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">User</th><th className="p-2 text-left">Amount</th><th className="p-2 text-left">Status</th><th className="p-2 text-left">Action</th></tr>
              </thead>
              <tbody className="text-gray-600">
                {payments.map((p,i) => (
                  <tr key={p.id} className={
                    `border-t ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`
                  }>
                    <td className="p-2">{p.id}</td>
                    <td className="p-2">{p.user?.email}</td>
                    <td className="p-2">{p.amount}</td>
                    <td className="p-2">{p.status}</td>
                    <td className="p-2">
                      {p.status === 'PENDING' && <button onClick={() => handleApprove(p.id)} className="text-green-600 hover:underline">Approve</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {section === "settings" && (
            <div className="max-w-md bg-white p-6 rounded shadow">
              <div className="mb-4">
                <label className="block mb-1">New email</label>
                <input type="email" value={settings.email} onChange={e=>setSettings({...settings,email:e.target.value})} className="border w-full p-2" />
              </div>
              <div className="mb-4">
                <label className="block mb-1">New password</label>
                <input type="password" value={settings.password} onChange={e=>setSettings({...settings,password:e.target.value})} className="border w-full p-2" />
              </div>
              <button onClick={handleSettingsSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
