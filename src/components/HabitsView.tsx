import { useState } from "react";
import { 
  Check, 
  Plus, 
  Flame, 
  Clock, 
  Sparkles, 
  Trash2, 
  X, 
  TrendingUp,
  Activity,
  Heart,
  Brain,
  Home as HomeIcon,
  Moon
} from "lucide-react";
import confetti from "canvas-confetti";
import { Habit, HabitCategory, HabitTimeOfDay } from "../types";

interface HabitsViewProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (habit: Omit<Habit, "id" | "streak" | "completedToday" | "history">) => void;
  onDeleteHabit: (id: string) => void;
}

export function HabitsView({
  habits,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
}: HabitsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | "All">("All");
  const [selectedTime, setSelectedTime] = useState<HabitTimeOfDay | "all">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New Habit form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<HabitCategory>("Health");
  const [newTime, setNewTime] = useState<HabitTimeOfDay>("morning");
  const [newDuration, setNewDuration] = useState(10);
  const [newImpact, setNewImpact] = useState("");

  // AI Habit generator state
  const [aiGoal, setAiGoal] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  const filteredHabits = habits.filter((h) => {
    const matchesCategory = selectedCategory === "All" || h.category === selectedCategory;
    const matchesTime = selectedTime === "all" || h.timeOfDay === selectedTime;
    return matchesCategory && matchesTime;
  });

  const completedCount = habits.filter((h) => h.completedToday).length;
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const handleToggle = (id: string) => {
    const habit = habits.find((h) => h.id === id);
    const willBeCompleted = habit ? !habit.completedToday : false;
    onToggleHabit(id);

    if (willBeCompleted && completedCount + 1 === habits.length) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899"],
        });
      } catch {
        // safe fallback
      }
    }
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddHabit({
      title: newTitle.trim(),
      category: newCategory,
      timeOfDay: newTime,
      durationMinutes: Number(newDuration) || 5,
      impactDescription: newImpact.trim() || "Consistently boosts daily physical and mental clarity.",
    });

    setNewTitle("");
    setNewImpact("");
    setIsAddModalOpen(false);
  };

  const handleGenerateAiHabits = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/assistant/suggest-habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory !== "All" ? selectedCategory : "General Wellness",
          goal: aiGoal || "Build better focus, energy, and calming routines throughout the day",
        }),
      });
      const data = await res.json();
      if (data.habits && Array.isArray(data.habits)) {
        setAiSuggestions(data.habits);
      }
    } catch (err) {
      console.error("Failed to generate AI habits", err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const addPresetHabit = (item: { title: string; category: HabitCategory; timeOfDay: HabitTimeOfDay; durationMinutes: number; impact: string }) => {
    onAddHabit({
      title: item.title,
      category: item.category,
      timeOfDay: item.timeOfDay,
      durationMinutes: item.durationMinutes,
      impactDescription: item.impact,
    });
    setIsAddModalOpen(false);
  };

  const categoryIcons: Record<HabitCategory, any> = {
    Health: Heart,
    Focus: Brain,
    Home: HomeIcon,
    Mindfulness: Activity,
    Sleep: Moon,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Progress */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Daily Habit Architecture
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Micro-actions that make daily life frictionless, organized, and physically revitalizing.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              id="open-add-habit-modal-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-sm font-semibold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Daily Habit</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-5 border-t border-stone-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-3 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-stone-600">
              <span>Today's Execution Rate</span>
              <span>
                {completedCount} of {habits.length} completed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 text-xs font-medium text-stone-600">
            <div className="text-center">
              <div className="text-lg font-bold text-stone-900">{completedCount}</div>
              <div className="text-stone-400">Done Today</div>
            </div>
            <div className="h-8 w-px bg-stone-200" />
            <div className="text-center">
              <div className="text-lg font-bold text-amber-600 flex items-center justify-center gap-0.5">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-600" />
                <span>14d</span>
              </div>
              <div className="text-stone-400">Top Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200/80">
          {(["All", "Health", "Focus", "Home", "Mindfulness", "Sleep"] as const).map((cat) => (
            <button
              key={cat}
              id={`filter-cat-${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Time of Day */}
        <div className="flex items-center space-x-1 text-xs">
          <span className="text-stone-400 mr-1 font-medium">When:</span>
          {(["all", "morning", "afternoon", "evening"] as const).map((t) => (
            <button
              key={t}
              id={`filter-time-${t}`}
              onClick={() => setSelectedTime(t)}
              className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                selectedTime === t
                  ? "bg-amber-100 text-amber-900 font-semibold border border-amber-200"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Habits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHabits.map((habit) => {
          const Icon = categoryIcons[habit.category] || Activity;
          return (
            <div
              key={habit.id}
              id={`habit-card-${habit.id}`}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                habit.completedToday
                  ? "bg-emerald-50/40 border-emerald-200/80 shadow-xs"
                  : "bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <button
                    id={`habit-toggle-${habit.id}`}
                    onClick={() => handleToggle(habit.id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                      habit.completedToday
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "border-2 border-stone-300 hover:border-stone-400 bg-white"
                    }`}
                  >
                    {habit.completedToday && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold tracking-tight ${
                          habit.completedToday
                            ? "text-stone-500 line-through"
                            : "text-stone-900"
                        }`}
                      >
                        {habit.title}
                      </span>
                    </div>

                    {habit.impactDescription && (
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        {habit.impactDescription}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    title="Remove habit"
                    className="text-stone-300 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md font-medium bg-stone-100 text-stone-700">
                    <Icon className="w-3 h-3 mr-1 text-stone-500" />
                    {habit.category}
                  </span>
                  <span className="inline-flex items-center text-stone-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {habit.durationMinutes}m
                  </span>
                  <span className="capitalize text-stone-400">{habit.timeOfDay}</span>
                </div>

                <div className="flex items-center space-x-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                  <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                  <span>{habit.streak}d streak</span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredHabits.length === 0 && (
          <div className="col-span-full py-12 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            <Activity className="w-8 h-8 mx-auto text-stone-400 mb-2" />
            <p className="text-stone-700 font-semibold">No habits match this filter</p>
            <p className="text-xs text-stone-400 mt-1">
              Add a new daily habit or switch your filter to see all routines.
            </p>
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900">Add Daily Enhancement Habit</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick AI Suggester Tab */}
            <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-900 font-semibold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>AI Habit Designer (Gemini 3.8 Flash)</span>
                </div>
              </div>
              <p className="text-xs text-amber-800 mt-1">
                Tell us what you want to improve (e.g. "Better sleep", "Afternoon energy crash", "Desk posture").
              </p>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="e.g., reduce screen time or stay hydrated"
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white rounded-lg border border-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleGenerateAiHabits}
                  disabled={isGeneratingAi}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 disabled:opacity-50"
                >
                  {isGeneratingAi ? "Thinking..." : "Suggest"}
                </button>
              </div>

              {aiSuggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                    Suggested Micro-Habits:
                  </span>
                  {aiSuggestions.map((sug, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        addPresetHabit({
                          title: sug.title,
                          category: sug.category || "Health",
                          timeOfDay: "morning",
                          durationMinutes: sug.durationMinutes || 5,
                          impact: sug.impactDescription || "",
                        });
                      }}
                      className="p-2.5 rounded-lg bg-white border border-amber-200 hover:border-amber-400 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div className="text-xs">
                        <div className="font-semibold text-stone-900">{sug.title}</div>
                        <div className="text-stone-500 text-[11px]">{sug.impactDescription}</div>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md ml-2 shrink-0">
                        + Add
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Manual Form */}
            <form onSubmit={handleCreateHabit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Habit Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 5-Minute Diaphragmatic Breathwork"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as HabitCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                  >
                    <option value="Health">Health</option>
                    <option value="Focus">Focus</option>
                    <option value="Home">Home</option>
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Sleep">Sleep</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Time of Day
                  </label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value as HabitTimeOfDay)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="anytime">Anytime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Duration (Min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Why this enhances your day (Impact Note)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Reduces physical tension and restores mental bandwidth"
                  value={newImpact}
                  onChange={(e) => setNewImpact(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
