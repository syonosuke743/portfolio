import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkHealth() {
    try {
      // データベース接続確認
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
        memory: {
          used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
          total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        },
        environment: process.env.NODE_ENV || 'development',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }

  async checkReadiness() {
    try {
      // データベースの接続性とクエリ実行可能性を確認
      await this.prisma.$queryRaw`SELECT NOW()`;

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: 'ready',
        services: {
          database: 'ready',
          prisma: 'ready',
        },
      };
    } catch (error) {
      throw new Error(`Service not ready: ${error.message}`);
    }
  }
}
