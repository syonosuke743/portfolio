import { Module } from '@nestjs/common';
import { WaypointsService } from './waypoints.service';
import { WaypointsController } from './waypoints.controller';

@Module({
  controllers: [WaypointsController],
  providers: [WaypointsService],
})
export class WaypointsModule {}
