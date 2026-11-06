import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

export interface SiteRecord {
  address: string;
  title: string;
  htmlContent: string;
  authorId: string;
  authorName: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UserRecord {
  handle: string;
  name: string;
  bio: string;
  avatar: string;
  createdAt: Date | string;
}

export interface VisitRecord {
  id?: string;
  userId: string;
  userName: string;
  address: string;
  siteTitle: string;
  source: 'typed' | 'link' | 'history' | 'back_forward' | 'search';
  timestamp: Date | string;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private isMongoConnected = false;
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly dataFile = path.resolve(this.dataDir, 'smallweb.json');

  private memorySites: Map<string, SiteRecord> = new Map();
  private memoryUsers: Map<string, UserRecord> = new Map();
  private memoryVisits: VisitRecord[] = [];

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    this.ensureDataDir();
    this.loadFallbackData();

    if (this.connection && this.connection.readyState === 1) {
      this.isMongoConnected = true;
      this.logger.log('Connected to MongoDB database via Mongoose.');
    } else {
      this.connection?.on('connected', () => {
        this.isMongoConnected = true;
        this.logger.log('MongoDB connection established.');
      });
      this.connection?.on('error', (err) => {
        this.logger.warn(`MongoDB not accessible (${err.message}). Using local document fallback.`);
      });
      
      // If not connected after 1s, report fallback active
      setTimeout(() => {
        if (!this.isMongoConnected) {
          this.logger.log('Active storage: Local high-fidelity document store (data/smallweb.json).');
        }
      }, 1000);
    }
  }

  get isUsingMongo(): boolean {
    return this.isMongoConnected && this.connection.readyState === 1;
  }

  // --- SITES ---
  async getSiteByAddress(address: string): Promise<SiteRecord | null> {
    const normalized = address.toLowerCase().trim();
    if (this.isUsingMongo) {
      const site = await this.connection.model('Site').findOne({ address: normalized }).lean();
      return site as unknown as SiteRecord;
    }
    return this.memorySites.get(normalized) || null;
  }

  async getAllSites(): Promise<SiteRecord[]> {
    if (this.isUsingMongo) {
      const sites = await this.connection.model('Site').find().sort({ createdAt: -1 }).lean();
      return sites as unknown as SiteRecord[];
    }
    return Array.from(this.memorySites.values());
  }

  async upsertSite(site: SiteRecord): Promise<SiteRecord> {
    const normalized = site.address.toLowerCase().trim();
    const siteData: SiteRecord = {
      ...site,
      address: normalized,
      updatedAt: new Date(),
      createdAt: site.createdAt ? new Date(site.createdAt) : new Date(),
    };

    if (this.isUsingMongo) {
      await this.connection.model('Site').findOneAndUpdate(
        { address: normalized },
        { $set: siteData },
        { upsert: true, new: true },
      );
    }

    this.memorySites.set(normalized, siteData);
    this.saveFallbackData();
    return siteData;
  }

  // --- USERS ---
  async getAllUsers(): Promise<UserRecord[]> {
    if (this.isUsingMongo) {
      const users = await this.connection.model('User').find().sort({ createdAt: 1 }).lean();
      return users as unknown as UserRecord[];
    }
    return Array.from(this.memoryUsers.values());
  }

  async getUserByHandle(handle: string): Promise<UserRecord | null> {
    const normalized = handle.toLowerCase().trim();
    if (this.isUsingMongo) {
      const user = await this.connection.model('User').findOne({ handle: normalized }).lean();
      return user as unknown as UserRecord;
    }
    return this.memoryUsers.get(normalized) || null;
  }

  async upsertUser(user: UserRecord): Promise<UserRecord> {
    const normalized = user.handle.toLowerCase().trim();
    const userData: UserRecord = {
      ...user,
      handle: normalized,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
    };

    if (this.isUsingMongo) {
      await this.connection.model('User').findOneAndUpdate(
        { handle: normalized },
        { $set: userData },
        { upsert: true, new: true },
      );
    }

    this.memoryUsers.set(normalized, userData);
    this.saveFallbackData();
    return userData;
  }

