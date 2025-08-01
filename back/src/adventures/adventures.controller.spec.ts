import { Test, TestingModule } from '@nestjs/testing';
import { AdventuresController } from './adventures.controller';
import { AdventuresService } from './adventures.service';

describe('AdventuresController', () => {
  let controller: AdventuresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdventuresController],
      providers: [AdventuresService],
    }).compile();

    controller = module.get<AdventuresController>(AdventuresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
