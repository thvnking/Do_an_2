const API_ROOT = 'https://api.themoviedb.org/3';

function token() {
  if (!process.env.TMDB_READ_ACCESS_TOKEN) {
    const error = new Error('TMDB_READ_ACCESS_TOKEN is not configured');
    error.status = 503;
    throw error;
  }
  return process.env.TMDB_READ_ACCESS_TOKEN;
}

export async function tmdbGet(path, params = {}) {
  const url = new URL(`${API_ROOT}${path}`);
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token()}`, Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    const error = new Error(`TMDB request failed (${response.status})`);
    error.status = response.status === 401 ? 502 : response.status;
    throw error;
  }
  return response.json();
}
