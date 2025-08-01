import { Test, TestingModule } from '@nestjs/testing';
import { AdventureGeneratorController } from './adventure-generator.controller';

describe('AdventureGeneratorController', () => {
  let controller: AdventureGeneratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdventureGeneratorController],
    }).compile();

    controller = module.get<AdventureGeneratorController>(AdventureGeneratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
