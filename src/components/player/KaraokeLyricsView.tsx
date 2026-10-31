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
    <div className="space-y-8 w-full max-w-2xl py-32 select-none">
      {lyrics.map((line, idx) => {
        const isActive = idx === currentLineIndex;
        return (
          <div
            key={idx}
            ref={isActive ? activeLineRef : null}
            onClick={() => onLineClick(line.time)}
            className={`transition-all duration-200 cursor-pointer ${
              isActive
                ? "text-3xl md:text-4xl font-extrabold text-white scale-105 tracking-wide drop-shadow-[0_4px_16px_rgba(255,255,255,0.4)]"
                : "text-xl md:text-2xl font-semibold text-white/30 hover:text-white/70"
            }`}
          >
            {line.text}
          </div>
        );
      })}
    </div>
  );
}
