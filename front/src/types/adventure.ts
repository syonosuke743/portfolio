//nestのDTO用の型定義

export enum AdventureStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed'
  }

  export enum WaypointType {
    START = 'start',
    INTERMEDIATE = 'intermediate',
    DESTINATION = 'destination'
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

  // API レスポンス用の型（将来的に使用）
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
