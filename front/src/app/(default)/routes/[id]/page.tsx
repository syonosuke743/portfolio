"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L, { LatLngTuple } from "leaflet";
import { AdventureResponse, AdventureStatus, WaypointType } from "@/types/adventure";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Clock, MapPin, Ruler } from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://back:3001";

// カスタムアイコン
const startIcon = L.divIcon({
  html: '<div style="background:#10b981;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;border:3px solid white;">🏁</div>',
  className: "custom-div-icon",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const intermediateIcon = L.divIcon({
  html: '<div style="background:#3b82f6;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;border:2px solid white;">📍</div>',
  className: "custom-div-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const destinationIcon = L.divIcon({
  html: '<div style="background:#ef4444;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;border:3px solid white;">🎯</div>',
  className: "custom-div-icon",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

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

const Page = () => {
  const [adventureId, setAdventureId] = useState<string | null>(null);
  const [adventure, setAdventure] = useState<AdventureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pathArray = window.location.pathname.split("/");
    const id = pathArray[pathArray.length - 1];
    setAdventureId(id);
  }, []);

  useEffect(() => {
    if (!adventureId) return;

    const fetchAdventure = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${backendUrl}/adventures/${adventureId}`);
        if (!res.ok) throw new Error(`Failed to fetch adventure: ${res.status}`);
        const data = await res.json();
        setAdventure(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load adventure");
      } finally {
        setLoading(false);
      }
    };

    fetchAdventure();
  }, [adventureId]);

  if (loading) return <p>ロード中...</p>;
  if (error) return <p>エラー: {error}</p>;
  if (!adventure) return <p>冒険が見つかりません</p>;

  const totalDistance = adventure.routes?.reduce((sum, r) => sum + r.distanceMeters, 0) || 0;
  const totalDuration = adventure.routes?.reduce((sum, r) => sum + r.durationMinutes, 0) || 0;

  // マップ中心
  const center: LatLngTuple = [
    adventure.waypoints[0].latitude,
    adventure.waypoints[0].longitude,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* 冒険ルート概要 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">冒険ルート</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              adventure.status === AdventureStatus.IN_PROGRESS
                ? "bg-yellow-100 text-yellow-800"
                : adventure.status === AdventureStatus.COMPLETED
                ? "bg-green-100 text-green-800"
                : adventure.status === AdventureStatus.FAILED
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {adventure.status}
          </span>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-indigo-600" /> 総距離:{" "}
            {totalDistance < 1000
              ? `${totalDistance}m`
              : `${(totalDistance / 1000).toFixed(1)}km`}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" /> 所要時間:{" "}
            {totalDuration < 60
              ? `${totalDuration}分`
              : `${Math.floor(totalDuration / 60)}時間${totalDuration % 60}分`}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" /> 地点数: {adventure.waypointCount}
          </div>
        </div>
      </div>

      {/* マップ */}
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
        className="mb-6 bg-white rounded-lg shadow-lg"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Waypoints */}
        {adventure.waypoints.map((wp) => {
          const position: LatLngTuple = [wp.latitude, wp.longitude];
          const icon =
            wp.waypointType === WaypointType.START
              ? startIcon
              : wp.waypointType === WaypointType.DESTINATION
              ? destinationIcon
              : intermediateIcon;
          return (
            <Marker key={wp.id} position={position} icon={icon}>
              <Popup>
                <div style={{ minWidth: "200px" }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: "bold" }}>
                    {wp.locationName || "Unknown"}
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                    #{wp.sequence + 1} - {wp.waypointType}
                  </p>
                  {wp.address && (
                    <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                      {wp.address}
                    </p>
                  )}
                  {wp.poiCategory && (
                    <span
                      style={{
                        background: "#f3f4f6",
                        color: "#374151",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: 11,
                      }}
                    >
                      {wp.poiCategory}
                    </span>
                  )}
                  <p style={{ margin: 4, fontSize: 11, color: "#9ca3af" }}>
                    {wp.latitude.toFixed(6)}, {wp.longitude.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Routes */}
        {adventure.routes?.map((route, idx) => {
          const googleRoute = route.routeJson?.routes?.[0];
          if (!googleRoute) return null;
          const path = decodePolyline(googleRoute.overview_polyline.points);
          const color = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][idx % 5];
          return <Polyline key={route.id} positions={path} pathOptions={{ color, weight: 4, opacity: 0.7 }} />;
        })}
      </MapContainer>
    </div>
  );
};

export default Page;
