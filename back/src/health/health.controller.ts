import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthResponseDto } from './dto/health-response.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async checkHealth(): Promise<HealthResponseDto> {
    return await this.healthService.checkHealth();
  }
}
