const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, opts = {}) {
  const url = `${BASE}${path}`;
  const headers = opts.headers ? { ...opts.headers } : {};
  if (!(headers['Content-Type'] || headers['content-type'])) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(url, { ...opts, headers });
  const text = await response.text();
  try { return JSON.parse(text); }
  catch (e) { return text; }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function registerUser({ name, email, phone, password, platform }) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, password, platform }),
  });
}

export async function loginUser({ identifier, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

export async function getCurrentUser() {
  return request('/api/auth/me', { method: 'GET' });
}

export async function updateUser(updates) {
  return request('/api/auth/me', { method: 'PUT', body: JSON.stringify(updates) });
}

// ── Plans ─────────────────────────────────────────────────────────────────────
export async function getPlans() {
  return request('/api/plans', { method: 'GET' });
}

export async function getPlanById(id) {
  return request(`/api/plans/${id}`, { method: 'GET' });
}

// ── Subscriptions / Payments ──────────────────────────────────────────────────
/**
 * Subscribe to a plan.
 * @param {object} payload - { planId, method, upiId?, txnReference? }
 *   method: "FREE_TRIAL" | "UPI" | "CARD" | "WALLET"
 */
export async function buyPlan({ planId, method, upiId, txnReference }) {
  return request('/api/subscriptions/buy', {
    method: 'POST',
    body: JSON.stringify({ planId, method, upiId: upiId || null, txnReference: txnReference || null }),
  });
}

export async function getMySubscriptions() {
  return request('/api/subscriptions/my', { method: 'GET' });
}

export async function getPaymentHistory() {
  return request('/api/subscriptions/payments', { method: 'GET' });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export async function getDashboardSummary() {
  return request('/api/subscriptions/dashboard', { method: 'GET' });
}

export default {
  registerUser, loginUser, getCurrentUser, updateUser,
  getPlans, getPlanById,
  buyPlan, getMySubscriptions, getPaymentHistory,
  getDashboardSummary,
};
