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
    <div className="space-y-6 w-full max-w-2xl py-48 select-none">
    {lyrics.map((line, idx) => {
      const isActive = idx === currentLineIndex;
      const dist = Math.abs(idx - currentLineIndex);

      return (
        <div
        key={`${idx}-${line.time}`}
        ref={isActive ? activeLineRef : null}
        onClick={() => onLineClick(line.time)}
        className={`transition-colors duration-200 ease-out cursor-pointer text-2xl md:text-3xl leading-relaxed ${
          isActive
          ? "font-extrabold text-white [text-shadow:_0_0_24px_rgba(255,255,255,0.7)]"
          : dist <= 2
          ? "font-semibold text-white/40 hover:text-white/80"
          : "font-semibold text-white/20 hover:text-white/60"
        }`}
        >
        {line.text}
        </div>
      );
    })}
    </div>
  );
}
