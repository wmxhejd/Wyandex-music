import { Volume2 } from "lucide-react";

interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDraggingRef: React.MutableRefObject<boolean>;
}

export default function VolumeSlider({ volume, onVolumeChange, isDraggingRef }: VolumeSliderProps) {
  return (
    <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
    <Volume2 className="text-white/50 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 aspect-square shrink-0" />
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
    className="w-14 sm:w-20 md:w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 sm:[&::-webkit-slider-thumb]:w-3 sm:[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
    />
    </div>
  );
}
