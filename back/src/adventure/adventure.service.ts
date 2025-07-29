import { Injectable } from '@nestjs/common';
import { CreateAdventureDto } from './dto/create-adventure.dto';
import { UpdateAdventureDto } from './dto/update-adventure.dto';

@Injectable()
export class AdventureService {
  create(createAdventureDto: CreateAdventureDto) {
    return 'This action adds a new adventure';
  }

  findAll() {
    return `This action returns all adventure`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adventure`;
  }

  update(id: number, updateAdventureDto: UpdateAdventureDto) {
    return `This action updates a #${id} adventure`;
  }

  remove(id: number) {
    return `This action removes a #${id} adventure`;
  }
}
