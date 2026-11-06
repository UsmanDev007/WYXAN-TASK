import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from './database.service';
import { Site, SiteSchema } from '../sites/schemas/site.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Visit, VisitSchema } from '../visits/schemas/visit.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
      { name: User.name, schema: UserSchema },
      { name: Visit.name, schema: VisitSchema },
    ]),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, MongooseModule],
})
export class DatabaseModule {}
