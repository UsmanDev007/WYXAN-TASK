import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, SiteRecord } from '../database/database.service';
import { CreateSiteDto } from './dto/create-site.dto';

@Injectable()
export class SitesService {
  constructor(private readonly db: DatabaseService) {}

  async findByAddress(address: string): Promise<SiteRecord> {
    const site = await this.db.getSiteByAddress(address);
    if (!site) {
      throw new NotFoundException(`Address "${address}" leads nowhere.`);
    }
    return site;
  }

  async findAll(): Promise<SiteRecord[]> {
    return this.db.getAllSites();
  }

  async create(dto: CreateSiteDto): Promise<SiteRecord> {
    return this.db.upsertSite({
      address: dto.address.toLowerCase().trim(),
      title: dto.title.trim(),
      htmlContent: dto.htmlContent,
      authorId: dto.authorId,
      authorName: dto.authorName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
