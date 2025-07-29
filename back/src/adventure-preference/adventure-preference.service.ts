import { Injectable } from '@nestjs/common';
import { CreateAdventurePreferenceDto } from './dto/create-adventure-preference.dto';
import { UpdateAdventurePreferenceDto } from './dto/update-adventure-preference.dto';

@Injectable()
export class AdventurePreferenceService {
  create(createAdventurePreferenceDto: CreateAdventurePreferenceDto) {
    return 'This action adds a new adventurePreference';
  }

  findAll() {
    return `This action returns all adventurePreference`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adventurePreference`;
  }

  update(id: number, updateAdventurePreferenceDto: UpdateAdventurePreferenceDto) {
    return `This action updates a #${id} adventurePreference`;
  }

  remove(id: number) {
    return `This action removes a #${id} adventurePreference`;
  }
}
