interface AuraBackgroundProps {
  colors: { c1: string; c2: string; c3: string };
  isPlaying: boolean;
  position?: "center" | "left";
  brightness?: number;
  enabled?: boolean;
  isIdle?: boolean;
  transitionDuration?: number;
  animSpeed?: number;
}

export default function AuraBackground({
  colors,
  isPlaying,
  position = "center",
  brightness = 100,
  enabled = true,
  isIdle = false,
  transitionDuration = 1.5,
  animSpeed = 1.0,
}: AuraBackgroundProps) {
  if (!enabled || brightness <= 0) return null;

  const factor = (brightness / 100) * 1.6;
  const centerPercent = position === "left" ? "35%" : "55%";
  const shouldGlow = !isIdle && isPlaying;

  const duration1 = 18 / Math.max(0.2, animSpeed);
  const duration2 = 22 / Math.max(0.2, animSpeed);
  const duration3 = 14 / Math.max(0.2, animSpeed);

  return (
    <div className="fixed inset-0 w-screen h-screen pointer-events-none z-0 overflow-hidden select-none">
    <div
    className="absolute inset-0 w-full h-full"
    style={{
      opacity: shouldGlow ? Math.min(1, factor) : 0,
          transition: isPlaying ? "opacity 2s ease-out" : "opacity 120s ease-out",
    }}
    >
    <div
    className="absolute inset-0 w-full h-full"
    style={{
      background: `radial-gradient(ellipse 90% 80% at ${centerPercent} 50%, ${colors.c1} 0%, ${colors.c2} 40%, transparent 80%)`,
          filter: "blur(60px)",
          opacity: 0.65,
          transition: `background 0.5s ease-out`,
    }}
    />

    <div
    className="absolute will-change-transform"
    style={{
      width: "80vw",
      height: "80vw",
      maxWidth: "1250px",
      maxHeight: "1250px",
      top: "50%",
      left: centerPercent,
      backgroundColor: colors.c1,
      filter: "blur(75px) saturate(1.4)",
          transition: `background-color ${transitionDuration}s ease-out, left 0.7s ease-out`,
          animation: `aura-morph-1 ${duration1}s ease-in-out infinite`,
          animationPlayState: isPlaying ? "running" : "paused",
          opacity: 0.9,
    }}
    />

    <div
    className="absolute will-change-transform"
    style={{
      width: "68vw",
      height: "68vw",
      maxWidth: "1050px",
      maxHeight: "1050px",
      top: "50%",
      left: centerPercent,
      backgroundColor: colors.c2,
      filter: "blur(80px) saturate(1.4)",
          transition: `background-color ${transitionDuration}s ease-out, left 0.7s ease-out`,
          animation: `aura-morph-2 ${duration2}s ease-in-out infinite`,
          animationPlayState: isPlaying ? "running" : "paused",
          opacity: 0.8,
    }}
    />

    <div
    className="absolute will-change-transform"
    style={{
      width: "55vw",
      height: "55vw",
      maxWidth: "850px",
      maxHeight: "850px",
      top: "50%",
      left: centerPercent,
      backgroundColor: colors.c3,
      filter: "blur(65px) saturate(1.4)",
          transition: `background-color ${transitionDuration}s ease-out, left 0.7s ease-out`,
          animation: `aura-morph-3 ${duration3}s ease-in-out infinite`,
          animationPlayState: isPlaying ? "running" : "paused",
          opacity: 0.7,
    }}
    />
    </div>
    </div>
  );
}
