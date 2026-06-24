import type { Achievement, DailyEntry, DailyGoal } from "@/lib/types";

export function completedGoalXP(goals: DailyGoal[]) {
  return goals
    .filter((goal) => goal.completed)
    .reduce((total, goal) => total + (goal.xp_value || 0), 0);
}

export function achievementXP(achievements: Achievement[]) {
  return achievements.reduce(
    (total, achievement) => total + (achievement.xp_awarded || 0),
    0,
  );
}

export function exerciseXPForEntry(entry: Pick<DailyEntry, "exercise_minutes" | "exercise_intensity"> | null | undefined) {
  const minutes = entry?.exercise_minutes ?? 0;
  const intensity = String(entry?.exercise_intensity ?? "").toLowerCase();
  const multiplier =
    intensity === "low"
      ? 0.2
      : intensity === "medium"
        ? 0.4
        : intensity === "high"
          ? 0.6
          : intensity === "peak"
            ? 0.8
            : 0;

  return Math.round(minutes * multiplier);
}

export function exerciseXP(entries: DailyEntry[]) {
  return entries.reduce((total, entry) => total + exerciseXPForEntry(entry), 0);
}

export function totalXP(
  goals: DailyGoal[],
  achievements: Achievement[],
  entries: DailyEntry[] = [],
) {
  return completedGoalXP(goals) + exerciseXP(entries) + achievementXP(achievements);
}

export function levelFromXP(xp: number) {
  return Math.floor(xp / 100) + 1;
}

export function progressToNextLevel(xp: number) {
  return xp % 100;
}

export function completionPercentage(completed: number, total: number) {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(date: string, days: number) {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

export function goalStats(goals: DailyGoal[]) {
  const completed = goals.filter((goal) => goal.completed).length;

  return {
    completed,
    total: goals.length,
    missed: goals.length - completed,
    percentage: completionPercentage(completed, goals.length),
  };
}

export function dailyGoalGroups(goals: DailyGoal[]) {
  return goals.reduce<Record<string, DailyGoal[]>>((groups, goal) => {
    groups[goal.goal_date] = groups[goal.goal_date] ?? [];
    groups[goal.goal_date].push(goal);
    return groups;
  }, {});
}

export function isSuccessfulDay(goals: DailyGoal[]) {
  if (!goals.length) return false;
  return goalStats(goals).percentage >= 70;
}

export function currentStreak(goals: DailyGoal[], fromDate = todayISO()) {
  const groups = dailyGoalGroups(goals.filter((goal) => goal.goal_date <= fromDate));
  let streak = 0;
  let cursor = fromDate;

  while (groups[cursor]?.length && isSuccessfulDay(groups[cursor])) {
    streak += 1;
    cursor = addDaysISO(cursor, -1);
  }

  return streak;
}

export function bestStreak(goals: DailyGoal[]) {
  const groups = dailyGoalGroups(goals);
  const dates = Object.keys(groups).sort();
  let best = 0;
  let current = 0;
  let previous = "";

  for (const date of dates) {
    const consecutive = previous ? addDaysISO(previous, 1) === date : true;
    if (consecutive && isSuccessfulDay(groups[date])) {
      current += 1;
    } else {
      current = isSuccessfulDay(groups[date]) ? 1 : 0;
    }
    best = Math.max(best, current);
    previous = date;
  }

  return best;
}
