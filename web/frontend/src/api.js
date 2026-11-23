const API_BASE = '/api';

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem('cinemind-token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers, body: options.body === undefined ? undefined : JSON.stringify(options.body) });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Yêu cầu thất bại (${response.status})`);
  return payload;
}

export function setToken(token) {
  if (token) localStorage.setItem('cinemind-token', token);
  else localStorage.removeItem('cinemind-token');
}
