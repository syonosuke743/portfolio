import { Module } from '@nestjs/common';
import { AdventuresService } from './adventures.service';
import { AdventuresController } from './adventures.controller';

@Module({
  controllers: [AdventuresController],
  providers: [AdventuresService],
})
export class AdventuresModule {}
