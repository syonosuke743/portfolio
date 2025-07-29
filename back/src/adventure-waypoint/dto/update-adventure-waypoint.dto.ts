import { PartialType } from '@nestjs/mapped-types';
import { CreateAdventureWaypointDto } from './create-adventure-waypoint.dto';

export class UpdateAdventureWaypointDto extends PartialType(CreateAdventureWaypointDto) {}
