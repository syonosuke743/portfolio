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

    // 最近選択されたPOIを記憶するキャッシュ
    private recentlySelectedPOIs: Set<string> = new Set();
    private readonly maxRecentPOIs = 20; // 最大20個まで記憶

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
        const categoryMap: Record<string, string> = {
            food: "restaurant",
            shopping: "store",
            park: "park",
            sightseeing: "tourist_attraction",
            history: "museum",
        };
        return categoryMap[category] ?? "tourist_attraction";
    }

    // 最近選択されたPOIを管理
    private addToRecentPOIs(placeId: string) {
        this.recentlySelectedPOIs.add(placeId);

        // サイズ制限を超えた場合、古いものを削除
        if (this.recentlySelectedPOIs.size > this.maxRecentPOIs) {
            const firstItem = this.recentlySelectedPOIs.values().next().value;
            this.recentlySelectedPOIs.delete(firstItem);
        }
    }

    // 通常のPOI検索
    async searchPOI(category: string, location: Coordinates, radius: number = 1000): Promise<POIResult | null> {
        try {
            const includedTypes = [this.mapPOICategory(category)];

            const requestBody = {
                includedTypes: includedTypes,
                maxResultCount: 20, // より多くの候補を取得
                locationRestriction: {
                    circle: {
                        center: {
                            latitude: location.lat,
                            longitude: location.lng
                        },
                        radius: radius
                    }
                },
                // ランキング設定を追加
                rankPreference: "POPULARITY" as const
            };

            this.logger.log(`Calling Places API (New): ${this.newPlacesUrl}:searchNearby`);

            const response = await fetch(`${this.newPlacesUrl}:searchNearby`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.apiKey,
                    'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress,places.id,places.rating'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok) {
                this.logger.error(`Places API (New) Error: ${response.status}`, data.error || 'No error details');
                return null;
            }

            if (data.places && data.places.length > 0) {
                // 最近選択されていないPOIを優先的に選択
                const availablePlaces = data.places.filter(place =>
                    !this.recentlySelectedPOIs.has(place.id)
                );

                // 利用可能な場所がない場合は全体から選択
                const placesToChooseFrom = availablePlaces.length > 0 ? availablePlaces : data.places;
                const selectedPlace = placesToChooseFrom[Math.floor(Math.random() * placesToChooseFrom.length)];

                // 選択されたPOIを記憶
                if (selectedPlace.id) {
                    this.addToRecentPOIs(selectedPlace.id);
                }

                this.logger.log(`Selected POI: ${selectedPlace.displayName?.text || 'Unknown'} (from ${placesToChooseFrom.length} candidates)`);

                return {
                    lat: selectedPlace.location.latitude,
                    lng: selectedPlace.location.longitude,
                    name: selectedPlace.displayName?.text || 'Unknown Place',
                    address: selectedPlace.formattedAddress || '',
                    placeId: selectedPlace.id
                };
            }

            this.logger.warn(`No POI found for category: ${category}`);
            return null;

        } catch (error) {
            this.logger.error(`Failed to search POI for category ${category}:`, error);
            throw error;
        }
    }

    // ランダムPOI検索
    async searchRandomPOI(category: string, location: Coordinates, maxDistance: number): Promise<POIResult | null> {
        try {
            const includedTypes = [this.mapPOICategory(category)];

            // 複数の検索半径で検索して多様性を確保
            const searchRadii = [
                Math.min(maxDistance * 0.3, 1500),
                Math.min(maxDistance * 0.6, 3000),
                Math.min(maxDistance, 5000)
            ];

            const allPlaces = [];

            // 複数の半径で検索
            for (const radius of searchRadii) {
                const requestBody = {
                    includedTypes: includedTypes,
                    maxResultCount: 20,
                    locationRestriction: {
                        circle: {
                            center: {
                                latitude: location.lat,
                                longitude: location.lng
                            },
                            radius: radius
                        }
                    },
                    // より多様な結果を得るためのオプション
                    rankPreference: Math.random() > 0.5 ? "POPULARITY" : "DISTANCE" as const
                };

                const response = await fetch(`${this.newPlacesUrl}:searchNearby`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': this.apiKey,
                        'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress,places.id,places.rating'
                    },
                    body: JSON.stringify(requestBody)
                });

                const data = await response.json();

                if (response.ok && data.places) {
                    allPlaces.push(...data.places);
                }

                // API制限を考慮して少し待機
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (allPlaces.length > 0) {
                // 重複を除去
                const uniquePlaces = allPlaces.filter((place, index, self) =>
                    index === self.findIndex(p => p.id === place.id)
                );

                // 最近選択されていないPOIを優先
                const availablePlaces = uniquePlaces.filter(place =>
                    !this.recentlySelectedPOIs.has(place.id)
                );

                const placesToChooseFrom = availablePlaces.length > 0 ? availablePlaces : uniquePlaces;

                // 重み付きランダム選択（距離と評価を考慮）
                const selectedPlace = this.weightedRandomSelection(placesToChooseFrom, location);

                if (selectedPlace.id) {
                    this.addToRecentPOIs(selectedPlace.id);
                }

                this.logger.log(`Selected random POI: ${selectedPlace.displayName?.text || 'Unknown'} (from ${placesToChooseFrom.length} unique candidates)`);

                return {
                    lat: selectedPlace.location.latitude,
                    lng: selectedPlace.location.longitude,
                    name: selectedPlace.displayName?.text || 'Unknown Place',
                    address: selectedPlace.formattedAddress || '',
                    placeId: selectedPlace.id
                };
            }

            this.logger.warn(`No random POI found for category: ${category}`);
            return null;

        } catch (error) {
            this.logger.error(`Failed to search random POI for category ${category}:`, error);
            throw error;
        }
    }

    // 重み付きランダム選択（距離と評価を考慮）
    private weightedRandomSelection(places: any[], userLocation: Coordinates): any {
        if (places.length === 1) return places[0];

        const weights = places.map(place => {
            // 距離による重み（近すぎず遠すぎない場所を優先）
            const distance = this.calculateDistance(
                userLocation,
                { lat: place.location.latitude, lng: place.location.longitude }
            );

            // 500m-2kmの範囲を最適とする重み関数
            let distanceWeight = 1;
            if (distance < 500) {
                distanceWeight = distance / 500; // 近すぎる場合は重みを下げる
            } else if (distance > 2000) {
                distanceWeight = Math.max(0.3, 2000 / distance); // 遠すぎる場合も重みを下げる
            }

            // 評価による重み
            const rating = place.rating || 3.0;
            const ratingWeight = Math.max(0.5, rating / 5.0);

            // ランダム要素も加える
            const randomWeight = 0.5 + Math.random() * 0.5;

            return distanceWeight * ratingWeight * randomWeight;
        });

        // 重み付きランダム選択
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < places.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return places[i];
            }
        }

        // フォールバック
        return places[Math.floor(Math.random() * places.length)];
    }

    // 2点間の距離を計算（メートル単位）
    private calculateDistance(point1: Coordinates, point2: Coordinates): number {
        const R = 6371e3; // 地球の半径（メートル）
        const φ1 = point1.lat * Math.PI / 180;
        const φ2 = point2.lat * Math.PI / 180;
        const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
        const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    }

    // 最近の選択履歴をクリア（必要に応じて呼び出し）
    public clearRecentPOIs(): void {
        this.recentlySelectedPOIs.clear();
        this.logger.log('Recent POI selection history cleared');
    }

    // 既存のメソッドはそのまま保持
    async calculateRoute(
        origin: Coordinates,
        destination: Coordinates,
        mode: string = 'walking'
    ): Promise<RouteResult | null> {
        try {
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
                    duration: Math.ceil(leg.duration.value / 60)
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
