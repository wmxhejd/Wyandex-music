interface AuraBackgroundProps {
  colors: { c1: string; c2: string; c3: string };
  isPlaying: boolean;
  position?: "center" | "left";
}

export default function AuraBackground({ colors, isPlaying, position = "center" }: AuraBackgroundProps) {
  const leftPosition = position === "left" ? "24%" : "50%";

  return (
    <div
      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] md:w-[1050px] md:h-[1050px] pointer-events-none transition-[left] duration-700 ease-in-out z-0"
      style={{ left: leftPosition }}
    >
      <div
        className="absolute top-1/2 left-1/2 w-[650px] h-[650px] md:w-[880px] md:h-[880px] rounded-full transition-colors duration-1000 ease-in-out opacity-60"
        style={{
          backgroundColor: colors.c1,
          filter: "blur(110px)",
          animation: "aura-float-1 16s ease-in-out infinite",
          animationPlayState: isPlaying ? "running" : "paused",
        }}
      />

      <div
        className="absolute top-1/2 left-1/2 w-[550px] h-[550px] md:w-[750px] md:h-[750px] rounded-full transition-colors duration-1000 ease-in-out opacity-50"
        style={{
          backgroundColor: colors.c2,
          filter: "blur(120px)",
          animation: "aura-float-2 20s ease-in-out infinite",
          animationPlayState: isPlaying ? "running" : "paused",
        }}
      />

      <div
        className="absolute top-1/2 left-1/2 w-[440px] h-[440px] md:w-[620px] md:h-[620px] rounded-full transition-colors duration-1000 ease-in-out opacity-40"
        style={{
          backgroundColor: colors.c3,
          filter: "blur(100px)",
          animation: "aura-float-1 13s ease-in-out infinite reverse",
          animationPlayState: isPlaying ? "running" : "paused",
        }}
      />
    </div>
  );
}
