import { Body, Controller, Get, Param, Post, ValidationPipe } from '@nestjs/common';
import { AdventuresService } from './adventures.service';
import { CreateAdventureDto } from './dto/create-adventure.dto';

@Controller('adventures')
export class AdventuresController {
  constructor(private readonly adventuresService: AdventuresService) {}

  @Post()
  async create(@Body(ValidationPipe) createAdventureDto: CreateAdventureDto) {
    return this.adventuresService.create(createAdventureDto);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.adventuresService.findByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string){
    return this.adventuresService.findOne(id);
  }
}
