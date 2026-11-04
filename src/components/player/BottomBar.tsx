import { Heart, Maximize2, FileText, Mic2 } from "lucide-react";
import PlaybackControls from "./PlaybackControls";
import ProgressBar from "./ProgressBar";
import VolumeSlider from "./VolumeSlider";

interface BottomBarProps {
  title: string;
  artistNames: string;
  coverUrl?: string;
  trackIsLiked: boolean;
  isPlaying: boolean;
  loading: boolean;
  repeat: boolean;
  shuffle: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  hasPlain: boolean;
  hasSynced: boolean;
  isDraggingRef: React.MutableRefObject<boolean>;
  onExpand: () => void;
  onArtistClick?: () => void;
  onLikeClick: (e: React.MouseEvent) => void;
  onShuffleToggle: () => void;
  onPrev: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onRepeatToggle: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenPlainLyrics: () => void;
  onOpenKaraokeLyrics: () => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BottomBar({
  title,
  artistNames,
  coverUrl,
  trackIsLiked,
  isPlaying,
  loading,
  repeat,
  shuffle,
  currentTime,
  duration,
  volume,
  hasPlain,
  hasSynced,
  isDraggingRef,
  onExpand,
  onArtistClick,
  onLikeClick,
  onShuffleToggle,
  onPrev,
  onPlayPause,
  onNext,
  onRepeatToggle,
  onSeek,
  onOpenPlainLyrics,
  onOpenKaraokeLyrics,
  onVolumeChange,
}: BottomBarProps) {
  return (
    <div className="bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md border-t border-white/[0.05] transition-colors select-none">
    <div className="px-3 sm:px-6 py-2.5 sm:py-3">
    <div className="flex items-center justify-between space-x-2 sm:space-x-4">
    <div className="flex items-center space-x-2.5 sm:space-x-3 flex-1 min-w-0 max-w-[30%]">
    <div
    onClick={onExpand}
    className="relative group cursor-pointer shrink-0"
    >
    {coverUrl ? (
      <img
      src={coverUrl}
      alt={title}
      className="w-10 h-10 sm:w-13 sm:h-13 aspect-square rounded-xl object-cover transition-transform group-hover:scale-105 shadow-md shrink-0"
      />
    ) : (
      <div className="w-10 h-10 sm:w-13 sm:h-13 aspect-square bg-gradient-to-br from-primary to-cyber-purple rounded-xl shadow-md shrink-0" />
    )}
    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
    <Maximize2 className="w-4 h-4 text-white aspect-square shrink-0" />
    </div>
    </div>

    <div className="min-w-0 flex-1">
    <h3
    onClick={onExpand}
    className="text-white font-semibold text-xs sm:text-sm truncate cursor-pointer hover:text-primary transition"
    >
    {title}
    </h3>
    <p
    onClick={onArtistClick}
    className="text-[10px] sm:text-xs text-white/50 hover:text-white cursor-pointer transition truncate"
    >
    {artistNames}
    </p>
    </div>

    <button
    onClick={onLikeClick}
    className="text-white/40 hover:text-red-400 transition shrink-0 p-1"
    >
    <Heart
    className={`w-4 h-4 sm:w-5 sm:h-5 aspect-square shrink-0 ${trackIsLiked ? "fill-red-500 text-red-500" : ""}`}
    />
    </button>
    </div>

    <div className="flex flex-col items-center space-y-1 flex-1 min-w-0">
    <PlaybackControls
    isPlaying={isPlaying}
    loading={loading}
    repeat={repeat}
    shuffle={shuffle}
    onPlayPause={onPlayPause}
    onNext={onNext}
    onPrev={onPrev}
    onRepeatToggle={onRepeatToggle}
    onShuffleToggle={onShuffleToggle}
    />

    <ProgressBar
    currentTime={currentTime}
    duration={duration}
    onSeek={onSeek}
    maxWidth="max-w-xl"
    />
    </div>

    <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0 justify-end min-w-0">
    <button
    disabled={!hasPlain}
    onClick={onOpenPlainLyrics}
    className={`p-1.5 transition shrink-0 ${
      hasPlain
      ? "text-white/60 hover:text-white"
      : "text-white/20 cursor-not-allowed"
    }`}
    >
    <FileText className="w-4 h-4 sm:w-5 sm:h-5 aspect-square shrink-0" />
    </button>

    <button
    disabled={!hasSynced}
    onClick={onOpenKaraokeLyrics}
    className={`p-1.5 transition shrink-0 ${
      hasSynced
      ? "text-white/60 hover:text-white"
      : "text-white/20 cursor-not-allowed"
    }`}
    >
    <Mic2 className="w-4 h-4 sm:w-5 sm:h-5 aspect-square shrink-0" />
    </button>

    <div className="flex items-center shrink-0 pl-0.5">
    <VolumeSlider
    volume={volume}
    onVolumeChange={onVolumeChange}
    isDraggingRef={isDraggingRef}
    />
    </div>
    </div>
    </div>
    </div>
    </div>
  );
}
