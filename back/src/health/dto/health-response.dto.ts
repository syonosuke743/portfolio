export class MemoryInfoDto {
    used: number;
    total: number;
  }

  export class HealthResponseDto {
    status: string;
    timestamp: string;
    uptime?: number;
    database?: string;
    memory?: MemoryInfoDto;
    environment?: string;
    error?: string;
  }
