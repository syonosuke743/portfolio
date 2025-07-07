"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Todo = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://back:3001";
  } else {
    return "http://localhost:3001";
  }
}

export default function TodoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [todo, setTodo] = useState<Todo | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function fetchTodo() {
      setLoading(true);
      try {
        const res = await fetch(`${getApiBaseUrl()}/todo/${id}`);
        if (!res.ok) throw new Error("取得失敗");
        const data = await res.json();
        setTodo(data);
        setTitle(data.title);
        setDescription(data.description);
      } catch (err: any) {
        console.error(err);
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }

    fetchTodo();
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/todo/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) throw new Error("更新失敗");

      const updated = await res.json();
      alert("更新しました");
      setTodo(updated);
    } catch (err) {
      console.error(err);
      alert("更新に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6">読み込み中...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!todo) return <p className="p-6">Todoが見つかりません</p>;

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Todoを編集</h1>

      <form onSubmit={handleUpdate} className="bg-white p-4 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">タイトル</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">詳細</label>
          <textarea
            className="w-full px-3 py-2 border rounded"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </form>

      <button
        onClick={() => router.push("/")}
        className="text-blue-500 hover:underline text-sm"
      >
        ← 一覧に戻る
      </button>
    </main>
  );
}
