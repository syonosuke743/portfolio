import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AdventureModule } from './adventure/adventure.module';
import { AdventureWaypointModule } from './adventure-waypoint/adventure-waypoint.module';
import { AdventurePreferenceModule } from './adventure-preference/adventure-preference.module';
import { RouteModule } from './route/route.module';


@Module({

  imports: [UserModule, AdventureModule, AdventureWaypointModule, AdventurePreferenceModule, RouteModule]
})
export class AppModule { }
