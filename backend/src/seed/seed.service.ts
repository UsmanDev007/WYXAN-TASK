import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SEED_SITES, SEED_USERS } from './seed.data';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly db: DatabaseService) {}

  async seed() {
    this.logger.log('Starting deterministic seed of The Small Web...');

    // 1. Seed Users (Idempotent upsert by handle)
    const userMap = new Map<string, string>();
    for (const u of SEED_USERS) {
      const user = await this.db.upsertUser({
        handle: u.handle,
        name: u.name,
        bio: u.bio,
        avatar: u.avatar,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      });
      userMap.set(u.handle, user.name);
      this.logger.log(`  User: ${user.name} (@${user.handle})`);
    }

    // 2. Seed Sites (Idempotent upsert by address)
    for (const s of SEED_SITES) {
      const authorName = userMap.get(s.authorHandle) || 'Unknown Author';
      await this.db.upsertSite({
        address: s.address,
        title: s.title,
        htmlContent: s.htmlContent,
        authorId: s.authorHandle,
        authorName,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      });
      this.logger.log(`  Site: ${s.title} (${s.address})`);
    }

    // 3. Deterministic 1-hour Browsing History across users
    const now = Date.now();
    const minute = 60 * 1000;

    const visitsToSeed: Array<{
      userId: string;
      userName: string;
      address: string;
      siteTitle: string;
      source: 'typed' | 'link' | 'history' | 'back_forward' | 'search';
      minutesAgo: number;
    }> = [
      // Alice Walker: Trailblazer who has been nearly everywhere
      { userId: 'alice', userName: 'Alice Walker', address: 'ephemera.log', siteTitle: 'The Cabinet of Lost Addresses', source: 'typed', minutesAgo: 58 },
      { userId: 'alice', userName: 'Alice Walker', address: 'tidepool.zz', siteTitle: 'The Intertidal Archive', source: 'link', minutesAgo: 54 },
      { userId: 'alice', userName: 'Alice Walker', address: 'deepchronicle.org', siteTitle: 'Benthic Soundscapes & Hydrophone Logs', source: 'link', minutesAgo: 49 },
      { userId: 'alice', userName: 'Alice Walker', address: 'signal.zone', siteTitle: 'Shortwave, VLF & Atmospheric Noise', source: 'link', minutesAgo: 45 },
      { userId: 'alice', userName: 'Alice Walker', address: 'monolith.io', siteTitle: 'The Quiet Geometry — Brutalism in Fog', source: 'link', minutesAgo: 41 },
      { userId: 'alice', userName: 'Alice Walker', address: 'atlas.void', siteTitle: 'The Unmapped Constellations', source: 'link', minutesAgo: 38 },
      { userId: 'alice', userName: 'Alice Walker', address: 'lichen.notes', siteTitle: 'Symbiosis in Slow Motion', source: 'link', minutesAgo: 34 },
      { userId: 'alice', userName: 'Alice Walker', address: 'greenhouse.lab', siteTitle: 'The Night Garden Journal', source: 'link', minutesAgo: 30 },
      { userId: 'alice', userName: 'Alice Walker', address: 'soil.network', siteTitle: 'Mycelial Telegraphy & Root Communication', source: 'link', minutesAgo: 26 },
      { userId: 'alice', userName: 'Alice Walker', address: 'nowhere.void', siteTitle: '[Nowhere]', source: 'link', minutesAgo: 23 },
      { userId: 'alice', userName: 'Alice Walker', address: 'soil.network', siteTitle: 'Mycelial Telegraphy & Root Communication', source: 'back_forward', minutesAgo: 22 },
      { userId: 'alice', userName: 'Alice Walker', address: 'lichen.notes', siteTitle: 'Symbiosis in Slow Motion', source: 'back_forward', minutesAgo: 19 },
      { userId: 'alice', userName: 'Alice Walker', address: 'concrete.poem', siteTitle: 'Typography of Neglect', source: 'search', minutesAgo: 15 },
      { userId: 'alice', userName: 'Alice Walker', address: 'sunken.reef', siteTitle: '[Nowhere]', source: 'link', minutesAgo: 11 },
      { userId: 'alice', userName: 'Alice Walker', address: 'tidepool.zz', siteTitle: 'The Intertidal Archive', source: 'history', minutesAgo: 7 },
      { userId: 'alice', userName: 'Alice Walker', address: 'ephemera.log', siteTitle: 'The Cabinet of Lost Addresses', source: 'history', minutesAgo: 2 },

      // Dr. Aris Thorne: Marine ecologist with repeated site checks
      { userId: 'aris', userName: 'Dr. Aris Thorne', address: 'tidepool.zz', siteTitle: 'The Intertidal Archive', source: 'typed', minutesAgo: 59 },
      { userId: 'aris', userName: 'Dr. Aris Thorne', address: 'deepchronicle.org', siteTitle: 'Benthic Soundscapes & Hydrophone Logs', source: 'typed', minutesAgo: 51 },
      { userId: 'aris', userName: 'Dr. Aris Thorne', address: 'abyssal.plain', siteTitle: '[Nowhere]', source: 'link', minutesAgo: 44 },
      { userId: 'aris', userName: 'Dr. Aris Thorne', address: 'deepchronicle.org', siteTitle: 'Benthic Soundscapes & Hydrophone Logs', source: 'back_forward', minutesAgo: 43 },
      { userId: 'aris', userName: 'Dr. Aris Thorne', address: 'soil.network', siteTitle: 'Mycelial Telegraphy & Root Communication', source: 'typed', minutesAgo: 33 },
      { userId: 'aris', userName: 'Dr. Aris Thorne', address: 'greenhouse.lab', siteTitle: 'The Night Garden Journal', source: 'link', minutesAgo: 21 },
      { userId: 'aris', userName: 'Dr. Aris Thorne', address: 'tidepool.zz', siteTitle: 'The Intertidal Archive', source: 'history', minutesAgo: 8 },

      // Maya Lin: Botanist and map enthusiast
      { userId: 'maya', userName: 'Maya Lin', address: 'atlas.void', siteTitle: 'The Unmapped Constellations', source: 'typed', minutesAgo: 55 },
      { userId: 'maya', userName: 'Maya Lin', address: 'lichen.notes', siteTitle: 'Symbiosis in Slow Motion', source: 'link', minutesAgo: 46 },
      { userId: 'maya', userName: 'Maya Lin', address: 'greenhouse.lab', siteTitle: 'The Night Garden Journal', source: 'link', minutesAgo: 37 },
      { userId: 'maya', userName: 'Maya Lin', address: 'soil.network', siteTitle: 'Mycelial Telegraphy & Root Communication', source: 'link', minutesAgo: 28 },
      { userId: 'maya', userName: 'Maya Lin', address: 'lichen.notes', siteTitle: 'Symbiosis in Slow Motion', source: 'history', minutesAgo: 16 },
      { userId: 'maya', userName: 'Maya Lin', address: 'atlas.void', siteTitle: 'The Unmapped Constellations', source: 'typed', minutesAgo: 5 },

      // Julian Vance: Radio dial explorations
      { userId: 'julian', userName: 'Julian Vance', address: 'signal.zone', siteTitle: 'Shortwave, VLF & Atmospheric Noise', source: 'typed', minutesAgo: 53 },
      { userId: 'julian', userName: 'Julian Vance', address: 'ghost.station', siteTitle: '[Nowhere]', source: 'link', minutesAgo: 42 },
      { userId: 'julian', userName: 'Julian Vance', address: 'signal.zone', siteTitle: 'Shortwave, VLF & Atmospheric Noise', source: 'back_forward', minutesAgo: 41 },
      { userId: 'julian', userName: 'Julian Vance', address: 'monolith.io', siteTitle: 'The Quiet Geometry — Brutalism in Fog', source: 'link', minutesAgo: 31 },
      { userId: 'julian', userName: 'Julian Vance', address: 'concrete.poem', siteTitle: 'Typography of Neglect', source: 'link', minutesAgo: 17 },
      { userId: 'julian', userName: 'Julian Vance', address: 'signal.zone', siteTitle: 'Shortwave, VLF & Atmospheric Noise', source: 'history', minutesAgo: 4 },
    ];

    // Record visits deterministically
    for (const v of visitsToSeed) {
      await this.db.recordVisit({
        userId: v.userId,
        userName: v.userName,
        address: v.address,
        siteTitle: v.siteTitle,
        source: v.source,
        timestamp: new Date(now - v.minutesAgo * minute),
      });
    }

    this.logger.log(`✓ Seed complete: 4 People, ${SEED_SITES.length} Sites, ${visitsToSeed.length} Historical Visits recorded across the past hour.`);
  }
}
