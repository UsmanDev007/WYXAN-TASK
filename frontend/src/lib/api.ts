const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Site {
  address: string;
  title: string;
  htmlContent: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  handle: string;
  name: string;
  bio?: string;
  avatar?: string;
}

export interface Visit {
  id: string;
  userId: string;
  userName: string;
  address: string;
  siteTitle: string;
  source: 'typed' | 'link' | 'history' | 'back_forward' | 'search';
  timestamp: string;
}

export interface SearchResult extends Site {
  excerpt: string;
  matchScore: number;
}

export async function fetchSite(address: string): Promise<Site | null> {
  try {
    const res = await fetch(`${API_BASE}/sites/${encodeURIComponent(address)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch site: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching site:', err);
    return null;
  }
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
}

export async function fetchVisits(userId: string): Promise<Visit[]> {
  try {
    const res = await fetch(`${API_BASE}/visits?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch visits');
    return await res.json();
  } catch (err) {
    console.error('Error fetching visits:', err);
    return [];
  }
}

export async function recordVisit(payload: {
  userId: string;
  userName: string;
  address: string;
  source: Visit['source'];
}): Promise<Visit | null> {
  try {
    const res = await fetch(`${API_BASE}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to record visit');
    return await res.json();
  } catch (err) {
    console.error('Error recording visit:', err);
    return null;
  }
}

export async function searchSites(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) throw new Error('Failed to search sites');
    return await res.json();
  } catch (err) {
    console.error('Error searching sites:', err);
    return [];
  }
}

export async function publishSite(payload: {
  address: string;
  title: string;
  htmlContent: string;
  authorId: string;
  authorName: string;
}): Promise<Site> {
  const res = await fetch(`${API_BASE}/sites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to publish site');
  }
  return await res.json();
}
