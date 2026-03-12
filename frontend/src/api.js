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

export async function adminChangeCredentials(updates) {
  return request('/api/auth/admin/change', {
    method: 'PUT',
    body: JSON.stringify(updates),
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

// ── User queries / chat support ─────────────────────────────────────────────────
export async function postQuery(question) {
  return request('/api/queries', { method: 'POST', body: JSON.stringify({ question }) });
}
export async function claimPayment(id) {
  return request(`/api/payments/${id}/claim`, { method: 'POST' });
}
export async function getMyQueries() {
  return request('/api/queries/my', { method: 'GET' });
}

// ── Admin endpoints ──────────────────────────────────────────────────────────
export async function adminListUsers() {
  return request('/api/admin/users', { method: 'GET' });
}
export async function adminDeleteUser(id) {
  return request(`/api/admin/users/${id}`, { method: 'DELETE' });
}
export async function adminUpdateUser(id, updates) {
  return request(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}

export async function adminListPlans() {
  return request('/api/admin/plans', { method: 'GET' });
}
export async function adminUpdatePlan(id, updates) {
  return request(`/api/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}

export async function adminListPayments() {
  return request('/api/admin/payments', { method: 'GET' });
}
export async function adminApprovePayment(id) {
  return request(`/api/admin/payments/${id}/approve`, { method: 'PUT' });
}
export async function adminRejectPayment(id) {
  return request(`/api/admin/payments/${id}/reject`, { method: 'PUT' });
}
export async function adminDeletePayment(id) {
  return request(`/api/admin/payments/${id}`, { method: 'DELETE' });
}

export async function adminListQueries() {
  return request('/api/admin/queries', { method: 'GET' });
}
export async function adminReplyQuery(id, body) {
  return request(`/api/admin/queries/${id}/reply`, { method: 'PUT', body: JSON.stringify(body) });
}

// ── Partners ──────────────────────────────────────────────────────────────────
export async function getPartners() {
  return request('/api/partners', { method: 'GET' });
}

export async function adminAddPartner(partner) {
  return request('/api/admin/partners', { method: 'POST', body: JSON.stringify(partner) });
}

export async function adminDeletePartner(id) {
  return request(`/api/admin/partners/${id}`, { method: 'DELETE' });
}

// Admin Wallet
export async function adminGetWallet() {
  return request('/api/admin/wallet', { method: 'GET' });
}

export async function submitClaimRequest(data) {
  return request('/api/claims/requests', { method: 'POST', body: JSON.stringify(data) });
}
export async function getMyClaimRequests() {
  return request('/api/claims/requests/my', { method: 'GET' });
}
export async function claimRequestPayout(id) {
  return request(`/api/claims/requests/${id}/claim`, { method: 'POST' });
}
export async function adminListClaimRequests() {
  return request('/api/claims/requests/admin/all', { method: 'GET' });
}
export async function adminApproveClaimRequest(id) {
  return request(`/api/claims/requests/admin/${id}/approve`, { method: 'PUT' });
}
export async function adminRejectClaimRequest(id) {
  return request(`/api/claims/requests/admin/${id}/reject`, { method: 'PUT' });
}

// Notifications
export async function getMyNotifications() {
  return request('/api/notifications', { method: 'GET' });
}
export async function markNotificationAsRead(id) {
  return request(`/api/notifications/${id}/read`, { method: 'PUT' });
}

export default {
  registerUser, loginUser, getCurrentUser, updateUser,
  getPlans, getPlanById,
  buyPlan, getMySubscriptions, getPaymentHistory,
  getDashboardSummary,
  postQuery, getMyQueries,
  adminChangeCredentials,
  adminListUsers, adminDeleteUser, adminUpdateUser,
  adminListPlans, adminUpdatePlan,
  adminListPayments, adminApprovePayment, adminRejectPayment, adminDeletePayment,
  adminListQueries, adminReplyQuery,
  claimPayment,
  submitClaimRequest, getMyClaimRequests, claimRequestPayout,
  adminListClaimRequests, adminApproveClaimRequest, adminRejectClaimRequest,
  adminGetWallet,
  getMyNotifications, markNotificationAsRead,
  getPartners, adminAddPartner, adminDeletePartner,
};
