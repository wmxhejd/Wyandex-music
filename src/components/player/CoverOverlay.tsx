import { SkipBack, SkipForward, Play, Pause, Heart, Repeat, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import YandexLyricsIcon from "./YandexLyricsIcon";
import MoreMenu, { ProviderItem } from "./MoreMenu";

interface CoverOverlayProps {
  isPlaying: boolean;
  repeat: boolean;
  trackIsLiked: boolean;
  hasLyrics: boolean;
  showLyricsColumn: boolean;
  title: string;
  artistNames: string;
  onPrev: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onLikeClick: (e: React.MouseEvent) => void;
  onRepeatToggle: () => void;
  onToggleLyricsColumn: () => void;
  onArtistClick?: () => void;
  lyricsMode: "karaoke" | "plain";
  onSetLyricsMode: (mode: "karaoke" | "plain") => void;
  hasSynced: boolean;
  hasPlain: boolean;
  providers: ProviderItem[];
  currentProvider: string;
  onSelectProvider: (source: string) => void;
}

export default function CoverOverlay({
  isPlaying,
  repeat,
  trackIsLiked,
  hasLyrics,
  showLyricsColumn,
  title,
  artistNames,
  onPrev,
  onPlayPause,
  onNext,
  onLikeClick,
  onRepeatToggle,
  onToggleLyricsColumn,
  onArtistClick,
  lyricsMode,
  onSetLyricsMode,
  hasSynced,
  hasPlain,
  providers,
  currentProvider,
  onSelectProvider,
}: CoverOverlayProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <div
    onMouseLeave={() => setShowMoreMenu(false)}
    className={`absolute inset-0 p-2.5 sm:p-4 flex flex-col justify-between select-none ${
      showMoreMenu
      ? "bg-black/95 backdrop-blur-md opacity-100"
      : "bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity duration-150"
    }`}
    >
    {showMoreMenu ? (
      <MoreMenu
      title={title}
      artistNames={artistNames}
      onArtistClick={onArtistClick}
      lyricsMode={lyricsMode}
      onSetLyricsMode={onSetLyricsMode}
      hasSynced={hasSynced}
      hasPlain={hasPlain}
      providers={providers}
      currentProvider={currentProvider}
      onSelectProvider={onSelectProvider}
      onClose={() => setShowMoreMenu(false)}
      />
    ) : (
      <>
      <div className="flex justify-end items-center">
      <button
      onClick={() => setShowMoreMenu(true)}
      className="w-8 h-8 sm:w-9 sm:h-9 aspect-square rounded-full bg-[#181822] hover:bg-[#20202c] text-white transition hover:scale-105 shadow-xl border border-white/20 flex items-center justify-center shrink-0"
      >
      <MoreHorizontal className="w-4 h-4 sm:w-4.5 sm:h-4.5 aspect-square shrink-0" />
      </button>
      </div>

      <div className="flex items-center justify-center space-x-3 sm:space-x-4">
      <button
      onClick={onPrev}
      className="w-9 h-9 sm:w-11 sm:h-11 aspect-square rounded-full bg-black/80 hover:bg-black text-white transition hover:scale-105 shadow-lg border border-white/10 flex items-center justify-center shrink-0"
      >
      <SkipBack className="w-4.5 h-4.5 sm:w-5 sm:h-5 aspect-square shrink-0" fill="currentColor" />
      </button>
      <button
      onClick={onPlayPause}
      className="w-12 h-12 sm:w-15 sm:h-15 aspect-square rounded-full bg-[#ffcc00] hover:scale-105 active:scale-95 text-black shadow-2xl transition flex items-center justify-center shrink-0"
      >
      {isPlaying ? (
        <Pause className="w-6 h-6 sm:w-7 sm:h-7 aspect-square shrink-0" fill="currentColor" />
      ) : (
        <Play className="w-6 h-6 sm:w-7 sm:h-7 aspect-square shrink-0 translate-x-0.5" fill="currentColor" />
      )}
      </button>
      <button
      onClick={onNext}
      className="w-9 h-9 sm:w-11 sm:h-11 aspect-square rounded-full bg-black/80 hover:bg-black text-white transition hover:scale-105 shadow-lg border border-white/10 flex items-center justify-center shrink-0"
      >
      <SkipForward className="w-4.5 h-4.5 sm:w-5 sm:h-5 aspect-square shrink-0" fill="currentColor" />
      </button>
      </div>

      <div className="flex items-center justify-between">
      <button
      onClick={onLikeClick}
      className="w-8 h-8 sm:w-9 sm:h-9 aspect-square rounded-full bg-black/80 hover:bg-black transition hover:scale-105 shadow-lg border border-white/10 flex items-center justify-center shrink-0"
      >
      <Heart
      className={`w-4 h-4 sm:w-4.5 sm:h-4.5 aspect-square shrink-0 ${trackIsLiked ? "fill-red-500 text-red-500" : "text-white"}`}
      />
      </button>

      <button
      disabled={!hasLyrics && !showLyricsColumn}
      onClick={onToggleLyricsColumn}
      className={`w-8 h-8 sm:w-9 sm:h-9 aspect-square rounded-full transition-all hover:scale-105 shadow-lg border flex items-center justify-center shrink-0 ${
        showLyricsColumn
        ? "bg-[#ffcc00] text-black border-[#ffcc00] shadow-[0_0_12px_rgba(255,204,0,0.4)]"
        : hasLyrics
        ? "bg-black/80 hover:bg-black text-white/90 hover:text-white border-white/10"
        : "bg-black/40 text-white/20 border-white/5 cursor-not-allowed"
      }`}
      >
      <YandexLyricsIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 aspect-square shrink-0" />
      </button>

      <button
      onClick={onRepeatToggle}
      className={`w-8 h-8 sm:w-9 sm:h-9 aspect-square rounded-full transition hover:scale-105 shadow-lg border border-white/10 flex items-center justify-center shrink-0 ${
        repeat
        ? "bg-primary/30 text-primary border-primary ring-2 ring-primary/40 shadow-[0_0_12px_rgba(255,204,0,0.4)]"
        : "bg-black/80 text-white/70 hover:text-white"
      }`}
      >
      <Repeat className="w-4 h-4 sm:w-4.5 sm:h-4.5 aspect-square shrink-0" />
      </button>
      </div>
      </>
    )}
    </div>
  );
}
