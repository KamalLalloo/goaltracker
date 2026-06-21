alter table public.daily_entries
  add column if not exists biggest_win text,
  add column if not exists tomorrow_focus text;
