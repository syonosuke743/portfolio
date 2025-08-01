import { Module } from '@nestjs/common';
import { AdventuresModule } from './adventures/adventures.module';
import { WaypointsModule } from './waypoints/waypoints.module';
import { RoutesModule } from './routes/routes.module';
import { PoiModule } from './poi/poi.module';
import { AdventureGeneratorModule } from './adventure-generator/adventure-generator.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';



@Module({

  imports: [ AdventuresModule, WaypointsModule, RoutesModule, PoiModule, AdventureGeneratorModule, AuthModule, UsersModule, ]
})
export class AppModule { }
