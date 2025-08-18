"use client"

import dynamic from 'next/dynamic';
import { AdventureResponse, AdventureStatus, WaypointType } from "@/types/adventure";
import { useEffect, useState } from "react";
import { Clock, MapPin, Ruler } from "lucide-react";

// LeafletマップコンポーネントをSSRを無効にして動的インポート
const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="flex-1 min-h-0 rounded-lg shadow-lg bg-white flex items-center justify-center" style={{ minHeight: '500px' }}>マップ読み込み中...</div>
});

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://back:3001";

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* メインコンテンツ */}
      <main className="flex-1 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col gap-6 pb-16 z-0">
        {/* 冒険ルート概要 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
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
        <MapComponent adventure={adventure} />
      </main>
    </div>
  );
};

export default Page;
