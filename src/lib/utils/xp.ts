import type { Achievement, DailyGoal } from "@/lib/types";

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

export function totalXP(goals: DailyGoal[], achievements: Achievement[]) {
  return completedGoalXP(goals) + achievementXP(achievements);
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
