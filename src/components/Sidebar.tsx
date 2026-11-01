import { Radio, Heart, ListMusic, Search, Settings } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: "search" | "wave" | "liked" | "playlists" | "settings") => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    {
      id: "search",
      label: "Поиск",
      icon: Search,
      offset: "translate-x-14 hover:translate-x-16",
    },
    {
      id: "wave",
      label: "Моя волна",
      icon: Radio,
      offset: "translate-x-7 hover:translate-x-9",
    },
    {
      id: "liked",
      label: "Любимые треки",
      icon: Heart,
      offset: "translate-x-2 hover:translate-x-4",
    },
    {
      id: "playlists",
      label: "Плейлисты",
      icon: ListMusic,
      offset: "translate-x-7 hover:translate-x-9",
    },
    {
      id: "settings",
      label: "Настройки",
      icon: Settings,
      offset: "translate-x-14 hover:translate-x-16",
    },
  ];

  return (
    <aside className="absolute left-0 top-0 bottom-0 w-80 z-30 pointer-events-none flex flex-col justify-center select-none">
    <nav className="px-6 py-10 flex flex-col space-y-6 pointer-events-auto">
    {menuItems.map((item) => {
      const Icon = item.icon;
      const isActive = currentView === item.id;

      return (
        <div key={item.id} className="transition-transform duration-300 ease-out">
        <button
        onClick={() => onViewChange(item.id as any)}
        className={`group flex items-center space-x-4 py-2.5 px-3 rounded-2xl transition-all duration-300 ${item.offset} ${
          isActive ? "text-white" : "text-white/40 hover:text-white"
        }`}
        >
        <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isActive
          ? "text-[#ffcc00] drop-shadow-[0_0_16px_rgba(255,204,0,0.8)] scale-110"
          : "text-white/40 group-hover:text-white group-hover:scale-105"
        }`}
        >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
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
        </div>
      );
    })}
    </nav>
    </aside>
  );
}
