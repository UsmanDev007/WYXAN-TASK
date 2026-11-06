import { Site, User, Visit, SearchResult } from './types';
export type { Site, User, Visit, SearchResult };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchSite(address: string): Promise<{ site: Site | null; isOffline?: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/sites/${encodeURIComponent(address)}`, {
      cache: 'no-store',
    });
    if (res.status === 404) {
      return { site: null, isOffline: false };
    }
    if (!res.ok) {
      return { site: null, isOffline: false };
    }
    const site = await res.json();
    return { site, isOffline: false };
  } catch (err) {
    console.error('Connection error fetching site:', err);
    return { site: null, isOffline: true };
  }
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/users`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Connection error fetching users:', err);
    return [];
  }
}

export async function fetchVisits(userId: string): Promise<Visit[]> {
  try {
    const res = await fetch(`${API_BASE}/visits?userId=${encodeURIComponent(userId)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Connection error fetching visits:', err);
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
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Connection error recording visit:', err);
    return null;
  }
}

export async function searchSites(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query.trim())}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Connection error searching sites:', err);
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
