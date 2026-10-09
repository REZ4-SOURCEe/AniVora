/* ============================================
   ANIVORA — API CLIENT
============================================ */

// ⚠️ این رو با URL Worker خودت عوض کن
const API_BASE = 'https://anivora-api.prod-relay-279a51.workers.dev';

const TOKEN_KEY = 'anivora_token';
const USER_CACHE_KEY = 'anivora_user_cache';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch(e) { return null; }
}
export function setToken(token) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch(e) {}
}
export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch(e) {}
}

export function getCachedUser() {
  try {
    const s = localStorage.getItem(USER_CACHE_KEY);
    return s ? JSON.parse(s) : null;
  } catch(e) { return null; }
}
export function setCachedUser(user) {
  try { localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user)); } catch(e) {}
}
export function clearCachedUser() {
  try { localStorage.removeItem(USER_CACHE_KEY); } catch(e) {}
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      cache: 'no-store'
    });
  } catch (netErr) {
    throw new Error('Network error. Please check your connection.');
  }

  let data = {};
  try { data = await res.json(); } catch(e) {}

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

export async function apiSignup(email, password, username) {
  const res = await apiFetch('/api/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, username })
  });
  setToken(res.token);
  setCachedUser(res.user);
  return res.user;
}

export async function apiLogin(email, password) {
  const res = await apiFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setToken(res.token);
  setCachedUser(res.user);
  return res.user;
}

export async function apiGetMe() {
  const res = await apiFetch('/api/me');
  setCachedUser(res.user);
  return res.user;
}

export async function apiUpdateProfile(username, avatar) {
  const res = await apiFetch('/api/profile', {
    method: 'PUT',
    body: JSON.stringify({ username, avatar })
  });
  return res;
}

export function apiLogout() {
  clearToken();
  clearCachedUser();
}

export async function apiSaveAnime(animeId, data) {
  return apiFetch('/api/list', {
    method: 'POST',
    body: JSON.stringify({ animeId, ...data })
  });
}

export async function apiGetList() {
  const res = await apiFetch('/api/list');
  return res.list || [];
}

export async function apiDeleteAnime(animeId) {
  return apiFetch(`/api/list?animeId=${animeId}`, { method: 'DELETE' });
}

export async function apiHealth() {
  return apiFetch('/api/health');
}