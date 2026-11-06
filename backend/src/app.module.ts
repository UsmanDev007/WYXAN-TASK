import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { SitesModule } from './sites/sites.module';
import { VisitsModule } from './visits/visits.module';
import { SearchModule } from './search/search.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    UsersModule,
    SitesModule,
    VisitsModule,
    SearchModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
