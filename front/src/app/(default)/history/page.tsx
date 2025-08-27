"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Trash2, MapPin, Calendar, Route as RouteIcon } from "lucide-react";


interface Waypoint {
  id: string;
  locationName?: string;
}

interface Adventure {
  id: string;
  title?: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  createdAt: string;
  waypointCount: number;
  plannedDistanceMeters: number;
  waypoints?: Waypoint[];
}

const AdventureHistoryPage: React.FC = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdventures = async (userId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/adventures/user/${userId}`);
      if (!res.ok) throw new Error(`Failed to fetch adventures: ${res.status}`);
      const data: Adventure[] = await res.json();
      setAdventures(data);
    } catch (error) {
      console.error("Failed to fetch adventures:", error);
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteAdventure = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("このアドベンチャーを削除しますか？")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/adventures/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("削除に失敗しました");
      setAdventures(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "削除に失敗しました";
      alert(errorMessage);
      console.error(error);
    }
  };

  const handleCardClick = (id: string) => {
    router.push(`/routes/${id}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: Adventure["status"]) => {
    const statusMap: Record<Adventure["status"], { label: string; style: string }> = {
      PLANNED: { label: "計画中", style: "bg-yellow-100 text-yellow-800" },
      IN_PROGRESS: { label: "進行中", style: "bg-blue-100 text-blue-800" },
      COMPLETED: { label: "完了", style: "bg-green-100 text-green-800" },
      FAILED: { label: "失敗", style: "bg-red-100 text-red-800" },
    };
    const { label, style } = statusMap[status] || { label: status, style: "bg-gray-100 text-gray-800" };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${style}`}>{label}</span>;
  };

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.id) {
      fetchAdventures(session.user.id);
    }
  }, [sessionStatus, session?.user?.id]);

  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">アドベンチャー履歴を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg">エラーが発生しました</p>
          <p className="text-gray-600 mt-2">{error}</p>
          {session?.user?.id && (
            <button
              onClick={() => fetchAdventures(session.user.id)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              type="button"
            >
              再試行
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">アドベンチャー履歴</h1>
          <p className="text-gray-600">過去のアドベンチャーを確認・管理できます</p>
        </div>

        {adventures.length === 0 ? (
          <div className="text-center py-12">
            <RouteIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">まだアドベンチャーがありません</p>
            <p className="text-gray-400 mt-2">新しいアドベンチャーを作成してみましょう！</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {adventures.map(a => (
              <div
                key={a.id}
                onClick={() => handleCardClick(a.id)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(a.id);
                  }
                }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {a.title || `アドベンチャー ${a.id.slice(0, 8)}`}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(a.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(a.status)}
                      <button
                        onClick={e => deleteAdventure(a.id, e)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="削除"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{a.waypointCount} 地点</span>
                    </div>
                    <div className="flex items-center">
                      <RouteIcon className="h-4 w-4 mr-2" />
                      <span>{Math.round((a.plannedDistanceMeters / 1000) * 10) / 10} km</span>
                    </div>
                  </div>

                  {a.waypoints && a.waypoints.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">経由地点</p>
                      <div className="flex flex-wrap gap-1">
                        {a.waypoints.slice(0, 3).map((w, idx) => (
                          <span key={w.id} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {w.locationName || `地点${idx + 1}`}
                          </span>
                        ))}
                        {a.waypoints.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                            +{a.waypoints.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdventureHistoryPage;
