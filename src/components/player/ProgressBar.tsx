import { formatTime } from "../../utils/formatTime";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxWidth?: string;
}

export default function ProgressBar({ currentTime, duration, onSeek, maxWidth = "max-w-2xl" }: ProgressBarProps) {
  return (
    <div className={`flex items-center space-x-2.5 sm:space-x-3 w-full ${maxWidth}`}>
    <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] w-8 sm:w-10 text-right font-mono shrink-0">
    {formatTime(currentTime)}
    </span>
    <input
    type="range"
    min="0"
    max={duration || 0}
    value={currentTime}
    onChange={onSeek}
    className="flex-1 h-1 sm:h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 sm:[&::-webkit-slider-thumb]:w-3.5 sm:[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
    />
    <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] w-8 sm:w-10 font-mono shrink-0">
    {formatTime(duration)}
    </span>
    </div>
  );
}
