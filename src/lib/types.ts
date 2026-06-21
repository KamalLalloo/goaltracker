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
  created_at: string | null;
};

export type DailyGoal = {
  id: string;
  user_id: string | null;
  goal_date: string;
  title: string;
  xp_value: number;
  completed: boolean;
  created_at: string | null;
};

export type Achievement = {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  xp_awarded: number;
  achieved_date: string;
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
  >
>;
