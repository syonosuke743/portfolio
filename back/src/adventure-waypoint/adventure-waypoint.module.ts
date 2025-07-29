import { Module } from '@nestjs/common';
import { AdventureWaypointService } from './adventure-waypoint.service';
import { AdventureWaypointController } from './adventure-waypoint.controller';

@Module({
  controllers: [AdventureWaypointController],
  providers: [AdventureWaypointService],
})
export class AdventureWaypointModule {}
