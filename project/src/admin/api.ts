const BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin`;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

function headers(token?: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || ANON}`,
    'Apikey': ANON,
  };
}

export async function login(username: string, password: string) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Error de login');
  return res.json() as Promise<{ token: string; username: string; role: string }>;
}

export async function getLandings(token: string) {
  const res = await fetch(`${BASE}/landings`, { headers: headers(token) });
  if (!res.ok) throw new Error('Error al cargar landings');
  return res.json();
}

export async function addLanding(token: string, data: { slug: string; name: string; url: string }) {
  const res = await fetch(`${BASE}/landings`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear landing');
  return res.json();
}

export async function getStats(token: string, slug: string, from?: string, to?: string) {
  const params = new URLSearchParams({ slug });
  if (from) params.set('from', from);
  if (to)   params.set('to', to);
  const res = await fetch(`${BASE}/stats?${params}`, { headers: headers(token) });
  if (!res.ok) throw new Error('Error al cargar estadísticas');
  return res.json();
}

export async function getOverview(token: string, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to)   params.set('to', to);
  const res = await fetch(`${BASE}/overview?${params}`, { headers: headers(token) });
  if (!res.ok) throw new Error('Error al cargar overview');
  return res.json();
}
