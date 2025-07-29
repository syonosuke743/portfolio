import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdventureService } from './adventure.service';
import { CreateAdventureDto } from './dto/create-adventure.dto';
import { UpdateAdventureDto } from './dto/update-adventure.dto';

@Controller('adventure')
export class AdventureController {
  constructor(private readonly adventureService: AdventureService) {}

  @Post()
  create(@Body() createAdventureDto: CreateAdventureDto) {
    return this.adventureService.create(createAdventureDto);
  }

  @Get()
  findAll() {
    return this.adventureService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adventureService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdventureDto: UpdateAdventureDto) {
    return this.adventureService.update(+id, updateAdventureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adventureService.remove(+id);
  }
}
