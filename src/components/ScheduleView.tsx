import { useState } from "react";
import { 
  Clock, 
  Plus, 
  Check, 
  Trash2, 
  Sparkles, 
  Zap, 
  Briefcase, 
  Smile, 
  Moon, 
  Calendar 
} from "lucide-react";
import { ScheduleBlock } from "../types";

interface ScheduleViewProps {
  schedule: ScheduleBlock[];
  onToggleBlock: (id: string) => void;
  onAddBlock: (block: Omit<ScheduleBlock, "id" | "completed">) => void;
  onDeleteBlock: (id: string) => void;
}

export function ScheduleView({
  schedule,
  onToggleBlock,
  onAddBlock,
  onDeleteBlock,
}: ScheduleViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStart, setNewStart] = useState("14:00");
  const [newEnd, setNewEnd] = useState("15:00");
  const [newCategory, setNewCategory] = useState<ScheduleBlock["category"]>("work");
  const [newEnergy, setNewEnergy] = useState<ScheduleBlock["energyRequired"]>("medium");

  const categoryBadges: Record<ScheduleBlock["category"], { label: string; icon: any; color: string }> = {
    work: { label: "Deep Work", icon: Briefcase, color: "bg-blue-50 text-blue-700 border-blue-200" },
    wellness: { label: "Wellness & Body", icon: Smile, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    home: { label: "Home & Life", icon: Calendar, color: "bg-amber-50 text-amber-700 border-amber-200" },
    rest: { label: "Rest & Sleep", icon: Moon, color: "bg-purple-50 text-purple-700 border-purple-200" },
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddBlock({
      title: newTitle.trim(),
      startTime: newStart,
      endTime: newEnd,
      category: newCategory,
      energyRequired: newEnergy,
    });

    setNewTitle("");
    setIsAddOpen(false);
  };

  const sortedSchedule = [...schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Daily Flow & Energy Time-Blocking
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Harmonize high-focus cognitive blocks with low-energy restorative pauses.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Time Block</span>
        </button>
      </div>

      {/* Timeline view */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
        <div className="relative border-l-2 border-stone-200 ml-4 pl-6 space-y-6">
          {sortedSchedule.map((block) => {
            const badge = categoryBadges[block.category];
            const Icon = badge.icon;
            return (
              <div
                key={block.id}
                id={`block-${block.id}`}
                className={`relative group p-4 rounded-xl border transition-all ${
                  block.completed
                    ? "bg-stone-50/70 border-stone-200 opacity-60"
                    : "bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs"
                }`}
              >
                {/* Timeline node dot */}
                <div
                  className={`absolute -left-[33px] top-5 w-4 h-4 rounded-full border-2 bg-white transition-all ${
                    block.completed
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-stone-400 group-hover:border-amber-500"
                  }`}
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => onToggleBlock(block.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        block.completed
                          ? "bg-emerald-600 text-white"
                          : "border border-stone-300 hover:border-stone-500"
                      }`}
                    >
                      {block.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-stone-500">
                          {block.startTime} – {block.endTime}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}
                        >
                          <Icon className="w-2.5 h-2.5 inline mr-1" />
                          {badge.label}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            block.energyRequired === "high"
                              ? "bg-rose-50 text-rose-700"
                              : block.energyRequired === "medium"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          <Zap className="w-2.5 h-2.5 inline mr-0.5" />
                          {block.energyRequired} energy
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-semibold mt-1 ${
                          block.completed ? "text-stone-400 line-through" : "text-stone-900"
                        }`}
                      >
                        {block.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteBlock(block.id)}
                    className="text-stone-300 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl p-6">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Add Schedule Block</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Activity Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Focused Coding or Walk"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                  >
                    <option value="work">Deep Work</option>
                    <option value="wellness">Wellness & Body</option>
                    <option value="home">Home & Life</option>
                    <option value="rest">Rest & Sleep</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Energy Level
                  </label>
                  <select
                    value={newEnergy}
                    onChange={(e) => setNewEnergy(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                  >
                    <option value="high">High Energy</option>
                    <option value="medium">Medium Energy</option>
                    <option value="low">Low / Recovery</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800"
                >
                  Save Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
