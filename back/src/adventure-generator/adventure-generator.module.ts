import { Module } from '@nestjs/common';
import { AdventureGeneratorService } from './adventure-generator.service';
import { AdventureGeneratorController } from './adventure-generator.controller';

@Module({
  providers: [AdventureGeneratorService],
  controllers: [AdventureGeneratorController]
})
export class AdventureGeneratorModule {}
