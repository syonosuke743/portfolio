//nestのDTO用の型定義

export enum AdventureStatus {
  PLANNED = "PLANNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

export enum WaypointType {
  START = "START",
  INTERMEDIATE = "INTERMEDIATE",
  DESTINATION = "DESTINATION"
}

  export interface CreateWaypointDto {
    sequence: number;
    waypointType: WaypointType;
    poiCategory?: string;
    latitude: number;
    longitude: number;
    locationName?: string;
    poiSourceId?: string;
    poiSource?: string;
    address?: string;
  }

  export interface CreateAdventureDto {
    userId: string;
    status?: AdventureStatus;
    failureReason?: string;
    plannedDistanceMeters: number;
    waypointCount: number;
    waypoints: CreateWaypointDto[];
  }

  // API レスポンス用の型
  export interface AdventureResponse {
    id: string;
    userId: string;
    status: AdventureStatus;
    failureReason?: string;
    plannedDistanceMeters: number;
    waypointCount: number;
    createdAt: string;
    waypoints: WaypointResponse[];
    routes?: RouteResponse[];
  }

  export interface WaypointResponse {
    id: string;
    adventureId: string;
    sequence: number;
    waypointType: WaypointType;
    poiCategory?: string;
    latitude: number;
    longitude: number;
    locationName?: string;
    poiSourceId?: string;
    poiSource?: string;
    address?: string;
    createdAt: string;
  }

  export interface RouteResponse {
    id: string;
    adventureId: string;
    fromWaypointId?: string;
    toWaypointId: string;
    routeJson: any; // Google Directions APIのレスポンス
    distanceMeters: number;
    durationMinutes: number;
    transportationMode: string;
    createdAt: string;
  }
