import { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Plus, 
  Check, 
  Zap,
  Coffee,
  Moon,
  Droplet
} from "lucide-react";
import { AssistantMessage, Habit, SmartHomeScene } from "../types";

interface AssistantViewProps {
  habits: Habit[];
  activeScene: SmartHomeScene;
  energyLevel: number;
  waterGlasses: number;
  onAddHabit: (habit: Omit<Habit, "id" | "streak" | "completedToday" | "history">) => void;
}

export function AssistantView({
  habits,
  activeScene,
  energyLevel,
  waterGlasses,
  onAddHabit,
}: AssistantViewProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "Hello! I am Aura, your Daily Life Enhancement companion. I can help you tailor your daily habits, troubleshoot fatigue, design calm evening wind-downs, or suggest balanced meals and circadian environmental settings. What can we optimize today?",
      timestamp: "Just now",
      source: "gemini-3.8-flash",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedSuggestions, setAddedSuggestions] = useState<Record<string, boolean>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const completedCount = habits.filter((h) => h.completedToday).length;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (userPrompt?: string) => {
    const textToSend = userPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userPrompt) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          context: {
            timeOfDay: new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening",
            activeScene: activeScene.name,
            completedHabitsCount: completedCount,
            totalHabitsCount: habits.length,
            energyLevel,
            waterCups: waterGlasses,
            habitsSummary: habits.map((h) => `${h.title} (${h.completedToday ? "Done" : "Pending"})`),
          },
        }),
      });

      const data = await res.json();
      const reply = data.reply || "I'm here to help you structure your day.";

      // Extract habit suggestion if present
      let suggestedHabit: AssistantMessage["suggestedHabit"] = undefined;
      if (reply.toLowerCase().includes("habit") && (reply.includes("•") || reply.includes("- "))) {
        suggestedHabit = {
          title: "Circadian Energy Reset",
          category: "Health",
          timeOfDay: "afternoon",
          durationMinutes: 5,
          impactDescription: "Suggested by Aura to combat mid-day energy dips.",
        };
      }

      const botMsg: AssistantMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: data.source || "gemini-3.8-flash",
        suggestedHabit,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "assistant",
          text: "I encountered a minor connection hiccup. However, here is a golden daily rule: anchor your most demanding focus sprint to your highest-energy biological window!",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: "Wind-down routine", icon: Moon, prompt: "Help me design a restful 20-minute evening wind-down routine to fall asleep faster." },
    { label: "Fix 3pm energy slump", icon: Zap, prompt: "I often feel a heavy fatigue crash around 3 PM. How should I adjust my routine and environment?" },
    { label: "15-min quick lunch", icon: Coffee, prompt: "Suggest a fast, nutritious 15-minute lunch recipe with pantry staples that won't cause brain fog." },
    { label: "Hydration habit strategy", icon: Droplet, prompt: "How can I easily stay hydrated throughout the day without having to constantly remind myself?" },
  ];

  const handleAddSuggested = (id: string, habit: any) => {
    onAddHabit(habit);
    setAddedSuggestions((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col h-[78vh] overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shadow-xs">
            <Bot className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-stone-900 text-sm">Aura Life Assistant</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Personalized routines, habit coaching & circadian environment advisor
            </p>
          </div>
        </div>

        {/* Live Context indicator */}
        <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-stone-500 bg-white px-3 py-1.5 rounded-xl border border-stone-200">
          <span>Habits: {completedCount}/{habits.length}</span>
          <span>•</span>
          <span>Energy: {energyLevel}/5</span>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === "user"
                  ? "bg-stone-900 text-white"
                  : "bg-amber-500/10 text-amber-700 border border-amber-500/20"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-stone-900 text-white shadow-xs rounded-tr-xs"
                  : "bg-stone-50 text-stone-800 border border-stone-200 shadow-xs rounded-tl-xs"
              }`}
            >
              <div className="whitespace-pre-line text-sm">{msg.text}</div>

              {msg.suggestedHabit && (
                <div className="mt-3 pt-3 border-t border-stone-200/80 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-stone-900 block">
                      {msg.suggestedHabit.title}
                    </span>
                    <span className="text-stone-500 text-[11px]">
                      {msg.suggestedHabit.durationMinutes}m • {msg.suggestedHabit.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddSuggested(msg.id, msg.suggestedHabit)}
                    disabled={addedSuggestions[msg.id]}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      addedSuggestions[msg.id]
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-stone-900 text-white hover:bg-stone-800"
                    }`}
                  >
                    {addedSuggestions[msg.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add Habit
                      </>
                    )}
                  </button>
                </div>
              )}

              <div
                className={`text-[10px] mt-2 font-mono ${
                  msg.sender === "user" ? "text-stone-400 text-right" : "text-stone-400"
                }`}
              >
                {msg.timestamp} {msg.source && `• ${msg.source}`}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs text-stone-500 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 font-medium">Aura is reasoning over your daily context...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-stone-100 bg-stone-50/70 overflow-x-auto flex gap-2 no-scrollbar">
        {quickPrompts.map((qp, i) => {
          const Icon = qp.icon;
          return (
            <button
              key={i}
              onClick={() => handleSend(qp.prompt)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:border-stone-300 text-xs font-medium whitespace-nowrap transition-all shadow-2xs"
            >
              <Icon className="w-3 h-3 text-amber-600" />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-stone-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Aura for daily routines, stress relief, nutrition tips, habit fixes..."
            className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
