import { Test, TestingModule } from '@nestjs/testing';
import { AdventureGeneratorService } from './adventure-generator.service';

describe('AdventureGeneratorService', () => {
  let service: AdventureGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdventureGeneratorService],
    }).compile();

    service = module.get<AdventureGeneratorService>(AdventureGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
