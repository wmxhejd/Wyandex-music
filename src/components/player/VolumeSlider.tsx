import { Volume2 } from "lucide-react";

interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDraggingRef: React.MutableRefObject<boolean>;
}

export default function VolumeSlider({ volume, onVolumeChange, isDraggingRef }: VolumeSliderProps) {
  return (
    <div className="flex items-center space-x-3">
      <Volume2 size={20} className="text-[var(--text-secondary)] flex-shrink-0" />
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={volume}
        onMouseDown={() => { isDraggingRef.current = true; }}
        onTouchStart={() => { isDraggingRef.current = true; }}
        onMouseUp={() => { isDraggingRef.current = false; }}
        onTouchEnd={() => { isDraggingRef.current = false; }}
        onChange={onVolumeChange}
        title={`Громкость: ${Math.round(volume)}%`}
        className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
      />
    </div>
  );
}