  // --- VISITS ---
  async recordVisit(visit: Omit<VisitRecord, 'id'>): Promise<VisitRecord> {
    const visitData: VisitRecord = {
      ...visit,
      address: visit.address.toLowerCase().trim(),
      timestamp: visit.timestamp ? new Date(visit.timestamp) : new Date(),
    };

    if (this.isUsingMongo) {
      const doc = await this.connection.model('Visit').create(visitData);
      visitData.id = doc._id.toString();
    } else {
      visitData.id = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    this.memoryVisits.unshift(visitData);
    // Keep max 1000 visits in memory
    if (this.memoryVisits.length > 1000) {
      this.memoryVisits.pop();
    }
    this.saveFallbackData();
    return visitData;
  }

  async getVisitsByUser(userId: string, limit = 100): Promise<VisitRecord[]> {
    const normalized = userId.toLowerCase().trim();
    if (this.isUsingMongo) {
      const visits = await this.connection
        .model('Visit')
        .find({ userId: normalized })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
      return visits as unknown as VisitRecord[];
    }

    return this.memoryVisits
      .filter((v) => v.userId.toLowerCase() === normalized)
      .slice(0, limit);
  }

  // --- SEARCH ---
  async searchSites(query: string): Promise<Array<SiteRecord & { excerpt: string; matchScore: number }>> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    let sites: SiteRecord[] = [];
    if (this.isUsingMongo) {
      try {
        // Try MongoDB text search first
        const mongoResults = await this.connection
          .model('Site')
          .find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } })
          .lean();

        if (mongoResults.length > 0) {
          sites = mongoResults as unknown as SiteRecord[];
        }
      } catch (e) {
        // Fallback to regex if text index is not built yet
      }
    }

    if (sites.length === 0) {
      sites = Array.from(this.memorySites.values());
    }

    const matches: Array<SiteRecord & { excerpt: string; matchScore: number }> = [];

    for (const site of sites) {
      const cleanContent = site.htmlContent.replace(/<[^>]*>/g, ' ');
      const titleLower = site.title.toLowerCase();
      const addressLower = site.address.toLowerCase();
      const contentLower = cleanContent.toLowerCase();

      let matchScore = 0;
      if (addressLower.includes(q)) matchScore += 10;
      if (titleLower.includes(q)) matchScore += 8;

      const contentIdx = contentLower.indexOf(q);
      if (contentIdx !== -1) {
        matchScore += 5;
      }

      if (matchScore > 0) {
        // Extract excerpt with context around the query
        let excerpt = '';
        if (contentIdx !== -1) {
          const start = Math.max(0, contentIdx - 60);
          const end = Math.min(cleanContent.length, contentIdx + q.length + 80);
          excerpt = (start > 0 ? '...' : '') + cleanContent.slice(start, end).trim() + (end < cleanContent.length ? '...' : '');
        } else {
          excerpt = cleanContent.slice(0, 120) + '...';
        }

        matches.push({
          ...site,
          excerpt,
          matchScore,
        });
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  // --- PERSISTENCE UTILS ---
  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
      } catch (err) {
        // Ignore
      }
    }
  }

  private loadFallbackData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const raw = fs.readFileSync(this.dataFile, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.sites)) {
          data.sites.forEach((s: SiteRecord) => this.memorySites.set(s.address.toLowerCase(), s));
        }
        if (Array.isArray(data.users)) {
          data.users.forEach((u: UserRecord) => this.memoryUsers.set(u.handle.toLowerCase(), u));
        }
        if (Array.isArray(data.visits)) {
          this.memoryVisits = data.visits;
        }
      }
    } catch (e) {
      this.logger.warn(`Could not load local fallback data: ${e.message}`);
    }
  }

  private saveFallbackData() {
    try {
      this.ensureDataDir();
      const payload = {
        sites: Array.from(this.memorySites.values()),
        users: Array.from(this.memoryUsers.values()),
        visits: this.memoryVisits,
      };
      fs.writeFileSync(this.dataFile, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      // Ignore
    }
  }
}
