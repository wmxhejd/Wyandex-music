import { Radio, Heart, ListMusic, History, Search, Settings as SettingsIcon } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: "search" | "wave" | "liked" | "playlists" | "history" | "settings") => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const items = [
    { key: "search", label: "Поиск", icon: Search, curve: "translate-x-14 hover:translate-x-16" },
    { key: "wave", label: "Моя волна", icon: Radio, curve: "translate-x-8 hover:translate-x-10" },
    { key: "liked", label: "Любимые треки", icon: Heart, curve: "translate-x-3 hover:translate-x-5" },
    { key: "playlists", label: "Плейлисты", icon: ListMusic, curve: "translate-x-1 hover:translate-x-3" },
    { key: "history", label: "История", icon: History, curve: "translate-x-6 hover:translate-x-8" },
    { key: "settings", label: "Настройки", icon: SettingsIcon, curve: "translate-x-14 hover:translate-x-16" },
  ] as const;

  return (
    <aside className="w-64 sm:w-72 md:w-80 h-full flex-shrink-0 z-30 flex flex-col justify-center select-none pointer-events-none">
    <nav className="px-4 py-6 flex flex-col space-y-3 sm:space-y-4 pointer-events-auto">
    {items.map((item) => {
      const Icon = item.icon;
      const isActive = currentView === item.key;
      return (
        <button
        key={item.key}
        type="button"
        onClick={() => onViewChange(item.key)}
        className={`group flex items-center space-x-3 py-2 px-3 rounded-2xl transition-all duration-300 outline-none w-max ${item.curve} ${
          isActive ? "text-white" : "text-white/40 hover:text-white"
        }`}
        >
        <div
        className={`w-10 h-10 aspect-square rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
          isActive
          ? "text-[#ffcc00] drop-shadow-[0_0_16px_rgba(255,204,0,0.8)] scale-110"
          : "text-white/40 group-hover:text-white group-hover:scale-105"
        }`}
        >
        <Icon className="w-5 h-5 aspect-square shrink-0" strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span
        className={`text-sm tracking-wide transition-all ${
          isActive
          ? "font-extrabold text-white text-base drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
          : "font-semibold group-hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        }`}
        >
        {item.label}
        </span>
        </button>
      );
    })}
    </nav>
    </aside>
  );
}
