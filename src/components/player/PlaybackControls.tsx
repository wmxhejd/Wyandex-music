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
    <div className="flex items-center space-x-3 sm:space-x-4">
    <button
    onClick={onShuffleToggle}
    className={`transition shrink-0 p-1 ${shuffle ? "text-primary" : "text-white/40 hover:text-white"}`}
    >
    <Shuffle className="w-4 h-4 sm:w-5 sm:h-5 aspect-square shrink-0" />
    </button>

    <button
    onClick={onPrev}
    className="text-white hover:text-primary transition shrink-0 p-1"
    >
    <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 aspect-square shrink-0" />
    </button>

    <button
    onClick={onPlayPause}
    disabled={loading}
    className="w-10 h-10 sm:w-12 sm:h-12 aspect-square rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 shrink-0"
    >
    {loading ? (
      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin shrink-0" />
    ) : isPlaying ? (
      <Pause className="w-5 h-5 sm:w-6 sm:h-6 aspect-square shrink-0" fill="currentColor" />
    ) : (
      <Play className="w-5 h-5 sm:w-6 sm:h-6 aspect-square shrink-0 translate-x-0.5" fill="currentColor" />
    )}
    </button>

    <button
    onClick={onNext}
    className="text-white hover:text-primary transition shrink-0 p-1"
    >
    <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 aspect-square shrink-0" />
    </button>

    <button
    onClick={onRepeatToggle}
    className={`relative p-1.5 rounded-full shrink-0 transition-all ${
      repeat
      ? "text-primary bg-primary/20 ring-1 ring-primary/40 shadow-[0_0_12px_rgba(255,204,0,0.3)]"
      : "text-white/40 hover:text-white"
    }`}
    >
    <Repeat className="w-4 h-4 sm:w-5 sm:h-5 aspect-square shrink-0" />
    {repeat && (
      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
    )}
    </button>
    </div>
  );
}
