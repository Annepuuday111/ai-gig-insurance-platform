const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, opts = {}){
  const url = `${BASE}${path}`
  const res = await fetch(url, opts)
  const text = await res.text()
  try { return JSON.parse(text) }
  catch(e){ return text }
}

export async function registerUser({name, email, phone, password, platform}){
  const body = {name, email, phone, password, platform}
  const res = await request('/api/auth/register', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)})
  return res
}

export async function loginUser({identifier, password}){
  const body = {identifier, password}
  const res = await request('/api/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)})
  return res
}

export default { registerUser, loginUser }
