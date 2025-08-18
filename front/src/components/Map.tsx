import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet";
import L, { LatLngTuple } from "leaflet";
import { AdventureResponse, WaypointType } from "@/types/adventure";
import { useEffect, useState, useRef } from "react";
import { Navigation, MapPin, Zap } from "lucide-react";

// Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface CurrentLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number;
}

interface NavigationInfo {
  currentWaypointIndex: number;
  distanceToNext: number;
  bearing: number;
  isNavigating: boolean;
}

// ポリラインデコード関数
const decodePolyline = (encoded: string): LatLngTuple[] => {
  const poly: LatLngTuple[] = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b: number, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1 ? ~(result >> 1) : result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1 ? ~(result >> 1) : result >> 1);
    lng += dlng;

    poly.push([lat / 1e5, lng / 1e5]);
  }

  return poly;
};

// 距離計算（メートル単位）
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// 方位角計算
const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return (θ * 180/Math.PI + 360) % 360;
};

// 8方位に変換
const bearingToDirection = (bearing: number): string => {
  const directions = ['北', '北東', '東', '南東', '南', '南西', '西', '北西'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};

interface MapComponentProps {
  adventure: AdventureResponse;
  height?: string | number;
}

const MapComponent = ({ adventure, height = 500 }: MapComponentProps) => {
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null);
  const [navigationInfo, setNavigationInfo] = useState<NavigationInfo>({
    currentWaypointIndex: 0,
    distanceToNext: 0,
    bearing: 0,
    isNavigating: false
  });
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isFollowingLocation, setIsFollowingLocation] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  const startNavigation = () => {
    if (!navigator.geolocation) {
      setLocationError('位置情報がサポートされていません');
      return;
    }

    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
    const success = (position: GeolocationPosition) => {
      const newLocation: CurrentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading || undefined
      };

      setCurrentLocation(newLocation);
      setLocationError(null);

      if (!navigationInfo.isNavigating && mapRef.current) {
        mapRef.current.setView([newLocation.latitude, newLocation.longitude], 16);
        setIsFollowingLocation(true);
      }

      setNavigationInfo(prev => ({ ...prev, isNavigating: true }));
    };
    const error = (err: GeolocationPositionError) => setLocationError(`位置情報の取得に失敗しました: ${err.message}`);

    watchIdRef.current = navigator.geolocation.watchPosition(success, error, options);
  };

  const stopNavigation = () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    setNavigationInfo(prev => ({ ...prev, isNavigating: false }));
    setIsFollowingLocation(false);
  };

  const followLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.setView([currentLocation.latitude, currentLocation.longitude], 16);
      setIsFollowingLocation(true);
    }
  };

  // 次の目的地の距離・方位計算
  useEffect(() => {
    if (!currentLocation || !adventure.waypoints?.length) return;
    const sortedWaypoints = adventure.waypoints.sort((a, b) => a.sequence - b.sequence);
    let nextWaypointIndex = navigationInfo.currentWaypointIndex;

    const ARRIVAL_THRESHOLD = 30;
    const currentWaypoint = sortedWaypoints[nextWaypointIndex];
    if (currentWaypoint) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        currentWaypoint.latitude,
        currentWaypoint.longitude
      );
      if (distance <= ARRIVAL_THRESHOLD && nextWaypointIndex < sortedWaypoints.length - 1) {
        nextWaypointIndex += 1;
      }
    }

    const nextWaypoint = sortedWaypoints[nextWaypointIndex];
    if (nextWaypoint) {
      const distanceToNext = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        nextWaypoint.latitude,
        nextWaypoint.longitude
      );
      const bearing = calculateBearing(
        currentLocation.latitude,
        currentLocation.longitude,
        nextWaypoint.latitude,
        nextWaypoint.longitude
      );
      setNavigationInfo(prev => ({
        ...prev,
        currentWaypointIndex: nextWaypointIndex,
        distanceToNext,
        bearing
      }));
    }
  }, [currentLocation, adventure.waypoints, navigationInfo.currentWaypointIndex]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const mapHeight = typeof height === 'number' ? `${height}px` : height;

  // カスタムアイコン
  const startIcon = L.divIcon({
    html: '<div style="background:#10b981;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;border:3px solid white;">🏁</div>',
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  const intermediateIcon = L.divIcon({
    html: '<div style="background:#3b82f6;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;border:2px solid white;">📍</div>',
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const destinationIcon = L.divIcon({
    html: '<div style="background:#ef4444;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;border:3px solid white;">🎯</div>',
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  const currentLocationIcon = L.divIcon({
    html: '<div style="background:#ff6b6b;border-radius:50%;width:20px;height:20px;border:3px solid white;box-shadow:0 0 10px rgba(255,107,107,0.5);"></div>',
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  if (!adventure?.waypoints?.length) {
    return (
      <div className="rounded-lg shadow-lg bg-white flex items-center justify-center" style={{ height: mapHeight }}>
        <p>マップデータがありません</p>
      </div>
    );
  }

  const center: LatLngTuple = currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : [adventure.waypoints[0].latitude, adventure.waypoints[0].longitude];

  const sortedWaypoints = adventure.waypoints.sort((a, b) => a.sequence - b.sequence);
  const currentWaypoint = sortedWaypoints[navigationInfo.currentWaypointIndex];

  return (
    <>
      <style>{`
        .current-location-icon { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
      `}</style>

      {navigationInfo.isNavigating && currentWaypoint && (
        <div className="mb-4 bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600" /> 次の目的地
            </h3>
            <div className="flex gap-2">
              <button onClick={followLocation} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600" disabled={!currentLocation}>
                現在地
              </button>
              <button onClick={stopNavigation} className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                停止
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-green-600" /><span className="font-medium">{currentWaypoint.locationName}</span></div>
            <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-orange-600" /><span>{navigationInfo.distanceToNext < 1000 ? `${Math.round(navigationInfo.distanceToNext)}m` : `${(navigationInfo.distanceToNext / 1000).toFixed(1)}km`}</span></div>
            <div className="flex items-center gap-2"><Navigation className="w-4 h-4 text-purple-600" /><span>{bearingToDirection(navigationInfo.bearing)}方向</span></div>
          </div>
          {currentWaypoint.address && <p className="text-sm text-gray-600 mt-2">{currentWaypoint.address}</p>}
        </div>
      )}

      {locationError && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{locationError}</div>}

      {!navigationInfo.isNavigating && (
        <div className="mb-4">
          <button onClick={startNavigation} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
            <Navigation className="w-5 h-5" /> ナビゲーション開始
          </button>
        </div>
      )}

      <div className="map-wrapper rounded-lg shadow-lg bg-white overflow-hidden" style={{ height: mapHeight }}>
        <MapContainer center={center} zoom={currentLocation ? 16 : 13} style={{ height: "100%", width: "100%" }} className="leaflet-container" ref={mapRef}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />

          {/* 現在地マーカーと精度円 */}
          {currentLocation && (
            <>
              <Marker position={[currentLocation.latitude, currentLocation.longitude]} icon={currentLocationIcon}>
                <Popup>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: "bold" }}>現在地</h3>
                    <p style={{ margin: 0, fontSize: 12, color: "#666" }}>精度: ±{Math.round(currentLocation.accuracy)}m</p>
                    <p style={{ margin: 4, fontSize: 11, color: "#9ca3af" }}>{currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</p>
                  </div>
                </Popup>
              </Marker>
              <Circle center={[currentLocation.latitude, currentLocation.longitude]} radius={currentLocation.accuracy} pathOptions={{ color: '#ff6b6b', fillColor: '#ff6b6b', fillOpacity: 0.1, weight: 1 }} />
            </>
          )}

          {/* ウェイポイント */}
          {adventure.waypoints.map((wp, index) => {
            const position: LatLngTuple = [wp.latitude, wp.longitude];
            const icon = wp.waypointType === WaypointType.START ? startIcon : wp.waypointType === WaypointType.DESTINATION ? destinationIcon : intermediateIcon;
            const isNextTarget = navigationInfo.isNavigating && index === navigationInfo.currentWaypointIndex;

            return (
              <Marker key={wp.id} position={position} icon={icon}>
                <Popup>
                  <div style={{ minWidth: "200px" }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: "bold", color: isNextTarget ? '#10b981' : 'inherit' }}>{wp.locationName || "Unknown"}{isNextTarget && ' (次の目的地)'}</h3>
                    <p style={{ margin: 0, fontSize: 12, color: "#666" }}>#{wp.sequence + 1} - {wp.waypointType}</p>
                    {wp.address && <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{wp.address}</p>}
                    {wp.poiCategory && <span style={{ background: "#f3f4f6", color: "#374151", padding: "2px 8px", borderRadius: "12px", fontSize: 11 }}>{wp.poiCategory}</span>}
                    <p style={{ margin: 4, fontSize: 11, color: "#9ca3af" }}>{wp.latitude.toFixed(6)}, {wp.longitude.toFixed(6)}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* ルート */}
          {adventure.routes?.map((route, idx) => {
            const googleRoute = route.routeJson?.routes?.[0];
            if (!googleRoute?.overview_polyline?.points) return null;
            try {
              const path = decodePolyline(googleRoute.overview_polyline.points);
              const color = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][idx % 5];
              return <Polyline key={route.id} positions={path} pathOptions={{ color, weight: 4, opacity: 0.7 }} />;
            } catch (error) {
              console.error('ポリライン デコード エラー:', error);
              return null;
            }
          })}
        </MapContainer>
      </div>
    </>
  );
};

export default MapComponent;
