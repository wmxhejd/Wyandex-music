import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  loading: boolean;
  repeat: boolean;
  shuffle: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRepeatToggle: () => void;
  onShuffleToggle: () => void;
}

export default function PlaybackControls({
  isPlaying,
  loading,
  repeat,
  shuffle,
  onPlayPause,
  onNext,
  onPrev,
  onRepeatToggle,
  onShuffleToggle,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center space-x-4">
    <button
    onClick={onShuffleToggle}
    className={`transition ${shuffle ? "text-primary" : "text-[var(--text-secondary)] hover:text-white"}`}
    >
    <Shuffle size={20} />
    </button>
    <button
    onClick={onPrev}
    className="text-white hover:text-primary transition"
    >
    <SkipBack size={24} />
    </button>
    <button
    onClick={onPlayPause}
    disabled={loading}
    className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 flex-shrink-0"
    >
    {loading ? (
      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
    ) : isPlaying ? (
      <Pause size={22} fill="currentColor" />
    ) : (
      <Play size={22} fill="currentColor" className="translate-x-0.5" />
    )}
    </button>
    <button
    onClick={onNext}
    className="text-white hover:text-primary transition"
    >
    <SkipForward size={24} />
    </button>
    <button
    onClick={onRepeatToggle}
    className={`relative p-2.5 rounded-full transition-all ${
      repeat
      ? "text-primary bg-primary/20 ring-1 ring-primary/40 shadow-[0_0_12px_rgba(255,204,0,0.3)]"
      : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5"
    }`}
    >
    <Repeat size={20} />
    {repeat && (
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
    )}
    </button>
    </div>
  );
}
