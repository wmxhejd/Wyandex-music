import { LyricLine } from "../../utils/lrcParser";

interface KaraokeLyricsViewProps {
  lyrics: LyricLine[];
  currentLineIndex: number;
  activeLineRef: React.RefObject<HTMLDivElement | null>;
  onLineClick: (time: number) => void;
}

export default function KaraokeLyricsView({
  lyrics,
  currentLineIndex,
  activeLineRef,
  onLineClick,
}: KaraokeLyricsViewProps) {
  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto py-10 sm:py-16 select-none">
    {lyrics.map((line, idx) => {
      const isActive = idx === currentLineIndex;
      const dist = Math.abs(idx - currentLineIndex);

      return (
        <div
        key={`${idx}-${line.time}`}
        ref={isActive ? activeLineRef : null}
        onClick={() => onLineClick(line.time)}
        className={`transition-all duration-300 ease-out cursor-pointer text-sm sm:text-lg md:text-xl leading-relaxed origin-center will-change-transform px-2 ${
          isActive
          ? "scale-[1.14] sm:scale-[1.18] font-black text-white [text-shadow:_0_0_26px_rgba(255,255,255,0.85)] opacity-100 py-1 sm:py-1.5"
          : dist <= 2
          ? "scale-100 font-semibold text-white/40 hover:text-white/80"
          : "scale-100 font-medium text-white/20 hover:text-white/60"
        }`}
        >
        {line.text}
        </div>
      );
    })}
    </div>
  );
}
