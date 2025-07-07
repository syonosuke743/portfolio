"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

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

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      const res = await fetch(`${getApiBaseUrl()}/todo`);
      if (!res.ok) throw new Error("Todo取得に失敗しました");
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/todo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) throw new Error("作成に失敗しました");

      setTitle("");
      setDescription("");
      await fetchTodos();
    } catch (error) {
      alert("作成に失敗しました");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("本当に削除しますか？")) return;

    try {
      const res = await fetch(`${getApiBaseUrl()}/todo/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("削除失敗");

      alert("削除しました");
      await fetchTodos();
    } catch (error) {
      alert("削除に失敗しました");
      console.error(error);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Todo一覧</h1>

      {/* 作成フォーム */}
      <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">新しいTodoを追加</h2>
        <div className="mb-2">
          <input
            type="text"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-2">
          <textarea
            placeholder="詳細"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "追加中..." : "追加する"}
        </button>
      </form>

      {/* Todo一覧 */}
      {todos.length === 0 ? (
        <p>Todoはありません</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} className="flex justify-between p-4 border-b">
              <Link href={`/todos/${todo.id}`} className="flex-1">
                <h2 className="text-xl font-semibold">{todo.title}</h2>
                <p className="text-gray-600 truncate">{todo.description}</p>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(todo.id);
                }}
                className="ml-4 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
