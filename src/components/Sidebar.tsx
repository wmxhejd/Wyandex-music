import { Radio, Heart, ListMusic, LogOut, Search, X } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: "wave" | "liked" | "playlists") => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
}

export default function Sidebar({ currentView, onViewChange, onLogout, onSearch }: SidebarProps) {
  const [searchInput, setSearchInput] = useState("");

  const menuItems = [
    { id: "wave", label: "Моя волна", icon: Radio },
    { id: "liked", label: "Любимые треки", icon: Heart },
    { id: "playlists", label: "Плейлисты", icon: ListMusic },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    onSearch("");
  };

  return (
    <aside className="w-64 bg-[#0a0a0e] border-r border-white/[0.06] flex flex-col flex-shrink-0">
      <div data-tauri-drag-region className="p-4 border-b border-white/[0.06] flex items-center space-x-3 select-none">
        <img src="/icon.svg" alt="Logo" className="w-7 h-7 object-contain pointer-events-none" />
        <div data-tauri-drag-region className="min-w-0 pointer-events-none">
          <h1 className="text-sm font-bold text-white truncate leading-tight">Wyandexmusic</h1>
          <p className="text-[10px] text-[var(--text-secondary)] leading-none mt-0.5">Desktop Player</p>
        </div>
      </div>

      <div className="p-3 border-b border-white/[0.06]">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Поиск музыки..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-9 py-2 text-sm text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-white/20 transition"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-white transition"
            >
              <X size={14} />
            </button>
          )}
        </form>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#ffcc00] text-black shadow-lg shadow-[#ffcc00]/10 font-semibold"
                  : "text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={16} />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
}
