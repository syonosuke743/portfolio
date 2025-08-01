import { Test, TestingModule } from '@nestjs/testing';
import { AdventuresService } from './adventures.service';

describe('AdventuresService', () => {
  let service: AdventuresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdventuresService],
    }).compile();

    service = module.get<AdventuresService>(AdventuresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
