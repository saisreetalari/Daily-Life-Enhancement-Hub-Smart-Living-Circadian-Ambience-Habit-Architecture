import { useState, useEffect } from "react";
import { 
  Sparkles, 
  CheckSquare, 
  Home, 
  Clock, 
  Bot, 
  Volume2, 
  VolumeX, 
  Flame,
  Sun
} from "lucide-react";
import { ActiveTab, SmartHomeScene } from "../types";
import { soundscapeEngine } from "../utils/audioEngine";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeScene: SmartHomeScene;
  completedCount: number;
  totalHabitsCount: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  activeScene,
  completedCount,
  totalHabitsCount,
}: NavbarProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSoundscape = () => {
    if (isPlayingAudio) {
      soundscapeEngine.stop();
      setIsPlayingAudio(false);
    } else {
      soundscapeEngine.play(activeScene.soundscape !== "none" ? activeScene.soundscape : "alpha_waves");
      setIsPlayingAudio(true);
    }
  };

  // Sync audio state check
  useEffect(() => {
    const checkAudio = () => {
      setIsPlayingAudio(soundscapeEngine.isSoundPlaying());
    };
    const timer = setInterval(checkAudio, 500);
    return () => clearInterval(timer);
  }, []);

  const tabs: { id: ActiveTab; label: string; icon: any; badge?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: Sparkles },
    { 
      id: "habits", 
      label: "Habits", 
      icon: CheckSquare,
      badge: `${completedCount}/${totalHabitsCount}`
    },
    { id: "environment", label: "Smart Home", icon: Home },
    { id: "schedule", label: "Daily Flow", icon: Clock },
    { id: "assistant", label: "Aura AI", icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Live status */}
          <div className="flex items-center space-x-3">
            <div 
              id="brand-logo"
              className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shadow-xs"
            >
              <Sun className="w-5 h-5 text-amber-600 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-stone-900 text-lg tracking-tight">
                  Daily Life Hub
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Live
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Smart living, habits & environmental optimization
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-stone-100/80 p-1 rounded-xl border border-stone-200/70">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-stone-900 shadow-xs border border-stone-200/80"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-600" : "text-stone-500"}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-amber-100 text-amber-800"
                          : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar: Clock, Soundscape Toggle, Habit Flame */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick soundscape player button */}
            <button
              id="soundscape-toggle-btn"
              onClick={toggleSoundscape}
              title={isPlayingAudio ? "Mute ambient soundscape" : "Play ambient soundscape"}
              className={`p-2 rounded-lg border transition-all flex items-center space-x-1.5 text-xs font-medium ${
                isPlayingAudio
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-800"
                  : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Volume2 className="w-4 h-4 text-amber-600 animate-bounce" />
                  <span className="hidden lg:inline capitalize">
                    {soundscapeEngine.getCurrentType().replace("_", " ")}
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-stone-400" />
                  <span className="hidden lg:inline">Ambience</span>
                </>
              )}
            </button>

            {/* Streak Counter */}
            <div 
              id="header-streak-badge"
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold"
              title="Consecutive daily enhancement streak"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Day 6</span>
            </div>

            {/* Time Clock */}
            <div 
              id="header-clock"
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 bg-stone-100 border border-stone-200 rounded-lg text-stone-700 text-xs font-mono font-medium"
            >
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{currentTime}</span>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-1 border-t border-stone-100 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={`mobile-${tab.id}`}
                id={`mobile-nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? "bg-amber-600 text-white font-semibold shadow-xs"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
