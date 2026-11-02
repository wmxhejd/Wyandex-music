import { Radio, Heart, ListMusic, History, Search, Settings as SettingsIcon } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: "search" | "wave" | "liked" | "playlists" | "history" | "settings") => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="absolute left-0 top-0 bottom-0 w-80 z-30 pointer-events-none flex flex-col justify-center select-none">
    <nav className="px-6 py-8 flex flex-col space-y-4 pointer-events-auto">
    <button
    type="button"
    onClick={() => onViewChange("search")}
    className={`group flex items-center space-x-4 py-2 px-3 rounded-2xl transition-all duration-300 translate-x-14 hover:translate-x-16 outline-none focus:outline-none focus-visible:outline-none ${
      currentView === "search" ? "text-white" : "text-white/40 hover:text-white"
    }`}
    >
    <div
    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
      currentView === "search"
      ? "text-[#ffcc00] drop-shadow-[0_0_16px_rgba(255,204,0,0.8)] scale-110"
      : "text-white/40 group-hover:text-white group-hover:scale-105"
    }`}
    >
    <Search size={22} strokeWidth={currentView === "search" ? 2.5 : 2} />
    </div>
    <span
    className={`text-sm tracking-wide transition-all ${
      currentView === "search"
      ? "font-extrabold text-white text-base drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
      : "font-semibold group-hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
    }`}
    >
    Поиск
    </span>
    </button>

    <button
    type="button"
    onClick={() => onViewChange("wave")}
    className={`group flex items-center space-x-4 py-2 px-3 rounded-2xl transition-all duration-300 translate-x-8 hover:translate-x-10 outline-none focus:outline-none focus-visible:outline-none ${
      currentView === "wave" ? "text-white" : "text-white/40 hover:text-white"
    }`}
    >
    <div
    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
      currentView === "wave"
      ? "text-[#ffcc00] drop-shadow-[0_0_16px_rgba(255,204,0,0.8)] scale-110"
      : "text-white/40 group-hover:text-white group-hover:scale-105"
    }`}
    >
    <Radio size={22} strokeWidth={currentView === "wave" ? 2.5 : 2} />
    </div>
    <span
    className={`text-sm tracking-wide transition-all ${
      currentView === "wave"
      ? "font-extrabold text-white text-base drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
      : "font-semibold group-hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
    }`}
    >
    Моя волна
    </span>
    </button>

    <button
    type="button"
    onClick={() => onViewChange("liked")}
    className={`group flex items-center space-x-4 py-2 px-3 rounded-2xl transition-all duration-300 translate-x-3 hover:translate-x-5 outline-none focus:outline-none focus-visible:outline-none ${
      currentView === "liked" ? "text-white" : "text-white/40 hover:text-white"
    }`}
    >
    <div
    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
      currentView === "liked"
      ? "text-[#ffcc00] drop-shadow-[0_0_16px_rgba(255,204,0,0.8)] scale-110"
      : "text-white/40 group-hover:text-white group-hover:scale-105"
    }`}
    >
    <Heart size={22} strokeWidth={currentView === "liked" ? 2.5 : 2} />
    </div>
    <span
    className={`text-sm tracking-wide transition-all ${
      currentView === "liked"
      ? "font-extrabold text-white text-base drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
      : "font-semibold group-hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
    }`}
    >
    Любимые треки
    </span>
    </button>

    <button
    type="button"
    onClick={() => onViewChange("playlists")}
    className={`group flex items-center space-x-4 py-2 px-3 rounded-2xl transition-all duration-300 translate-x-1 hover:translate-x-3 outline-none focus:outline-none focus-visible:outline-none ${
      currentView === "playlists" ? "text-white" : "text-white/40 hover:text-white"
    }`}
    >
    <div
    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
      currentView === "playlists"
      ? "text-[#ffcc00] drop-shadow-[0_0_16px_rgba(255,204,0,0.8)] scale-110"
      : "text-white/40 group-hover:text-white group-hover:scale-105"
    }`}
    >
    <ListMusic size={22} strokeWidth={currentView === "playlists" ? 2.5 : 2} />
    </div>
    <span
    className={`text-sm tracking-wide transition-all ${
      currentView === "playlists"
      ? "font-extrabold text-white text-base drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
      : "font-semibold group-hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
    }`}
    >
    Плейлисты
    </span>
    </button>

    <button
    type="button"
    onClick={() => onViewChange("history")}
    className={`group flex items-center space-x-4 py-2 px-3 rounded-2xl transition-all duration-300 translate-x-6 hover:translate-x-8 outline-none focus:outline-none focus-visible:outline-none ${
      currentView === "history" ? "text-white" : "text-white/40 hover:text-white"
    }`}
    >
    <div
    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
      currentView === "history"
      ? "text-[#ffcc00] drop-shadow-[0_0_16px_rgba(255,204,0,0.8)] scale-110"
      : "text-white/40 group-hover:text-white group-hover:scale-105"
    }`}
    >
    <History size={22} strokeWidth={currentView === "history" ? 2.5 : 2} />
    </div>
    <span
    className={`text-sm tracking-wide transition-all ${
      currentView === "history"
      ? "font-extrabold text-white text-base drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
      : "font-semibold group-hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
    }`}
    >
    История
    </span>
    </button>

    <button
    type="button"
    onClick={() => onViewChange("settings")}
    className={`group flex items-center space-x-4 py-2 px-3 rounded-2xl transition-all duration-300 translate-x-14 hover:translate-x-16 outline-none focus:outline-none focus-visible:outline-none ${
      currentView === "settings" ? "text-white" : "text-white/40 hover:text-white"
    }`}
    >
    <div
    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
      currentView === "settings"
      ? "text-[#ffcc00] drop-shadow-[0_0_16px_rgba(255,204,0,0.8)] scale-110"
      : "text-white/40 group-hover:text-white group-hover:scale-105"
    }`}
    >
    <SettingsIcon size={22} strokeWidth={currentView === "settings" ? 2.5 : 2} />
    </div>
    <span
    className={`text-sm tracking-wide transition-all ${
      currentView === "settings"
      ? "font-extrabold text-white text-base drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
      : "font-semibold group-hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
    }`}
    >
    Настройки
    </span>
    </button>
    </nav>
    </aside>
  );
}
