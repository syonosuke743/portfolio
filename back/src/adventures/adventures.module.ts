import { Module } from '@nestjs/common';
import { AdventuresService } from './adventures.service';
import { AdventuresController } from './adventures.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GoogleMapsModule } from '../google-maps/google-maps.module';

@Module({
  imports: [PrismaModule,GoogleMapsModule],
  controllers: [AdventuresController],
  providers: [AdventuresService],
})
export class AdventuresModule {}
