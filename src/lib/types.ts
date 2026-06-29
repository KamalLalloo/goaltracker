export type DailyEntry = {
  id: string;
  user_id: string | null;
  entry_date: string;
  quote: string | null;
  what_went_well: string | null;
  what_could_improve: string | null;
  what_did_i_learn: string | null;
  idea_of_day: string | null;
  biggest_win: string | null;
  tomorrow_focus: string | null;
  mood: number | null;
  sleep_score: number | null;
  wake_time: string | null;
  exercise_minutes: number | null;
  exercise_intensity: "Low" | "Medium" | "High" | "Peak" | string | null;
  weight: number | null;
  created_at: string | null;
};

export type DailyGoal = {
  id: string;
  user_id: string | null;
  goal_date: string;
  title: string;
  xp_value: number;
  completed: boolean;
  project_id: string | null;
  created_at: string | null;
};

export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";
export type ProjectStatus = "Planning" | "Active" | "Paused" | "Completed";

export type Project = {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  priority: ProjectPriority | string;
  target_date: string | null;
  xp_reward: number;
  status: ProjectStatus | string;
  created_at: string | null;
};

export type FoodEntry = {
  id: string;
  user_id: string | null;
  entry_date: string;
  food_name: string;
  created_at: string | null;
};

export type EntryUpdate = Partial<
  Pick<
    DailyEntry,
    | "quote"
    | "what_went_well"
    | "what_could_improve"
    | "what_did_i_learn"
    | "idea_of_day"
    | "biggest_win"
    | "tomorrow_focus"
    | "mood"
    | "sleep_score"
    | "wake_time"
    | "exercise_minutes"
    | "exercise_intensity"
    | "weight"
  >
>;
