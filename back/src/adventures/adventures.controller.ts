import { Controller } from '@nestjs/common';
import { AdventuresService } from './adventures.service';

@Controller('adventures')
export class AdventuresController {
  constructor(private readonly adventuresService: AdventuresService) {}
}
