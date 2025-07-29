import { PartialType } from '@nestjs/mapped-types';
import { CreateAdventurePreferenceDto } from './create-adventure-preference.dto';

export class UpdateAdventurePreferenceDto extends PartialType(CreateAdventurePreferenceDto) {}
