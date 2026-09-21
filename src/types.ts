export type HabitCategory = "Health" | "Focus" | "Home" | "Mindfulness" | "Sleep";

export type HabitTimeOfDay = "anytime" | "morning" | "afternoon" | "evening";

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  timeOfDay: HabitTimeOfDay;
  durationMinutes: number;
  streak: number;
  completedToday: boolean;
  history: string[]; // ISO date strings YYYY-MM-DD
  impactDescription?: string;
}

export type SceneId = "morning" | "focus" | "afternoon" | "evening" | "eco";

export interface SmartHomeScene {
  id: SceneId;
  name: string;
  description: string;
  iconName: string;
  lightBrightness: number; // 0 - 100
  lightTempK: number; // 2200K - 6500K
  lightHex: string;
  temperatureF: number; // e.g. 68
  soundscape: SoundscapeType;
  airPurifierSpeed: "quiet" | "auto" | "turbo";
}

export type SoundscapeType = "none" | "rain" | "fireplace" | "alpha_waves" | "birds";

export interface ScheduleBlock {
  id: string;
  title: string;
  startTime: string; // e.g. "08:30"
  endTime: string; // e.g. "10:30"
  category: "work" | "wellness" | "home" | "rest";
  energyRequired: "high" | "medium" | "low";
  completed: boolean;
}

export interface DailyVitality {
  date: string; // YYYY-MM-DD
  waterGlasses: number; // target 8
  energyLevel: number; // 1 to 5
  mood: "great" | "calm" | "tired" | "stressed" | "energized";
  reflection: string;
}

export interface AssistantMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  source?: "gemini-3.8-flash" | "local-optimizer";
  suggestedHabit?: Omit<Habit, "id" | "streak" | "completedToday" | "history">;
}

export type ActiveTab = "dashboard" | "habits" | "environment" | "schedule" | "assistant";
