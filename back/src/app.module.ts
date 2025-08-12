import { Module } from '@nestjs/common';
import { AdventuresModule } from './adventures/adventures.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GoogleMapsModule } from './google-maps/google-maps.module';
import { ConfigModule } from '@nestjs/config';



@Module({

  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AdventuresModule ,  AuthModule, UsersModule, GoogleMapsModule,
  ]
})
export class AppModule { }
