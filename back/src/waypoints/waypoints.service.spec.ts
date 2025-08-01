import { Test, TestingModule } from '@nestjs/testing';
import { WaypointsService } from './waypoints.service';

describe('WaypointsService', () => {
  let service: WaypointsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaypointsService],
    }).compile();

    service = module.get<WaypointsService>(WaypointsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
