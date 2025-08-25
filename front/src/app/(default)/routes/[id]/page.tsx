"use client"

import dynamic from 'next/dynamic';
import { AdventureResponse, AdventureStatus } from "@/types/adventure";
import { useEffect, useState } from "react";
import { Clock, MapPin, Ruler, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from 'next/navigation';
import { fetchWithApigateway } from '@/lib/fetchWithApigateway';

// LeafletマップコンポーネントをSSRを無効にして動的インポート
const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 min-h-0 rounded-lg shadow-lg bg-white flex items-center justify-center" style={{ minHeight: '500px' }}>
      マップ読み込み中...
    </div>
  )
});

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://back:3001";

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const adventureId = params?.id as string;

  const [adventure, setAdventure] = useState<AdventureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adventureId) return;

    const fetchAdventure = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchWithApigateway(`${backendUrl}/adventures/${adventureId}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch adventure: ${res.status}`);
        }

        const data = await res.json();
        setAdventure(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load adventure";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAdventure();
  }, [adventureId]);

  // リトライ処理
  const handleRetry = () => {
    if (!adventureId) return;

    const fetchAdventure = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchWithApigateway(`${backendUrl}/adventures/${adventureId}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch adventure: ${res.status}`);
        }

        const data = await res.json();
        setAdventure(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load adventure";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAdventure();
  };

  // 戻るボタンのハンドラー
  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">ロード中...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">エラーが発生しました</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                再試行
              </button>
              <button
                onClick={handleGoBack}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                戻る
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!adventure) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center bg-white rounded-lg shadow-lg p-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.87 0-5.43 1.51-6.84 3.891M12 6.25a3.25 3.25 0 100-6.5 3.25 3.25 0 000 6.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">冒険が見つかりません</h2>
            <p className="text-gray-600 mb-6">指定された冒険は存在しないか、削除されている可能性があります。</p>
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              戻る
            </button>
          </div>
        </main>
      </div>
    );
  }

  const totalDistance = adventure.routes?.reduce((sum, r) => sum + r.distanceMeters, 0) || 0;
  const totalDuration = adventure.routes?.reduce((sum, r) => sum + r.durationMinutes, 0) || 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* メインコンテンツ */}
      <main className="flex-1 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col gap-6 pb-16 z-0">
        {/* 冒険ルート概要 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleGoBack}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">冒険ルート</h1>
            </div>
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
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">総距離:</span>{" "}
              {totalDistance < 1000
                ? `${totalDistance}m`
                : `${(totalDistance / 1000).toFixed(1)}km`}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">所要時間:</span>{" "}
              {totalDuration < 60
                ? `${totalDuration}分`
                : `${Math.floor(totalDuration / 60)}時間${totalDuration % 60}分`}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">地点数:</span> {adventure.waypointCount}
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
