export type MainTodo = {
  id: string;
  title: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
};

const key = "goaltracker:main-todos";

export function readMainTodos() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored) as MainTodo[];
  } catch {
    return [];
  }
}

export function saveMainTodos(todos: MainTodo[]) {
  window.localStorage.setItem(key, JSON.stringify(todos));
}

export function createMainTodo(title: string, dueDate: string | null): MainTodo {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`,
    title,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}
