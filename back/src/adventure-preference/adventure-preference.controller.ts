import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdventurePreferenceService } from './adventure-preference.service';
import { CreateAdventurePreferenceDto } from './dto/create-adventure-preference.dto';
import { UpdateAdventurePreferenceDto } from './dto/update-adventure-preference.dto';

@Controller('adventure-preference')
export class AdventurePreferenceController {
  constructor(private readonly adventurePreferenceService: AdventurePreferenceService) {}

  @Post()
  create(@Body() createAdventurePreferenceDto: CreateAdventurePreferenceDto) {
    return this.adventurePreferenceService.create(createAdventurePreferenceDto);
  }

  @Get()
  findAll() {
    return this.adventurePreferenceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adventurePreferenceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdventurePreferenceDto: UpdateAdventurePreferenceDto) {
    return this.adventurePreferenceService.update(+id, updateAdventurePreferenceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adventurePreferenceService.remove(+id);
  }
}
