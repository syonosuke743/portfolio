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
    placeId?: string;
}

interface RouteResult {
    routeJson: any;
    distance: number;
    duration: number;
}

@Injectable()
export class GoogleMapsService {
    private readonly logger = new Logger(GoogleMapsService.name);
    private readonly apiKey: string;
    private readonly baseUrl = 'https://maps.googleapis.com/maps/api';
    private readonly newPlacesUrl = 'https://places.googleapis.com/v1/places';

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');

        if (!this.apiKey) {
            this.logger.error('Google Maps API Key is not configured');
            throw new Error('Google Maps API Key is missing');
        }

        const maskedKey = this.apiKey.substring(0, 4) + '...' + this.apiKey.substring(this.apiKey.length - 4);
        this.logger.log(`Google Maps API Key configured: ${maskedKey}`);
    }

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

    // 新しいPlaces API (New) を使用してPOI検索
    async searchPOI(category: string, location: Coordinates, radius: number = 1000): Promise<POIResult | null> {
        try {
            const includedTypes = [this.mapPOICategory(category)];

            const requestBody = {
                includedTypes: includedTypes,
                maxResultCount: 1,
                locationRestriction: {
                    circle: {
                        center: {
                            latitude: location.lat,
                            longitude: location.lng
                        },
                        radius: radius
                    }
                }
            };

            this.logger.log(`Calling Places API (New): ${this.newPlacesUrl}:searchNearby`);
            this.logger.log(`Request body: ${JSON.stringify(requestBody, null, 2)}`);

            const response = await fetch(`${this.newPlacesUrl}:searchNearby`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.apiKey,
                    'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress,places.id'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok) {
                this.logger.error(`Places API (New) Error: ${response.status}`, data.error || 'No error details');
                return null;
            }

            if (data.places && data.places.length > 0) {
                const place = data.places[0];
                this.logger.log(`Found POI: ${place.displayName?.text || 'Unknown'} at ${place.location?.latitude}, ${place.location?.longitude}`);

                return {
                    lat: place.location.latitude,
                    lng: place.location.longitude,
                    name: place.displayName?.text || 'Unknown Place',
                    address: place.formattedAddress || '',
                    placeId: place.id
                };
            }

            this.logger.warn(`No POI found for category: ${category}`);
            return null;

        } catch (error) {
            this.logger.error(`Failed to search POI for category ${category}:`, error);
            throw error;
        }
    }

    // 新しいPlaces API (New) を使用してランダムPOI検索
    async searchRandomPOI(category: string, location: Coordinates, maxDistance: number): Promise<POIResult | null> {
        try {
            const includedTypes = [this.mapPOICategory(category)];
            const radius = Math.min(maxDistance, 5000);

            const requestBody = {
                includedTypes: includedTypes,
                maxResultCount: 10, // より多くの候補を取得してランダム選択
                locationRestriction: {
                    circle: {
                        center: {
                            latitude: location.lat,
                            longitude: location.lng
                        },
                        radius: radius
                    }
                }
            };

            this.logger.log(`Calling Places API (New) for random POI: ${this.newPlacesUrl}:searchNearby`);

            const response = await fetch(`${this.newPlacesUrl}:searchNearby`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.apiKey,
                    'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress,places.id'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok) {
                this.logger.error(`Places API (New) Error for random POI: ${response.status}`, data.error || 'No error details');
                return null;
            }

            if (data.places && data.places.length > 0) {
                const randomPlace = data.places[Math.floor(Math.random() * data.places.length)];

                this.logger.log(`Found random POI: ${randomPlace.displayName?.text || 'Unknown'}`);

                return {
                    lat: randomPlace.location.latitude,
                    lng: randomPlace.location.longitude,
                    name: randomPlace.displayName?.text || 'Unknown Place',
                    address: randomPlace.formattedAddress || '',
                    placeId: randomPlace.id
                };
            }

            this.logger.warn(`No random POI found for category: ${category}`);
            return null;

        } catch (error) {
            this.logger.error(`Failed to search random POI for category ${category}:`, error);
            throw error;
        }
    }

    // Directions API はそのまま使用（こちらは新しいAPI）
    async calculateRoute(
        origin: Coordinates,
        destination: Coordinates,
        mode: string = 'walking'
    ): Promise<RouteResult | null> {
        try {
            // 座標が無効な場合の早期チェック
            if (origin.lat === 0 && origin.lng === 0) {
                this.logger.warn('Origin coordinates are invalid (0,0)');
                return null;
            }
            if (destination.lat === 0 && destination.lng === 0) {
                this.logger.warn('Destination coordinates are invalid (0,0)');
                return null;
            }

            const url = `${this.baseUrl}/directions/json`;
            const params = new URLSearchParams({
                origin: `${origin.lat},${origin.lng}`,
                destination: `${destination.lat},${destination.lng}`,
                mode: mode,
                key: this.apiKey
            });

            const fullUrl = `${url}?${params}`;
            this.logger.log(`Calling Directions API: ${fullUrl.replace(this.apiKey, 'API_KEY_HIDDEN')}`);

            const response = await fetch(fullUrl);
            const data = await response.json();

            this.logger.log(`Directions API Response Status: ${data.status}`);

            if (data.status !== 'OK') {
                this.logger.error(`Directions API Error: ${data.status}`, data.error_message || 'No error message');

                switch (data.status) {
                    case 'REQUEST_DENIED':
                        this.logger.error('API key is invalid or API is not enabled');
                        break;
                    case 'OVER_QUERY_LIMIT':
                        this.logger.error('API quota exceeded');
                        break;
                    case 'ZERO_RESULTS':
                        this.logger.warn('No route found between the specified locations');
                        break;
                    case 'INVALID_REQUEST':
                        this.logger.error('Invalid request parameters');
                        break;
                }

                return null;
            }

            if (data.routes.length > 0) {
                const route = data.routes[0];
                const leg = route.legs[0];

                this.logger.log(`Route calculated: ${leg.distance.text}, ${leg.duration.text}`);

                return {
                    routeJson: data,
                    distance: leg.distance.value,
                    duration: Math.ceil(leg.duration.value / 60) // 分に変換
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

    async calculateMultiWaypointRoute(
        waypoints: Coordinates[],
        mode: string = 'walking'
    ): Promise<RouteResult[]> {
        const routes: RouteResult[] = [];

        for (let i = 0; i < waypoints.length - 1; i++) {
            const route = await this.calculateRoute(waypoints[i], waypoints[i + 1], mode);
            if (route) {
                routes.push(route);
            }
        }
        return routes;
    }

    // 新しいPlace Details API を使用
    async getPlaceDetails(placeId: string): Promise<any> {
        try {
            const url = `${this.newPlacesUrl}/${placeId}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Goog-Api-Key': this.apiKey,
                    'X-Goog-FieldMask': 'displayName,formattedAddress,location,rating,photos'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                this.logger.error(`Place Details API Error: ${response.status}`, data.error || 'No error details');
                return null;
            }

            return data;

        } catch (error) {
            this.logger.error(`Failed to get place details for ${placeId}:`, error);
            throw error;
        }
    }
}
