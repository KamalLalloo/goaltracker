"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { fetchEntries } from "@/lib/actions/entries";
import { fetchFoodEntries } from "@/lib/actions/food";
import { fetchGoals } from "@/lib/actions/goals";
import { readLifeLessons } from "@/lib/utils/life-lessons";
import { readMainTodos } from "@/lib/utils/main-todos";
import {
  completedGoalXP,
  completionPercentage,
  exerciseXPForEntry,
} from "@/lib/utils/xp";

type ExportRange = "last7" | "last30" | "month" | "year" | "all";

const options: { label: string; value: ExportRange }[] = [
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all" },
];

export function ExportDataButton() {
  const [range, setRange] = useState<ExportRange>("last30");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  async function exportData() {
    try {
      setExporting(true);
      setError("");

      const ExcelJS = await import("exceljs");
      const start = rangeStart(range);
      const [entries, goals, foods] = await Promise.all([
        fetchEntries(start ?? undefined),
        fetchGoals(),
        fetchFoodEntries(undefined, start ?? undefined),
      ]);
      const todos = readMainTodos();
      const lessons = readLifeLessons();

      const filteredEntries = entries.filter((entry) => isInRange(entry.entry_date, start));
      const filteredGoals = goals.filter((goal) => isInRange(goal.goal_date, start));
      const filteredFoods = foods.filter((food) => isInRange(food.entry_date, start));
      const filteredTodos = todos.filter((todo) =>
        isInRange(todo.dueDate ?? dateFromIso(todo.createdAt), start),
      );
      const filteredLessons = lessons.filter((lesson) =>
        isInRange(dateFromIso(lesson.createdAt), start),
      );
      const dates = Array.from(
        new Set([
          ...filteredEntries.map((entry) => entry.entry_date),
          ...filteredGoals.map((goal) => goal.goal_date),
          ...filteredFoods.map((food) => food.entry_date),
          ...filteredTodos.map((todo) => todo.dueDate ?? dateFromIso(todo.createdAt)),
          ...filteredLessons.map((lesson) => dateFromIso(lesson.createdAt)),
        ]),
      ).sort();

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "GoalTracker";
      workbook.created = new Date();

      const sheet = workbook.addWorksheet("Daily Export");
      sheet.columns = [
        { header: "Date", key: "date", width: 14 },
        { header: "Day Rating", key: "mood", width: 12 },
        { header: "Day Comment", key: "dayComment", width: 36 },
        { header: "Biggest Win", key: "biggestWin", width: 34 },
        { header: "Tomorrow Focus", key: "tomorrowFocus", width: 34 },
        { header: "Quote", key: "quote", width: 34 },
        { header: "What Went Well", key: "whatWentWell", width: 34 },
        { header: "What Could Improve", key: "whatCouldImprove", width: 34 },
        { header: "What Did I Learn", key: "whatDidILearn", width: 34 },
        { header: "Sleep Hours", key: "sleepHours", width: 12 },
        { header: "Wake Time", key: "wakeTime", width: 12 },
        { header: "Exercise Minutes", key: "exerciseMinutes", width: 16 },
        { header: "Exercise Intensity", key: "exerciseIntensity", width: 18 },
        { header: "Exercise XP", key: "exerciseXp", width: 12 },
        { header: "Distraction Rating", key: "distractionRating", width: 18 },
        { header: "Total Goals", key: "totalGoals", width: 12 },
        { header: "Completed Goals Count", key: "completedGoalsCount", width: 22 },
        { header: "Missed Goals Count", key: "missedGoalsCount", width: 18 },
        { header: "Goal Completion %", key: "goalCompletion", width: 18 },
        { header: "Goal XP", key: "goalXp", width: 10 },
        { header: "Total XP", key: "totalXp", width: 10 },
        { header: "Completed Goals", key: "completedGoals", width: 42 },
        { header: "Missed Goals", key: "missedGoals", width: 42 },
        { header: "All Goals", key: "allGoals", width: 48 },
        { header: "Food Consumed", key: "foods", width: 42 },
        { header: "To Dos Due", key: "todosDue", width: 42 },
        { header: "Life Lessons Added", key: "lessonsAdded", width: 48 },
      ];

      dates.forEach((date) => {
        const entry = filteredEntries.find((item) => item.entry_date === date);
        const dayGoals = filteredGoals.filter((goal) => goal.goal_date === date);
        const completedGoals = dayGoals.filter((goal) => goal.completed);
        const missedGoals = dayGoals.filter((goal) => !goal.completed);
        const dayFoods = filteredFoods.filter((food) => food.entry_date === date);
        const dayTodos = filteredTodos.filter(
          (todo) => (todo.dueDate ?? dateFromIso(todo.createdAt)) === date,
        );
        const dayLessons = filteredLessons.filter(
          (lesson) => dateFromIso(lesson.createdAt) === date,
        );
        const goalXp = completedGoalXP(dayGoals);
        const exerciseXp = exerciseXPForEntry(entry);

        sheet.addRow({
          date,
          mood: entry?.mood ?? "",
          dayComment: entry?.idea_of_day ?? "",
          biggestWin: entry?.biggest_win ?? "",
          tomorrowFocus: entry?.tomorrow_focus ?? "",
          quote: entry?.quote ?? "",
          whatWentWell: entry?.what_went_well ?? "",
          whatCouldImprove: entry?.what_could_improve ?? "",
          whatDidILearn: entry?.what_did_i_learn ?? "",
          sleepHours: entry?.sleep_hours ?? "",
          wakeTime: entry?.wake_time ?? "",
          exerciseMinutes: entry?.exercise_minutes ?? "",
          exerciseIntensity: entry?.exercise_intensity ?? "",
          exerciseXp,
          distractionRating: entry?.distraction_rating ?? "",
          totalGoals: dayGoals.length,
          completedGoalsCount: completedGoals.length,
          missedGoalsCount: missedGoals.length,
          goalCompletion: completionPercentage(completedGoals.length, dayGoals.length),
          goalXp,
          totalXp: goalXp + exerciseXp,
          completedGoals: joinItems(completedGoals.map((goal) => goal.title)),
          missedGoals: joinItems(missedGoals.map((goal) => goal.title)),
          allGoals: joinItems(
            dayGoals.map(
              (goal) =>
                `${goal.completed ? "Done" : "Open"} - ${goal.title} (${goal.xp_value} XP)`,
            ),
          ),
          foods: joinItems(dayFoods.map((food) => food.food_name)),
          todosDue: joinItems(
            dayTodos.map((todo) => `${todo.completed ? "Done" : "Open"} - ${todo.title}`),
          ),
          lessonsAdded: joinItems(dayLessons.map((lesson) => lesson.text)),
        });
      });

      sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0D0D0D" },
      };
      sheet.eachRow((row) => {
        row.alignment = { vertical: "top", wrapText: true };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "goaltracker_export.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export data.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <select
        className="h-11 rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] px-4 text-sm text-white outline-none"
        onChange={(event) => setRange(event.target.value as ExportRange)}
        value={range}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button disabled={exporting} onClick={exportData} type="button">
        <Download size={16} />
        Export
      </Button>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}

function joinItems(items: string[]) {
  return items.filter(Boolean).join("\n");
}

function dateFromIso(value: string) {
  return value.slice(0, 10);
}

function isInRange(date: string, start: string | null) {
  return !start || date >= start;
}

function rangeStart(range: ExportRange) {
  const date = new Date();
  if (range === "all") return null;
  if (range === "last7") date.setDate(date.getDate() - 6);
  if (range === "last30") date.setDate(date.getDate() - 29);
  if (range === "month") {
    date.setDate(1);
  }
  if (range === "year") {
    date.setMonth(0, 1);
  }
  return date.toISOString().slice(0, 10);
}
