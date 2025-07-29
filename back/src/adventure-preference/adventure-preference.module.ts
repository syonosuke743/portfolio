import { Module } from '@nestjs/common';
import { AdventurePreferenceService } from './adventure-preference.service';
import { AdventurePreferenceController } from './adventure-preference.controller';

@Module({
  controllers: [AdventurePreferenceController],
  providers: [AdventurePreferenceService],
})
export class AdventurePreferenceModule {}
