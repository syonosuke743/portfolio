import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


interface Coordinates {
    lat: number;
    lng: number;
}

interface POIResult {
    lat: number;
    lng: number;
    name: string;
    address: string;
    placeId?: string
}

interface RouteResult {
    routeJson: any;
    distance: number;//メートル単位
    duration: number;//メートル単位
}

@Injectable()
export class GoogleMapsService {
    private readonly logger = new Logger(GoogleMapsService.name);
    private readonly apiKey: string;
    private readonly baseUrl = 'https://maps.googleapis.com/maps/api';

    constructor(private configService: ConfigService){
        this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY')
    }

    //POIカテゴリをGoogle Places APIのタイプにマッピング
    private mapPOICategory(category: string): string {
        const categoryMap: {[key: string]: string} = {
            'food': 'restaurant',
            'shopping': 'shopping_mall',
            'tourist_attraction': 'tourist_attraction',
            'park': 'park',
            'place_of_worship': 'place_of_worship',
            'museum': 'museum',
            'entertainment': 'amusement_park'
        };
        return categoryMap[category] || category;
    }

    //指定カテゴリのPOIを検索
    async searchPOI(category: string, location: Coordinates, radius: number = 1000) : Promise<POIResult | null>{
        try{
        const type = this.mapPOICategory(category);
        const url = `${this.baseUrl}/place/nearbysearch/json`;
        const params = new URLSearchParams({
            location: `${location.lat},${location.lng}`,
            radius: radius.toString(),
            type: type,
            key: this.apiKey
        });

        const response = await fetch(`${url}?${params}`);
        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0){
            const place = data.results[0];
            return {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
                name: place.name,
                address: place.vicinity || place.formatted_address || '',
                placeId: place.place_id
            };
        }
        this.logger.warn(`No POI found for category: ${category}`);
        return null;
    } catch (error){
        this.logger.error(`Failed to search POI for category ${category}:`, error);
        throw error;
    }
}

    //ランダムなPOI検索（目的地用)

    async searchRandomPOI(category: string, location: Coordinates,maxDistance: number): Promise<POIResult | null>{
        try {
            const type = this.mapPOICategory(category);
            const url = `${this.baseUrl}/place/nearbysearch/json`

            //距離範囲の調整
            const minRadius = Math.min(500,maxDistance * 0.3);
            const radius = Math.min(maxDistance,5000);//最大５キロ

            const params = new URLSearchParams({
                location: `${location.lat},${location.lng}`,
                radius: radius.toString(),
                key: this.apiKey
            });

            const response = await fetch(`${url}?${params}`);
            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0 ){
                // ランダムに選択（上位10件から）
                const candidates = data.results.slice(0, Math.min(10, data.results.length));
                const randomPlace = candidates[Math.floor(Math.random() * candidates.length)];
                return{
                    lat: randomPlace.geometry.location.lat,
                    lng: randomPlace.geometry.location.lng,
                    name: randomPlace.name,
                    address: randomPlace.vicinity || randomPlace.formatted_address || '',
                    placeId: randomPlace.place_id
                };
            }
            this.logger.warn(`No random POI found for category: ${category}`);
            return null;
        } catch (error){
            this.logger.error(`Failed to search random POI for category ${category}:`, error);
            throw error;
        }
    }

    //2点間のルート計算
    async calculateRoute(
        origin: Coordinates,
        destination: Coordinates,
        mode: string = 'walking'
    ): Promise<RouteResult | null>{
        try {
            const url = `${this.baseUrl}/directions/json`;
            const params = new URLSearchParams({
                origin: `${origin.lat},${origin.lng}`,
                destination: `${destination.lat},${destination.lng}`,
                mode: mode,
                key: this.apiKey
            });

            const response = await fetch(`${url}?${params}`);
            const data = await response.json();

            if (data.status === 'OK' && data.routes.length > 0) {
                const route = data.routes[0];
                const leg = route.legs[0];
                return {
                    routeJson: data,
                    distance: leg.distance.value,
                    duration: Math.ceil(leg.duration.value)
                };
            }

            this.logger.warn(
                `No route found between ${origin.lat},${origin.lng} and ${destination.lat},${destination.lng}`
            );
            return null;
        } catch (error) {
            this.logger.error(`Failed to calculate route:`, error);
            throw error;
        }
    }

    //複数地点を通るルートを計算
    async calculateMultiWaypointRoute(
        waypoints: Coordinates[],
        mode: string = 'walking'
    ): Promise<RouteResult[]>{
        const routes: RouteResult[] = [];

        for (let i = 0; i < waypoints.length - 1; i++){
            const route = await this.calculateRoute(waypoints[i], waypoints[i + 1], mode);
            if(route){
                routes.push(route);
            }
        }
        return routes
    }

    //Place IDから詳細情報を取得
    async getPlaceDetails(placeId: string): Promise <any>{
        try {
            const url = `${this.baseUrl}/place/details/json`;
            const params = new URLSearchParams({
                place_id : placeId,
                fields: 'name,formatted_address,geometry,rating,photos',
                key: this.apiKey
            });

            const response = await fetch(`${url}?${params}`);
            const data = await response.json();

            if (data.status === 'OK'){
                return data.results;
            }

            return null;
        }catch(error){
            this.logger.error(`Failed to get place details for ${placeId}:`, error);
            throw error;
        }
    }
}
