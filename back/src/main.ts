import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

//test


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // グローバルバリデーション
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // CORS設定
  const devOrigins = ['http://localhost:3000'];
  const prodOrigins = ['https://portfolio-chi-seven-92.vercel.app']; // 本番フロントのURL
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production' ? prodOrigins : devOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'],
    credentials: true,
  });

  // Prisma マイグレーションを自動実行
  if (process.env.NODE_ENV !== 'production') {
    const prisma = app.get(PrismaService);
    await prisma.$connect();
    try {
      await prisma.$executeRaw`SELECT 1`; // 簡単な接続確認
      console.log('Prisma connected successfully');
    } catch (err) {
      console.error('Prisma connection failed', err);
    }
  }

  // ポート設定（Cloud Runはprocess.env.PORTを使用）
  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`NestJS app is running on port ${port}`);
}

bootstrap();
