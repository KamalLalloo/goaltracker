"use client";

import { CalendarDays, Check, ListTodo, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import {
  createMainTodo,
  type MainTodo,
  readMainTodos,
  saveMainTodos,
} from "@/lib/utils/main-todos";
import { todayISO } from "@/lib/utils/xp";

export default function TodosPage() {
  const [todos, setTodos] = useState<MainTodo[]>(() => readMainTodos());
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const sortedTodos = useMemo(
    () =>
      [...todos].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return b.createdAt.localeCompare(a.createdAt);
      }),
    [todos],
  );
  const openTodos = todos.filter((todo) => !todo.completed).length;
  const dueToday = todos.filter(
    (todo) => !todo.completed && todo.dueDate === todayISO(),
  ).length;

  function persist(nextTodos: MainTodo[]) {
    setTodos(nextTodos);
    saveMainTodos(nextTodos);
  }

  function addTodo(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    persist([createMainTodo(title.trim(), dueDate || null), ...todos]);
    setTitle("");
    setDueDate("");
  }

  function toggleTodo(todo: MainTodo) {
    persist(
      todos.map((item) =>
        item.id === todo.id ? { ...item, completed: !item.completed } : item,
      ),
    );
  }

  function deleteTodo(id: string) {
    persist(todos.filter((todo) => todo.id !== id));
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#34D399]">
          Inbox
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          To Do List
        </h1>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Open Tasks" value={openTodos} />
        <Stat label="Due Today" value={dueToday} />
        <Stat label="Completed" value={todos.length - openTodos} />
      </div>

      <Card title="Add Task">
        <form className="grid gap-4 md:grid-cols-[1fr_180px_auto]" onSubmit={addTodo}>
          <Input
            label="Task"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Capture anything that needs doing"
            value={title}
          />
          <Input
            label="Due Date"
            onChange={(event) => setDueDate(event.target.value)}
            type="date"
            value={dueDate}
          />
          <Button className="self-end" type="submit">
            <Plus size={17} />
            Add Task
          </Button>
        </form>
      </Card>

      <Card title="Main List">
        {sortedTodos.length === 0 ? (
          <EmptyState>No tasks yet.</EmptyState>
        ) : (
          <div className="space-y-3">
            {sortedTodos.map((todo) => (
              <div
                className="grid gap-3 rounded-[18px] border border-[#1A1A1A] bg-black/25 p-3 sm:grid-cols-[auto_1fr_auto]"
                key={todo.id}
              >
                <button
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
                    todo.completed
                      ? "border-[#34D399] bg-[#34D399] text-black"
                      : "border-zinc-700 text-zinc-700 hover:border-[#34D399] hover:text-[#34D399]"
                  }`}
                  onClick={() => toggleTodo(todo)}
                  type="button"
                >
                  <Check size={17} />
                </button>
                <div className="min-w-0">
                  <p
                    className={`truncate text-sm font-medium ${
                      todo.completed ? "text-[#A1A1AA] line-through" : "text-white"
                    }`}
                  >
                    {todo.title}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-[#A1A1AA]">
                    {todo.dueDate ? (
                      <>
                        <CalendarDays size={14} className="text-[#34D399]" />
                        {formatDate(todo.dueDate)}
                      </>
                    ) : (
                      <>
                        <ListTodo size={14} className="text-[#34D399]" />
                        No due date
                      </>
                    )}
                  </p>
                </div>
                <Button
                  aria-label="Delete task"
                  className="h-9 w-9 px-0"
                  onClick={() => deleteTodo(todo.id)}
                  type="button"
                  variant="ghost"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-[#A1A1AA]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </Card>
  );
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
