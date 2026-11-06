import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SearchService {
  constructor(private readonly db: DatabaseService) {}

  async search(query: string) {
    if (!query || !query.trim()) return [];
    return this.db.searchSites(query);
  }
}
