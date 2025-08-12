import { IsString,IsNumber, IsArray, ValidateNested, IsOptional, IsEnum, IsUUID, Min, Max  } from "class-validator";
import {Type} from "class-transformer"
import { WaypointType, AdventureStatus } from '@prisma/client';

export class CreateWaypointDto {
    @IsNumber()
    sequence: number;

    @IsEnum(WaypointType)
    waypointType: WaypointType;

    @IsOptional()
    @IsString()
    poiCategory?: string;

    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;

    @IsOptional()
    @IsString()
    locationName?: string;

    @IsOptional()
    @IsString()
    poiSourceId?: string;

    @IsOptional()
    @IsString()
    poiSource: string;

    @IsOptional()
    @IsString()
    address?: string;
}

export class CreateAdventureDto{
    @IsUUID()
    userId: string;

    @IsOptional()
    @IsEnum(AdventureStatus)
    status?: AdventureStatus = AdventureStatus.PLANNED;

    @IsOptional()
    @IsString()
    failureReason?: string;

    @IsNumber()
    @Min(0)
    plannedDistanceMeters: number;

    @IsNumber()
    @Min(0)
    waypointCount: number;

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => CreateWaypointDto)
    waypoints: CreateWaypointDto[];
}

