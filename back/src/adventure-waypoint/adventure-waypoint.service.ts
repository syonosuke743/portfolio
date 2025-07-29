import { Injectable } from '@nestjs/common';
import { CreateAdventureWaypointDto } from './dto/create-adventure-waypoint.dto';
import { UpdateAdventureWaypointDto } from './dto/update-adventure-waypoint.dto';

@Injectable()
export class AdventureWaypointService {
  create(createAdventureWaypointDto: CreateAdventureWaypointDto) {
    return 'This action adds a new adventureWaypoint';
  }

  findAll() {
    return `This action returns all adventureWaypoint`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adventureWaypoint`;
  }

  update(id: number, updateAdventureWaypointDto: UpdateAdventureWaypointDto) {
    return `This action updates a #${id} adventureWaypoint`;
  }

  remove(id: number) {
    return `This action removes a #${id} adventureWaypoint`;
  }
}
