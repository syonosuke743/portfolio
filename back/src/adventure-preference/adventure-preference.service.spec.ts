import { Test, TestingModule } from '@nestjs/testing';
import { AdventurePreferenceService } from './adventure-preference.service';

describe('AdventurePreferenceService', () => {
  let service: AdventurePreferenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdventurePreferenceService],
    }).compile();

    service = module.get<AdventurePreferenceService>(AdventurePreferenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
