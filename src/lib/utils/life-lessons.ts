export type LifeLesson = {
  id: string;
  text: string;
  createdAt: string;
};

const key = "goaltracker:life-lessons";

export function readLifeLessons() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored) as LifeLesson[];
  } catch {
    return [];
  }
}

export function saveLifeLessons(lessons: LifeLesson[]) {
  window.localStorage.setItem(key, JSON.stringify(lessons));
}

export function createLifeLesson(text: string): LifeLesson {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`,
    text,
    createdAt: new Date().toISOString(),
  };
}

export function dailyLifeLesson(lessons: LifeLesson[], date: string) {
  if (!lessons.length) return null;

  const seed = date
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  return lessons[seed % lessons.length];
}
