import { Module } from '@nestjs/common';
import { AdventuresModule } from './adventures/adventures.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GoogleMapsModule } from './google-maps/google-maps.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';



@Module({

  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AdventuresModule ,  AuthModule, UsersModule, GoogleMapsModule, HealthModule
  ]
})
export class AppModule { }
