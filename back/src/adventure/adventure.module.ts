import { Module } from '@nestjs/common';
import { AdventureService } from './adventure.service';
import { AdventureController } from './adventure.controller';

@Module({
  controllers: [AdventureController],
  providers: [AdventureService],
})
export class AdventureModule {}
