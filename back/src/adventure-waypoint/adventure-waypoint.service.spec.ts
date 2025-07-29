import { Test, TestingModule } from '@nestjs/testing';
import { AdventureWaypointService } from './adventure-waypoint.service';

describe('AdventureWaypointService', () => {
  let service: AdventureWaypointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdventureWaypointService],
    }).compile();

    service = module.get<AdventureWaypointService>(AdventureWaypointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
