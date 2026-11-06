import { Injectable } from '@nestjs/common';
import { DatabaseService, VisitRecord } from '../database/database.service';
import { RecordVisitDto } from './dto/record-visit.dto';

@Injectable()
export class VisitsService {
  constructor(private readonly db: DatabaseService) {}

  async recordVisit(dto: RecordVisitDto): Promise<VisitRecord> {
    const site = await this.db.getSiteByAddress(dto.address);
    const siteTitle = site ? site.title : '[Nowhere]';

    return this.db.recordVisit({
      userId: dto.userId.toLowerCase().trim(),
      userName: dto.userName.trim(),
      address: dto.address.toLowerCase().trim(),
      siteTitle,
      source: dto.source,
      timestamp: new Date(),
    });
  }

  async getVisitsByUser(userId: string, limit = 100): Promise<VisitRecord[]> {
    return this.db.getVisitsByUser(userId, limit);
  }
}
