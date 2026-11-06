import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { SiteSchema } from '../sites/schemas/site.schema';
import { UserSchema } from '../users/schemas/user.schema';
import { VisitSchema } from '../visits/schemas/visit.schema';

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

  private siteModel: mongoose.Model<any> | null = null;
  private userModel: mongoose.Model<any> | null = null;
  private visitModel: mongoose.Model<any> | null = null;

  private memorySites: Map<string, SiteRecord> = new Map();
  private memoryUsers: Map<string, UserRecord> = new Map();
  private memoryVisits: VisitRecord[] = [];

  async onModuleInit() {
    this.ensureDataDir();
    this.loadFallbackData();

    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smallweb';
    this.logger.log(`Attempting connection to MongoDB at: ${mongoUri}`);

    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
      });

      this.siteModel = mongoose.models.Site || mongoose.model('Site', SiteSchema);
      this.userModel = mongoose.models.User || mongoose.model('User', UserSchema);
      this.visitModel = mongoose.models.Visit || mongoose.model('Visit', VisitSchema);

      this.isMongoConnected = true;
      this.logger.log('✓ Successfully connected to live MongoDB database via Mongoose.');
    } catch (err: any) {
      this.isMongoConnected = false;
      this.logger.warn(`⚠ Local MongoDB not reachable on port 27017 (${err.message}).`);
      this.logger.log('✓ Active storage mode: High-fidelity document store (data/smallweb.json).');
      this.logger.log('  (To connect real MongoDB, start the mongod service or set MONGODB_URI in .env)');
    }
  }

  get isUsingMongo(): boolean {
    return this.isMongoConnected && !!this.siteModel;
  }

  // --- SITES ---
  async getSiteByAddress(address: string): Promise<SiteRecord | null> {
    const normalized = address.toLowerCase().trim();
    if (this.isUsingMongo && this.siteModel) {
      try {
        const site = await this.siteModel.findOne({ address: normalized }).lean();
        if (site) return site as unknown as SiteRecord;
      } catch (err: any) {
        this.logger.warn(`MongoDB query error: ${err.message}, falling back to local store`);
      }
    }
    return this.memorySites.get(normalized) || null;
  }

  async getAllSites(): Promise<SiteRecord[]> {
    if (this.isUsingMongo && this.siteModel) {
      try {
        const sites = await this.siteModel.find().sort({ createdAt: -1 }).lean();
        if (sites.length > 0) return sites as unknown as SiteRecord[];
      } catch (err: any) {
        this.logger.warn(`MongoDB query error: ${err.message}`);
      }
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

    if (this.isUsingMongo && this.siteModel) {
      try {
        await this.siteModel.findOneAndUpdate(
          { address: normalized },
          { $set: siteData },
          { upsert: true, new: true },
        );
      } catch (err: any) {
        this.logger.warn(`MongoDB upsert error: ${err.message}`);
      }
    }

    this.memorySites.set(normalized, siteData);
    this.saveFallbackData();
    return siteData;
  }

  // --- USERS ---
  async getAllUsers(): Promise<UserRecord[]> {
    if (this.isUsingMongo && this.userModel) {
      try {
        const users = await this.userModel.find().sort({ createdAt: 1 }).lean();
        if (users.length > 0) return users as unknown as UserRecord[];
      } catch (err: any) {
        this.logger.warn(`MongoDB query error: ${err.message}`);
      }
    }
    return Array.from(this.memoryUsers.values());
  }

  async getUserByHandle(handle: string): Promise<UserRecord | null> {
    const normalized = handle.toLowerCase().trim();
    if (this.isUsingMongo && this.userModel) {
      try {
        const user = await this.userModel.findOne({ handle: normalized }).lean();
        if (user) return user as unknown as UserRecord;
      } catch (err: any) {
        this.logger.warn(`MongoDB query error: ${err.message}`);
      }
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

    if (this.isUsingMongo && this.userModel) {
      try {
        await this.userModel.findOneAndUpdate(
          { handle: normalized },
          { $set: userData },
          { upsert: true, new: true },
        );
      } catch (err: any) {
        this.logger.warn(`MongoDB upsert error: ${err.message}`);
      }
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

    if (this.isUsingMongo && this.visitModel) {
      try {
        const doc = await this.visitModel.create(visitData);
        visitData.id = doc._id.toString();
      } catch (err: any) {
        visitData.id = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      }
    } else {
      visitData.id = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    this.memoryVisits.unshift(visitData);
    if (this.memoryVisits.length > 1000) {
      this.memoryVisits.pop();
    }
    this.saveFallbackData();
    return visitData;
  }

  async getVisitsByUser(userId: string, limit = 100): Promise<VisitRecord[]> {
    const normalized = userId.toLowerCase().trim();
    if (this.isUsingMongo && this.visitModel) {
      try {
        const visits = await this.visitModel
          .find({ userId: normalized })
          .sort({ timestamp: -1 })
          .limit(limit)
          .lean();
        if (visits.length > 0) return visits as unknown as VisitRecord[];
      } catch (err: any) {
        this.logger.warn(`MongoDB query error: ${err.message}`);
      }
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
    if (this.isUsingMongo && this.siteModel) {
      try {
        const mongoResults = await this.siteModel
          .find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } })
          .lean();

        if (mongoResults.length > 0) {
          sites = mongoResults as unknown as SiteRecord[];
        }
      } catch (e) {
        // Fallback to memory regex
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
        let excerpt = '';
        if (contentIdx !== -1) {
          const start = Math.max(0, contentIdx - 60);
          const end = Math.min(cleanContent.length, contentIdx + q.length + 80);
          excerpt =
            (start > 0 ? '...' : '') +
            cleanContent.slice(start, end).trim() +
            (end < cleanContent.length ? '...' : '');
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
    } catch (e: any) {
      this.logger.warn(`Could not load local data: ${e.message}`);
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
