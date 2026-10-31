import { User, Copy, Check, Radio, FileText, Mic2 } from "lucide-react";
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
}: MoreMenuProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${artistNames} - ${title}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute right-0 top-14 w-64 glass-strong border border-white/20 rounded-2xl p-2.5 shadow-2xl text-left z-30 animate-in fade-in zoom-in-95 space-y-1">
      <div className="pb-1.5 border-b border-white/10">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] px-3 py-1">
          Режим текста
        </p>
        <div className="flex gap-1 p-0.5 bg-white/5 rounded-xl">
          <button
            disabled={!hasSynced}
            onClick={() => onSetLyricsMode("karaoke")}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              !hasSynced
                ? "text-white/20 cursor-not-allowed"
                : lyricsMode === "karaoke"
                ? "bg-[#ffcc00] text-black shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Mic2 size={13} />
            <span>Караоке</span>
          </button>
          <button
            disabled={!hasPlain}
            onClick={() => onSetLyricsMode("plain")}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              !hasPlain
                ? "text-white/20 cursor-not-allowed"
                : lyricsMode === "plain"
                ? "bg-[#ffcc00] text-black shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            <FileText size={13} />
            <span>Текст</span>
          </button>
        </div>
      </div>

      {providers.length > 0 && (
        <div className="pb-1.5 border-b border-white/10">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] px-3 py-1">
            Источник текста
          </p>
          <div className="space-y-0.5">
            {providers.map((p) => {
              const isSelected = currentProvider === p.source;
              return (
                <button
                  key={p.source}
                  onClick={() => onSelectProvider(p.source)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                    isSelected ? "text-[#ffcc00] font-semibold bg-white/5" : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {isSelected && <Radio size={12} className="text-[#ffcc00] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-0.5">
        {onArtistClick && (
          <button
            onClick={onArtistClick}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-white transition"
          >
            <User size={15} />
            <span className="truncate">К исполнителю</span>
          </button>
        )}
        <button
          onClick={handleCopy}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-white transition"
        >
          {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
          <span>{copied ? "Скопировано!" : "Копировать название"}</span>
        </button>
      </div>
    </div>
  );
}
