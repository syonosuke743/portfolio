import { Test, TestingModule } from '@nestjs/testing';
import { WaypointsController } from './waypoints.controller';
import { WaypointsService } from './waypoints.service';

describe('WaypointsController', () => {
  let controller: WaypointsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaypointsController],
      providers: [WaypointsService],
    }).compile();

    controller = module.get<WaypointsController>(WaypointsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
