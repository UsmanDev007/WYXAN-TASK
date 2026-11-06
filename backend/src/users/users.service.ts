import { Injectable } from '@nestjs/common';
import { DatabaseService, UserRecord } from '../database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<UserRecord[]> {
    return this.db.getAllUsers();
  }

  async findByHandle(handle: string): Promise<UserRecord | null> {
    return this.db.getUserByHandle(handle);
  }

  async createOrUpdate(user: UserRecord): Promise<UserRecord> {
    return this.db.upsertUser(user);
  }
}
