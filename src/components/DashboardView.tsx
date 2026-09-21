import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Flame, 
  Check, 
  Droplet, 
  Zap, 
  ArrowRight, 
  Sun, 
  Clock, 
  Sliders, 
  Bot, 
  Smile,
  ShieldCheck
} from "lucide-react";
import { 
  Habit, 
  SmartHomeScene, 
  ScheduleBlock, 
  DailyVitality, 
  ActiveTab 
} from "../types";

interface DashboardViewProps {
  habits: Habit[];
  activeScene: SmartHomeScene;
  scenes: SmartHomeScene[];
  schedule: ScheduleBlock[];
  vitality: DailyVitality;
  onToggleHabit: (id: string) => void;
  onSelectScene: (scene: SmartHomeScene) => void;
  onUpdateVitality: (partial: Partial<DailyVitality>) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export function DashboardView({
  habits,
  activeScene,
  scenes,
  schedule,
  vitality,
  onToggleHabit,
  onSelectScene,
  onUpdateVitality,
  setActiveTab,
}: DashboardViewProps) {
  const [greeting, setGreeting] = useState("Good day");
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    setFormattedDate(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    );
  }, []);

  const completedCount = habits.filter((h) => h.completedToday).length;
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  // Find currently active or next schedule block
  const nextBlock = schedule.find((s) => !s.completed) || schedule[0];

  const handleAddWater = () => {
    onUpdateVitality({ waterGlasses: Math.min(12, vitality.waterGlasses + 1) });
  };

  const handleEnergySelect = (lvl: number) => {
    onUpdateVitality({ energyLevel: lvl });
  };

  return (
    <div className="space-y-6">
      {/* 1. Daily Hero Cockpit Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                {formattedDate}
              </span>
              <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Circadian Rhythm Synced
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {greeting}, Builder.
            </h1>
            <p className="text-stone-600 text-sm sm:text-base max-w-xl leading-relaxed">
              Your living space is set to <strong>{activeScene.name}</strong> ({activeScene.temperatureF}°F, {activeScene.lightTempK}K). You have completed {completedCount} of {habits.length} daily habits.
            </p>
          </div>

          {/* Quick Vitality Metrics Ring */}
          <div className="flex items-center space-x-4 bg-stone-50 p-4 rounded-2xl border border-stone-200/80 w-full sm:w-auto">
            {/* Progress Circular Gauge */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-stone-200"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={163.3}
                  strokeDashoffset={163.3 - (163.3 * progressPercent) / 100}
                  className="text-amber-500 transition-all duration-700"
                  fill="transparent"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-stone-900">
                {progressPercent}%
              </div>
            </div>

            <div className="text-xs space-y-1">
              <div className="font-bold text-stone-900 flex items-center gap-1">
                <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
                <span>6-Day Streak</span>
              </div>
              <div className="text-stone-500">
                {completedCount}/{habits.length} Habits Done
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold">
                {progressPercent >= 50 ? "Strong momentum today!" : "Prime time to tackle keystone habits"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three Key Columns: Quick Vitality, Smart Scene, and Next in Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* A: Water & Energy Tracker */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Droplet className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  Hydration & Energy
                </span>
              </div>
              <button
                id="quick-log-water-btn"
                onClick={handleAddWater}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
              >
                + 1 Glass
              </button>
            </div>

            {/* Visual glasses */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-500 font-medium">
                <span>Intake Log</span>
                <span className="font-bold text-stone-900">{vitality.waterGlasses} / 8 glasses</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-3 rounded-full transition-all ${
                      i < vitality.waterGlasses
                        ? "bg-blue-500 shadow-2xs"
                        : "bg-stone-100 border border-stone-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Energy rating */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <div className="flex justify-between text-xs text-stone-500 font-medium">
                <span>Current Energy</span>
                <span className="font-bold text-stone-900">Level {vitality.energyLevel} / 5</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleEnergySelect(lvl)}
                    className={`py-1 text-xs font-bold rounded-lg transition-all ${
                      vitality.energyLevel === lvl
                        ? "bg-stone-900 text-white shadow-xs"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 mt-4 flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-stone-400" />
            <span>Refreshed daily vitality baseline</span>
          </div>
        </div>

        {/* B: Active Smart Home Atmosphere */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  Environment Scene
                </span>
              </div>
              <button
                onClick={() => setActiveTab("environment")}
                className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-0.5"
              >
                <span>Controls</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-stone-900">{activeScene.name}</span>
                <span className="text-[11px] text-stone-500 font-mono font-semibold">
                  {activeScene.temperatureF}°F
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                {activeScene.description}
              </p>
            </div>

            {/* Quick scene chips */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Quick Shift:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {scenes.slice(0, 4).map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => onSelectScene(sc)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeScene.id === sc.id
                        ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
                        : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {sc.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 mt-4 flex items-center justify-between">
            <span>Soundscape: <strong className="text-stone-600 capitalize">{activeScene.soundscape.replace("_", " ")}</strong></span>
            <span>Lumens: <strong className="text-stone-600">{activeScene.lightBrightness}%</strong></span>
          </div>
        </div>

        {/* C: Next in Daily Flow */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  Next in Daily Flow
                </span>
              </div>
              <button
                onClick={() => setActiveTab("schedule")}
                className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
              >
                <span>Full Flow</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {nextBlock ? (
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-800">
                    {nextBlock.startTime} – {nextBlock.endTime}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {nextBlock.energyRequired} energy
                  </span>
                </div>
                <h4 className="font-bold text-sm text-stone-900 mt-1.5">
                  {nextBlock.title}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 capitalize">
                  Category: {nextBlock.category}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-stone-50 text-xs text-stone-500 text-center">
                All scheduled blocks completed for today!
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab("assistant")}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Consult Aura AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 3. Today's Priority Habits Shelf */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              Today's Keystone Habits
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Check off your key micro-actions as you move through your day.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("habits")}
            className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1"
          >
            <span>Manage All Habits ({habits.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {habits.slice(0, 6).map((habit) => (
            <div
              key={habit.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                habit.completedToday
                  ? "bg-emerald-50/40 border-emerald-200/80"
                  : "bg-white border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <button
                  id={`dashboard-toggle-${habit.id}`}
                  onClick={() => onToggleHabit(habit.id)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                    habit.completedToday
                      ? "bg-emerald-600 text-white"
                      : "border border-stone-300 hover:border-stone-400 bg-white"
                  }`}
                >
                  {habit.completedToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="min-w-0">
                  <div
                    className={`text-xs font-semibold truncate ${
                      habit.completedToday ? "text-stone-400 line-through" : "text-stone-900"
                    }`}
                  >
                    {habit.title}
                  </div>
                  <div className="text-[11px] text-stone-400 flex items-center gap-2">
                    <span>{habit.category}</span>
                    <span>•</span>
                    <span>{habit.durationMinutes}m</span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/40 shrink-0 ml-2">
                {habit.streak}d streak
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. AI Daily Optimization Insight Card */}
      <div className="bg-linear-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 rounded-2xl p-6 border border-amber-200/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
              Aura's Daily Optimization Recommendation
            </span>
            <p className="text-xs text-stone-700 mt-1 max-w-2xl leading-relaxed">
              Based on your evening timeline, consider shifting your ambient lighting to <strong>Evening Wind-Down (2200K)</strong> 45 minutes before sleep to trigger natural melatonin release and lower resting heart rate.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("assistant")}
          className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs"
        >
          Chat with Aura
        </button>
      </div>
    </div>
  );
}
