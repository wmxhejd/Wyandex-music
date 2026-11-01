interface AuraBackgroundProps {
  colors: { c1: string; c2: string; c3: string };
  isPlaying: boolean;
  position?: "center" | "left";
  brightness?: number;
  enabled?: boolean;
}

export default function AuraBackground({
  colors,
  isPlaying,
  position = "center",
  brightness = 100,
  enabled = true,
}: AuraBackgroundProps) {
  if (!enabled || brightness <= 0) return null;

  const factor = (brightness / 100) * 1.5;
  const leftPosition = position === "left" ? "35%" : "50%";

  return (
    <div
    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] md:w-[1700px] md:h-[1700px] pointer-events-none transition-[left] duration-700 ease-in-out z-0"
    style={{
      left: leftPosition,
      filter: `brightness(${1 + (brightness / 100) * 0.4}) saturate(${1 + (brightness / 100) * 0.3})`,
    }}
    >
    <div
    className="absolute top-1/2 left-1/2 w-[900px] h-[900px] md:w-[1200px] md:h-[1200px] rounded-full transition-colors duration-1000 ease-in-out"
    style={{
      opacity: Math.min(1, 0.75 * factor),
          backgroundColor: colors.c1,
          filter: "blur(140px)",
          animation: "aura-float-1 16s ease-in-out infinite",
          animationPlayState: isPlaying ? "running" : "paused",
    }}
    />

    <div
    className="absolute top-1/2 left-1/2 w-[750px] h-[750px] md:w-[1000px] md:h-[1000px] rounded-full transition-colors duration-1000 ease-in-out"
    style={{
      opacity: Math.min(1, 0.65 * factor),
          backgroundColor: colors.c2,
          filter: "blur(150px)",
          animation: "aura-float-2 20s ease-in-out infinite",
          animationPlayState: isPlaying ? "running" : "paused",
    }}
    />

    <div
    className="absolute top-1/2 left-1/2 w-[600px] h-[600px] md:w-[850px] md:h-[850px] rounded-full transition-colors duration-1000 ease-in-out"
    style={{
      opacity: Math.min(1, 0.55 * factor),
          backgroundColor: colors.c3,
          filter: "blur(130px)",
          animation: "aura-float-1 13s ease-in-out infinite reverse",
          animationPlayState: isPlaying ? "running" : "paused",
    }}
    />
    </div>
  );
}
