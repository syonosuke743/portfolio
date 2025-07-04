"use client"
import { useEffect, useState } from "react";


export default function Home() {

  type Todo = {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    createAt: string;
  }

  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/todo")
      .then((res) => res.json())
      .then((data) => setTodos(data));
  }, [])

  return (
    <>
      <h1>todo一覧</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title} - {todo.description}</li>
        ))}
      </ul>
    </>
  );
}
