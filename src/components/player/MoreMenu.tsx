import { User, Copy, Check, Radio, X } from "lucide-react";
import { useState } from "react";

export interface ProviderItem {
  source: string;
  name: string;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

interface MoreMenuProps {
  title: string;
  artistNames: string;
  onArtistClick?: () => void;
  lyricsMode: "karaoke" | "plain";
  onSetLyricsMode: (mode: "karaoke" | "plain") => void;
  hasSynced: boolean;
  hasPlain: boolean;
  providers: ProviderItem[];
  currentProvider: string;
  onSelectProvider: (source: string) => void;
  onClose: () => void;
}

export default function MoreMenu({
  title,
  artistNames,
  onArtistClick,
  lyricsMode,
  onSetLyricsMode,
  hasSynced,
  hasPlain,
  providers,
  currentProvider,
  onSelectProvider,
  onClose,
}: MoreMenuProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${artistNames} - ${title}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col p-2.5 sm:p-3 select-none text-white overflow-hidden">
    <div className="flex items-center justify-between pb-1.5 border-b border-white/20 shrink-0">
    <span className="text-[0.7rem] sm:text-xs font-bold text-white">Опции трека</span>
    <button
    onClick={onClose}
    className="w-5 h-5 aspect-square rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center shrink-0 transition"
    >
    <X className="w-3 h-3 aspect-square shrink-0" />
    </button>
    </div>

    <div className="flex-1 min-h-0 overflow-y-auto space-y-2 py-1.5 pr-0.5">
    <div className="space-y-1">
    <span className="text-[0.65rem] sm:text-[0.75rem] uppercase tracking-wider text-white/60 font-semibold block px-0.5">
    Режим текста
    </span>
    <div className="flex p-0.5 bg-black/60 rounded-lg border border-white/15 shadow-inner">
    <button
    disabled={!hasSynced}
    onClick={() => onSetLyricsMode("karaoke")}
    className={`flex-1 py-1 rounded text-[0.7rem] sm:text-xs font-semibold transition text-center truncate ${
      !hasSynced
      ? "text-white/25 cursor-not-allowed"
      : lyricsMode === "karaoke"
      ? "bg-[#ffcc00] text-black shadow-md font-bold"
      : "text-white/70 hover:text-white"
    }`}
    >
    Караоке
    </button>
    <button
    disabled={!hasPlain}
    onClick={() => onSetLyricsMode("plain")}
    className={`flex-1 py-1 rounded text-[0.7rem] sm:text-xs font-semibold transition text-center truncate ${
      !hasPlain
      ? "text-white/25 cursor-not-allowed"
      : lyricsMode === "plain"
      ? "bg-[#ffcc00] text-black shadow-md font-bold"
      : "text-white/70 hover:text-white"
    }`}
    >
    Текст
    </button>
    </div>
    </div>

    {providers.length > 0 && (
      <div className="space-y-1">
      <span className="text-[0.65rem] sm:text-[0.75rem] uppercase tracking-wider text-white/60 font-semibold block px-0.5">
      Источник
      </span>
      <div className="space-y-0.5">
      {providers.map((p) => {
        const isSelected = currentProvider === p.source;
        return (
          <button
          key={p.source}
          onClick={() => onSelectProvider(p.source)}
          className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[0.7rem] sm:text-xs transition ${
            isSelected ? "text-[#ffcc00] bg-white/15 font-semibold" : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
          >
          <span className="truncate mr-1">{p.name}</span>
          {isSelected && <Radio className="w-2.5 h-2.5 aspect-square text-[#ffcc00] shrink-0" />}
          </button>
        );
      })}
      </div>
      </div>
    )}

    <div className="space-y-0.5 pt-1.5 border-t border-white/15">
    {onArtistClick && (
      <button
      onClick={() => {
        onClose();
        onArtistClick();
      }}
      className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-white/15 text-[0.7rem] sm:text-xs text-white/90 hover:text-white transition font-medium"
      >
      <User className="w-3 h-3 aspect-square shrink-0 text-white/60" />
      <span className="truncate">К исполнителю</span>
      </button>
    )}
    <button
    onClick={handleCopy}
    className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-white/15 text-[0.7rem] sm:text-xs text-white/90 hover:text-white transition font-medium"
    >
    {copied ? (
      <Check className="w-3 h-3 aspect-square text-green-400 shrink-0" />
    ) : (
      <Copy className="w-3 h-3 aspect-square shrink-0 text-white/60" />
    )}
    <span className="truncate">{copied ? "Скопировано!" : "Копировать название"}</span>
    </button>
    </div>
    </div>
    </div>
  );
}
