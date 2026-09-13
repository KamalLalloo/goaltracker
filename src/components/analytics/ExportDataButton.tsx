"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { fetchEntries } from "@/lib/actions/entries";
import { fetchFoodEntries } from "@/lib/actions/food";
import { fetchGoals } from "@/lib/actions/goals";
import {
  completedGoalXP,
  exerciseXPForEntry,
  todayISO,
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
      const today = todayISO();
      const filteredGoals = goals.filter(
        (goal) => (!start || goal.goal_date >= start) && goal.goal_date <= today,
      );
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "GoalTracker";
      workbook.created = new Date();

      const dailySheet = workbook.addWorksheet("Daily Entries");
      dailySheet.columns = [
        { header: "Date", key: "date" },
        { header: "Day Rating", key: "mood" },
        { header: "Sleep Hours", key: "sleepHours" },
        { header: "Wake Time", key: "wake" },
        { header: "Exercise Minutes", key: "minutes" },
        { header: "Exercise Intensity", key: "intensity" },
        { header: "Exercise XP", key: "exerciseXp" },
        { header: "Distraction Rating", key: "distraction" },
      ];
      entries
        .filter((entry) => entry.entry_date <= today)
        .forEach((entry) => {
          dailySheet.addRow({
            date: entry.entry_date,
            mood: entry.mood,
            sleepHours: entry.sleep_hours,
            wake: entry.wake_time,
            minutes: entry.exercise_minutes,
            intensity: entry.exercise_intensity,
            exerciseXp: exerciseXPForEntry(entry),
            distraction: entry.distraction_rating,
          });
        });

      const goalsSheet = workbook.addWorksheet("Goals");
      goalsSheet.columns = [
        { header: "Date", key: "date" },
        { header: "Goal", key: "goal" },
        { header: "XP", key: "xp" },
        { header: "Completed", key: "completed" },
      ];
      filteredGoals.forEach((goal) => {
        goalsSheet.addRow({
          date: goal.goal_date,
          goal: goal.title,
          xp: goal.xp_value,
          completed: goal.completed ? "Yes" : "No",
        });
      });

      const foodSheet = workbook.addWorksheet("Food");
      foodSheet.columns = [
        { header: "Date", key: "date" },
        { header: "Food Name", key: "food" },
      ];
      foods
        .filter((food) => food.entry_date <= today)
        .forEach((food) => {
          foodSheet.addRow({ date: food.entry_date, food: food.food_name });
        });

      const summarySheet = workbook.addWorksheet("XP Summary");
      summarySheet.addRow(["Goal XP", completedGoalXP(filteredGoals)]);
      summarySheet.addRow(["Exercise XP", entries.reduce((sum, entry) => sum + exerciseXPForEntry(entry), 0)]);

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
