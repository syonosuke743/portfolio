import { Test, TestingModule } from '@nestjs/testing';
import { AdventureWaypointController } from './adventure-waypoint.controller';
import { AdventureWaypointService } from './adventure-waypoint.service';

describe('AdventureWaypointController', () => {
  let controller: AdventureWaypointController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdventureWaypointController],
      providers: [AdventureWaypointService],
    }).compile();

    controller = module.get<AdventureWaypointController>(AdventureWaypointController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
