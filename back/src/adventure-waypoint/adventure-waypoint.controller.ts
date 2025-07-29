import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdventureWaypointService } from './adventure-waypoint.service';
import { CreateAdventureWaypointDto } from './dto/create-adventure-waypoint.dto';
import { UpdateAdventureWaypointDto } from './dto/update-adventure-waypoint.dto';

@Controller('adventure-waypoint')
export class AdventureWaypointController {
  constructor(private readonly adventureWaypointService: AdventureWaypointService) {}

  @Post()
  create(@Body() createAdventureWaypointDto: CreateAdventureWaypointDto) {
    return this.adventureWaypointService.create(createAdventureWaypointDto);
  }

  @Get()
  findAll() {
    return this.adventureWaypointService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adventureWaypointService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdventureWaypointDto: UpdateAdventureWaypointDto) {
    return this.adventureWaypointService.update(+id, updateAdventureWaypointDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adventureWaypointService.remove(+id);
  }
}
