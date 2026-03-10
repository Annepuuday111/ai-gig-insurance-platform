const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, opts = {}){
  const url = `${BASE}${path}`;

  // automatically attach JSON header and auth token if present
  const headers = opts.headers ? {...opts.headers} : {};

  if (!(headers["Content-Type"] || headers["content-type"])) {
    headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...opts, headers });
  const text = await response.text();
  try { return JSON.parse(text); }
  catch (e) { return text; }
}

export async function registerUser({name, email, phone, password, platform}){
  const body = {name, email, phone, password, platform};
  return await request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

export async function loginUser({identifier, password}){
  const body = {identifier, password};
  return await request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) });
}

export async function getCurrentUser(){
  return await request('/api/auth/me', { method: 'GET' });
}

export async function updateUser(updates) {
  // updates should be an object with any of name, phone, platform, password
  return await request('/api/auth/me', { method: 'PUT', body: JSON.stringify(updates) });
}

export default { registerUser, loginUser, getCurrentUser, updateUser }
