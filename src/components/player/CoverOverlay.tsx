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
    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-6 backdrop-blur-[2px]">
    <div className="flex justify-end items-center relative">
    <button
    onClick={() => setShowMoreMenu(!showMoreMenu)}
    className="w-10 h-10 rounded-full bg-[#181822] hover:bg-[#20202c] text-white transition hover:scale-110 shadow-xl border border-white/20 flex items-center justify-center flex-shrink-0"
    >
    <MoreHorizontal size={20} />
    </button>

    {showMoreMenu && (
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
      />
    )}
    </div>

    <div className="flex items-center justify-center space-x-6">
    <button
    onClick={onPrev}
    className="w-12 h-12 rounded-full bg-black/80 hover:bg-black text-white transition hover:scale-110 shadow-lg border border-white/10 flex items-center justify-center flex-shrink-0"
    >
    <SkipBack size={24} fill="currentColor" />
    </button>
    <button
    onClick={onPlayPause}
    className="w-16 h-16 rounded-full bg-[#ffcc00] hover:scale-110 active:scale-95 text-black shadow-2xl transition flex items-center justify-center flex-shrink-0"
    >
    {isPlaying ? (
      <Pause size={28} fill="currentColor" />
    ) : (
      <Play size={28} fill="currentColor" className="translate-x-0.5" />
    )}
    </button>
    <button
    onClick={onNext}
    className="w-12 h-12 rounded-full bg-black/80 hover:bg-black text-white transition hover:scale-110 shadow-lg border border-white/10 flex items-center justify-center flex-shrink-0"
    >
    <SkipForward size={24} fill="currentColor" />
    </button>
    </div>

    <div className="flex items-center justify-between">
    <button
    onClick={onLikeClick}
    className="w-10 h-10 rounded-full bg-black/80 hover:bg-black transition hover:scale-110 shadow-lg border border-white/10 flex items-center justify-center flex-shrink-0"
    >
    <Heart
    size={20}
    className={trackIsLiked ? "fill-red-500 text-red-500" : "text-white"}
    />
    </button>

    <button
    disabled={!hasLyrics && !showLyricsColumn}
    onClick={onToggleLyricsColumn}
    className={`w-11 h-11 rounded-full transition-all hover:scale-110 shadow-lg border flex items-center justify-center flex-shrink-0 ${
      showLyricsColumn
      ? "bg-[#ffcc00] text-black border-[#ffcc00] shadow-[0_0_15px_rgba(255,204,0,0.4)]"
      : hasLyrics
      ? "bg-black/80 hover:bg-black text-white/90 hover:text-white border-white/10"
      : "bg-black/40 text-white/20 border-white/5 cursor-not-allowed"
    }`}
    >
    <YandexLyricsIcon size={22} />
    </button>

    <button
    onClick={onRepeatToggle}
    className={`w-10 h-10 rounded-full transition hover:scale-110 shadow-lg border border-white/10 flex items-center justify-center flex-shrink-0 ${
      repeat
      ? "bg-primary/30 text-primary border-primary ring-2 ring-primary/40 shadow-[0_0_15px_rgba(255,204,0,0.4)]"
      : "bg-black/80 text-white/70 hover:text-white"
    }`}
    >
    <Repeat size={20} />
    </button>
    </div>
    </div>
  );
}
