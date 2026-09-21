import { useState, useEffect } from "react";
import { 
  Habit, 
  SmartHomeScene, 
  ScheduleBlock, 
  DailyVitality, 
  ActiveTab 
} from "./types";
import { 
  DEFAULT_HABITS, 
  SMART_HOME_SCENES, 
  DEFAULT_SCHEDULE, 
  DEFAULT_VITALITY 
} from "./data/initialData";
import { Navbar } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { HabitsView } from "./components/HabitsView";
import { EnvironmentView } from "./components/EnvironmentView";
import { ScheduleView } from "./components/ScheduleView";
import { AssistantView } from "./components/AssistantView";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  // State with LocalStorage persistence
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem("aura_habits");
      return saved ? JSON.parse(saved) : DEFAULT_HABITS;
    } catch {
      return DEFAULT_HABITS;
    }
  });

  const [scenes, setScenes] = useState<SmartHomeScene[]>(() => {
    try {
      const saved = localStorage.getItem("aura_scenes");
      return saved ? JSON.parse(saved) : SMART_HOME_SCENES;
    } catch {
      return SMART_HOME_SCENES;
    }
  });

  const [activeScene, setActiveScene] = useState<SmartHomeScene>(() => {
    try {
      const saved = localStorage.getItem("aura_active_scene");
      return saved ? JSON.parse(saved) : SMART_HOME_SCENES[0];
    } catch {
      return SMART_HOME_SCENES[0];
    }
  });

  const [schedule, setSchedule] = useState<ScheduleBlock[]>(() => {
    try {
      const saved = localStorage.getItem("aura_schedule");
      return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE;
    } catch {
      return DEFAULT_SCHEDULE;
    }
  });

  const [vitality, setVitality] = useState<DailyVitality>(() => {
    try {
      const saved = localStorage.getItem("aura_vitality");
      return saved ? JSON.parse(saved) : DEFAULT_VITALITY;
    } catch {
      return DEFAULT_VITALITY;
    }
  });

  // Persist state updates to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("aura_habits", JSON.stringify(habits));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem("aura_scenes", JSON.stringify(scenes));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [scenes]);

  useEffect(() => {
    try {
      localStorage.setItem("aura_active_scene", JSON.stringify(activeScene));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [activeScene]);

  useEffect(() => {
    try {
      localStorage.setItem("aura_schedule", JSON.stringify(schedule));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [schedule]);

  useEffect(() => {
    try {
      localStorage.setItem("aura_vitality", JSON.stringify(vitality));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [vitality]);

  // Habit handlers
  const handleToggleHabit = (id: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const willComplete = !h.completedToday;
        const newStreak = willComplete ? h.streak + 1 : Math.max(0, h.streak - 1);
        const newHistory = willComplete
          ? Array.from(new Set([...h.history, todayStr]))
          : h.history.filter((d) => d !== todayStr);

        return {
          ...h,
          completedToday: willComplete,
          streak: newStreak,
          history: newHistory,
        };
      })
    );
  };

  const handleAddHabit = (
    newHabit: Omit<Habit, "id" | "streak" | "completedToday" | "history">
  ) => {
    const created: Habit = {
      ...newHabit,
      id: `habit-${Date.now()}`,
      streak: 0,
      completedToday: false,
      history: [],
    };
    setHabits((prev) => [created, ...prev]);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  // Scene handlers
  const handleSelectScene = (sc: SmartHomeScene) => {
    setActiveScene(sc);
  };

  const handleUpdateActiveScene = (partial: Partial<SmartHomeScene>) => {
    const updated = { ...activeScene, ...partial };
    setActiveScene(updated);
    setScenes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  // Schedule handlers
  const handleToggleBlock = (id: string) => {
    setSchedule((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleAddBlock = (newBlock: Omit<ScheduleBlock, "id" | "completed">) => {
    const created: ScheduleBlock = {
      ...newBlock,
      id: `block-${Date.now()}`,
      completed: false,
    };
    setSchedule((prev) => [...prev, created]);
  };

  const handleDeleteBlock = (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  };

  // Vitality handler
  const handleUpdateVitality = (partial: Partial<DailyVitality>) => {
    setVitality((prev) => ({ ...prev, ...partial }));
  };

  const completedHabitsCount = habits.filter((h) => h.completedToday).length;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans antialiased selection:bg-amber-200 selection:text-stone-900">
      {/* Top App Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeScene={activeScene}
        completedCount={completedHabitsCount}
        totalHabitsCount={habits.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "dashboard" && (
          <DashboardView
            habits={habits}
            activeScene={activeScene}
            scenes={scenes}
            schedule={schedule}
            vitality={vitality}
            onToggleHabit={handleToggleHabit}
            onSelectScene={handleSelectScene}
            onUpdateVitality={handleUpdateVitality}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "habits" && (
          <HabitsView
            habits={habits}
            onToggleHabit={handleToggleHabit}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
          />
        )}

        {activeTab === "environment" && (
          <EnvironmentView
            activeScene={activeScene}
            scenes={scenes}
            onSelectScene={handleSelectScene}
            onUpdateActiveScene={handleUpdateActiveScene}
          />
        )}

        {activeTab === "schedule" && (
          <ScheduleView
            schedule={schedule}
            onToggleBlock={handleToggleBlock}
            onAddBlock={handleAddBlock}
            onDeleteBlock={handleDeleteBlock}
          />
        )}

        {activeTab === "assistant" && (
          <AssistantView
            habits={habits}
            activeScene={activeScene}
            energyLevel={vitality.energyLevel}
            waterGlasses={vitality.waterGlasses}
            onAddHabit={handleAddHabit}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-stone-200 bg-white/60 py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-stone-700">Daily Life Enhancement Hub</span>
            <span>•</span>
            <span>Micro-Habits, Circadian Ambience & Mindful Pacing</span>
          </div>
          <div className="flex items-center space-x-4 text-stone-400">
            <span>Designed for calm, intentional everyday living</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
