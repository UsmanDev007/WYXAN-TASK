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

export type VisitSource = 'typed' | 'link' | 'history' | 'back_forward' | 'search';

export interface Visit {
  id: string;
  userId: string;
  userName: string;
  address: string;
  siteTitle: string;
  source: VisitSource;
  timestamp: string;
}

export interface SearchResult extends Site {
  excerpt: string;
  matchScore: number;
}

export interface HistoryItem {
  address: string;
  site: Site | null;
  isNotFound: boolean;
  scrollPosition: number;
}
