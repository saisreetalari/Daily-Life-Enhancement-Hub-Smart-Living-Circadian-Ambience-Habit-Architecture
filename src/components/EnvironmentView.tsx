import { useState } from "react";
import { 
  Sun, 
  Zap, 
  Coffee, 
  Moon, 
  Leaf, 
  Lightbulb, 
  Thermometer, 
  Volume2, 
  Wind, 
  Check, 
  Power,
  Sliders,
  ShieldCheck,
  Radio
} from "lucide-react";
import { SmartHomeScene, SoundscapeType } from "../types";
import { soundscapeEngine } from "../utils/audioEngine";

interface EnvironmentViewProps {
  activeScene: SmartHomeScene;
  scenes: SmartHomeScene[];
  onSelectScene: (scene: SmartHomeScene) => void;
  onUpdateActiveScene: (partial: Partial<SmartHomeScene>) => void;
}

export function EnvironmentView({
  activeScene,
  scenes,
  onSelectScene,
  onUpdateActiveScene,
}: EnvironmentViewProps) {
  const [powerOn, setPowerOn] = useState(true);
  const [currentSound, setCurrentSound] = useState<SoundscapeType>(activeScene.soundscape);
  const [soundVolume, setSoundVolume] = useState(0.4);

  const sceneIcons: Record<string, any> = {
    Sun,
    Zap,
    Coffee,
    Moon,
    Leaf,
  };

  const handleSceneClick = (sc: SmartHomeScene) => {
    onSelectScene(sc);
    setCurrentSound(sc.soundscape);
    if (sc.soundscape !== "none" && powerOn) {
      soundscapeEngine.play(sc.soundscape);
    } else {
      soundscapeEngine.stop();
    }
  };

  const handleSoundscapeChange = (type: SoundscapeType) => {
    setCurrentSound(type);
    onUpdateActiveScene({ soundscape: type });
    if (type === "none") {
      soundscapeEngine.stop();
    } else {
      soundscapeEngine.play(type);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setSoundVolume(vol);
    soundscapeEngine.setVolume(vol);
  };

  // Convert Color Temp (Kelvin) to warm/cool display color
  const getTempColorStyle = (kelvin: number) => {
    if (kelvin <= 2400) return "#FF9A3C";
    if (kelvin <= 3200) return "#FFB86C";
    if (kelvin <= 4500) return "#FFF2D6";
    if (kelvin <= 5500) return "#F8FAFC";
    return "#E0F2FE";
  };

  return (
    <div className="space-y-6">
      {/* Header card with current room atmosphere visual */}
      <div 
        className="rounded-3xl p-6 sm:p-8 border border-stone-200 transition-all relative overflow-hidden shadow-xs"
        style={{
          backgroundColor: powerOn ? "#FFFFFF" : "#F8FAFC",
        }}
      >
        {/* Glow backdrop simulating lighting warmth */}
        {powerOn && (
          <div 
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
            style={{
              backgroundColor: getTempColorStyle(activeScene.lightTempK),
            }}
          />
        )}

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Active Living Environment
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {activeScene.temperatureF}°F • {activeScene.lightBrightness}% Lumens • {activeScene.lightTempK}K
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2 tracking-tight">
              {activeScene.name}
            </h2>
            <p className="text-stone-600 text-sm max-w-xl mt-1 leading-relaxed">
              {activeScene.description}
            </p>
          </div>

          {/* Master power & quick metrics */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="px-4 py-2 bg-stone-50 rounded-2xl border border-stone-200 text-center">
              <span className="text-[10px] text-stone-400 font-semibold uppercase block">Indoor Air</span>
              <span className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> AQI 24
              </span>
            </div>

            <div className="px-4 py-2 bg-stone-50 rounded-2xl border border-stone-200 text-center">
              <span className="text-[10px] text-stone-400 font-semibold uppercase block">Humidity</span>
              <span className="text-sm font-bold text-stone-700">46%</span>
            </div>

            <button
              id="power-toggle-btn"
              onClick={() => setPowerOn(!powerOn)}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-semibold ${
                powerOn
                  ? "bg-stone-900 text-white border-stone-800 shadow-xs"
                  : "bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200"
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{powerOn ? "System On" : "Standby"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Scenes Shelf */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-stone-900 tracking-wide flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-600" />
          One-Touch Circadian & Routine Scenes
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {scenes.map((scene) => {
            const Icon = sceneIcons[scene.iconName] || Sun;
            const isSelected = activeScene.id === scene.id;
            return (
              <button
                key={scene.id}
                id={`scene-btn-${scene.id}`}
                onClick={() => handleSceneClick(scene)}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? "bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20"
                    : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="font-bold text-xs text-stone-900">{scene.name}</div>
                <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                  {scene.temperatureF}°F • {scene.soundscape.replace("_", " ")}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fine-Grained Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Smart Lighting Control */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Circadian Lighting</h4>
                <p className="text-[11px] text-stone-400">Dimming & color warmth</p>
              </div>
            </div>
            <div 
              className="w-4 h-4 rounded-full border border-stone-300 shadow-inner"
              style={{ backgroundColor: getTempColorStyle(activeScene.lightTempK) }}
            />
          </div>

          {/* Brightness slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-stone-600">
              <span>Illumination</span>
              <span>{activeScene.lightBrightness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={activeScene.lightBrightness}
              onChange={(e) => onUpdateActiveScene({ lightBrightness: Number(e.target.value) })}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {/* Color Temperature (Kelvin) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-stone-600">
              <span>Color Temperature</span>
              <span>{activeScene.lightTempK}K ({activeScene.lightTempK <= 3000 ? "Warm Amber" : activeScene.lightTempK <= 4800 ? "Natural" : "Crisp Daylight"})</span>
            </div>
            <input
              type="range"
              min="2200"
              max="6500"
              step="100"
              value={activeScene.lightTempK}
              onChange={(e) => onUpdateActiveScene({ lightTempK: Number(e.target.value) })}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 pt-0.5">
              <span>2200K (Candle)</span>
              <span>4200K (Office)</span>
              <span>6500K (Sky)</span>
            </div>
          </div>
        </div>

        {/* 2. Climate & Thermostat */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Climate & Air</h4>
                <p className="text-[11px] text-stone-400">Sleep & focus optimal curves</p>
              </div>
            </div>
            <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
              Living Room
            </span>
          </div>

          {/* Stepper for Temperature */}
          <div className="flex items-center justify-center space-x-6 py-2">
            <button
              onClick={() => onUpdateActiveScene({ temperatureF: Math.max(60, activeScene.temperatureF - 1) })}
              className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-lg flex items-center justify-center transition-colors"
            >
              -
            </button>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
                {activeScene.temperatureF}°<span className="text-stone-400 text-base font-normal">F</span>
              </div>
              <span className="text-[10px] text-stone-500 font-medium">
                {activeScene.temperatureF <= 68 ? "Optimal Sleep & Focus" : "Comfort Lounge"}
              </span>
            </div>
            <button
              onClick={() => onUpdateActiveScene({ temperatureF: Math.min(82, activeScene.temperatureF + 1) })}
              className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-lg flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>

          {/* Air purifier speed buttons */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-stone-600 block">HEPA Air Purifier</span>
            <div className="grid grid-cols-3 gap-2">
              {(["quiet", "auto", "turbo"] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => onUpdateActiveScene({ airPurifierSpeed: spd })}
                  className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                    activeScene.airPurifierSpeed === spd
                      ? "bg-stone-900 text-white shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Ambient Procedural Soundscape Synthesizer */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Audio Ambience</h4>
                <p className="text-[11px] text-stone-400">Web Audio synthesis (zero lag)</p>
              </div>
            </div>
            {currentSound !== "none" && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>

          {/* Sound choice buttons */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "alpha_waves", label: "Alpha Waves (10Hz)" },
              { id: "rain", label: "Gentle Rainfall" },
              { id: "fireplace", label: "Warm Fireplace" },
              { id: "birds", label: "Morning Birds" },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => handleSoundscapeChange(snd.id as SoundscapeType)}
                className={`p-2 rounded-xl text-xs font-semibold text-left transition-all border ${
                  currentSound === snd.id
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs"
                    : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleSoundscapeChange("none")}
            className={`w-full py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              currentSound === "none"
                ? "bg-stone-200 text-stone-800 border-stone-300"
                : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
            }`}
          >
            Mute Ambient Audio
          </button>

          {/* Volume slider */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] font-semibold text-stone-500">
              <span>Soundscape Volume</span>
              <span>{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
