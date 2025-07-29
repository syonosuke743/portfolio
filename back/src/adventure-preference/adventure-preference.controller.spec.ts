import { Test, TestingModule } from '@nestjs/testing';
import { AdventurePreferenceController } from './adventure-preference.controller';
import { AdventurePreferenceService } from './adventure-preference.service';

describe('AdventurePreferenceController', () => {
  let controller: AdventurePreferenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdventurePreferenceController],
      providers: [AdventurePreferenceService],
    }).compile();

    controller = module.get<AdventurePreferenceController>(AdventurePreferenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
