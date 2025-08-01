import { Controller } from '@nestjs/common';
import { WaypointsService } from './waypoints.service';

@Controller('waypoints')
export class WaypointsController {
  constructor(private readonly waypointsService: WaypointsService) {}
}
