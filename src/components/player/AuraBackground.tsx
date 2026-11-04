interface AuraBackgroundProps {
  colors: { c1: string; c2: string; c3: string };
  isPlaying: boolean;
  position?: "center" | "left";
  brightness?: number;
  glowEnabled?: boolean;
  cosmosEnabled?: boolean;
  isIdle?: boolean;
  transitionDuration?: number;
  animSpeed?: number;
}

const COSMOS_STARS = [
  { x: 3, y: 8, size: 1.5, delay: 0.3, duration: 3.5, opacity: 0.6 },
{ x: 8, y: 22, size: 2, delay: 1.1, duration: 4.0, opacity: 0.7 },
{ x: 12, y: 64, size: 1, delay: 2.4, duration: 2.8, opacity: 0.4 },
{ x: 15, y: 42, size: 2, delay: 0.7, duration: 3.2, opacity: 0.8 },
{ x: 18, y: 88, size: 1.5, delay: 1.9, duration: 4.5, opacity: 0.5 },
{ x: 22, y: 14, size: 1, delay: 3.1, duration: 3.0, opacity: 0.4 },
{ x: 25, y: 55, size: 2.5, delay: 0.5, duration: 3.8, opacity: 0.9 },
{ x: 28, y: 31, size: 1.5, delay: 2.0, duration: 2.9, opacity: 0.6 },
{ x: 32, y: 76, size: 1, delay: 1.4, duration: 3.7, opacity: 0.5 },
{ x: 35, y: 19, size: 2, delay: 2.8, duration: 4.2, opacity: 0.7 },
{ x: 38, y: 92, size: 1.5, delay: 0.2, duration: 3.1, opacity: 0.6 },
{ x: 42, y: 48, size: 1, delay: 1.7, duration: 2.5, opacity: 0.4 },
{ x: 45, y: 5, size: 2.5, delay: 2.3, duration: 4.4, opacity: 0.8 },
{ x: 48, y: 68, size: 1.5, delay: 0.9, duration: 3.6, opacity: 0.5 },
{ x: 52, y: 27, size: 2, delay: 3.4, duration: 3.3, opacity: 0.7 },
{ x: 55, y: 84, size: 1.6, delay: 1.6, duration: 4.1, opacity: 0.4 },
{ x: 58, y: 12, size: 1.5, delay: 2.7, duration: 2.7, opacity: 0.6 },
{ x: 62, y: 59, size: 2, delay: 0.4, duration: 3.9, opacity: 0.8 },
{ x: 65, y: 38, size: 1, delay: 1.8, duration: 3.2, opacity: 0.5 },
{ x: 68, y: 95, size: 2.5, delay: 3.0, duration: 4.3, opacity: 0.9 },
{ x: 72, y: 16, size: 1.5, delay: 0.8, duration: 2.8, opacity: 0.6 },
{ x: 75, y: 72, size: 2, delay: 2.2, duration: 3.7, opacity: 0.7 },
{ x: 78, y: 45, size: 1, delay: 1.3, duration: 4.0, opacity: 0.4 },
{ x: 82, y: 83, size: 2, delay: 2.9, duration: 3.4, opacity: 0.8 },
{ x: 85, y: 24, size: 1.5, delay: 0.6, duration: 3.0, opacity: 0.5 },
{ x: 88, y: 61, size: 1, delay: 2.1, duration: 4.2, opacity: 0.4 },
{ x: 92, y: 9, size: 2.5, delay: 1.5, duration: 3.5, opacity: 0.9 },
{ x: 95, y: 52, size: 1.5, delay: 3.2, duration: 2.9, opacity: 0.6 },
{ x: 97, y: 89, size: 2, delay: 0.1, duration: 4.1, opacity: 0.7 },
{ x: 6, y: 35, size: 1.5, delay: 2.5, duration: 3.3, opacity: 0.5 },
{ x: 14, y: 78, size: 2, delay: 1.0, duration: 3.8, opacity: 0.8 },
{ x: 20, y: 49, size: 1, delay: 3.3, duration: 2.6, opacity: 0.4 },
{ x: 29, y: 6, size: 1.5, delay: 0.7, duration: 4.0, opacity: 0.6 },
{ x: 36, y: 63, size: 2, delay: 2.6, duration: 3.4, opacity: 0.7 },
{ x: 44, y: 34, size: 1, delay: 1.2, duration: 2.9, opacity: 0.4 },
{ x: 51, y: 91, size: 2.5, delay: 3.5, duration: 4.5, opacity: 0.9 },
{ x: 59, y: 46, size: 1.5, delay: 0.3, duration: 3.1, opacity: 0.5 },
{ x: 66, y: 74, size: 2, delay: 2.8, duration: 3.7, opacity: 0.8 },
{ x: 73, y: 3, size: 1, delay: 1.5, duration: 4.2, opacity: 0.4 },
{ x: 81, y: 57, size: 1.5, delay: 0.9, duration: 2.7, opacity: 0.6 },
{ x: 89, y: 39, size: 2, delay: 3.0, duration: 3.9, opacity: 0.7 },
{ x: 96, y: 79, size: 1, delay: 1.8, duration: 3.5, opacity: 0.5 },
{ x: 11, y: 93, size: 2.5, delay: 0.4, duration: 4.3, opacity: 0.8 },
{ x: 24, y: 25, size: 1.5, delay: 2.1, duration: 3.0, opacity: 0.6 },
{ x: 33, y: 82, size: 2, delay: 1.6, duration: 3.6, opacity: 0.7 },
{ x: 47, y: 56, size: 1, delay: 3.2, duration: 2.8, opacity: 0.4 },
{ x: 56, y: 18, size: 2, delay: 0.6, duration: 4.1, opacity: 0.8 },
{ x: 69, y: 65, size: 1.5, delay: 2.4, duration: 3.3, opacity: 0.5 },
{ x: 77, y: 87, size: 2, delay: 1.1, duration: 3.8, opacity: 0.7 },
{ x: 84, y: 11, size: 1, delay: 2.7, duration: 4.4, opacity: 0.4 },
{ x: 93, y: 71, size: 2.5, delay: 0.5, duration: 3.2, opacity: 0.9 },
{ x: 2, y: 58, size: 1.5, delay: 1.9, duration: 3.7, opacity: 0.6 },
{ x: 16, y: 5, size: 2, delay: 3.3, duration: 2.9, opacity: 0.7 },
{ x: 26, y: 44, size: 1, delay: 0.8, duration: 4.2, opacity: 0.4 },
{ x: 39, y: 73, size: 1.5, delay: 2.2, duration: 3.5, opacity: 0.5 },
{ x: 54, y: 79, size: 2, delay: 1.7, duration: 3.9, opacity: 0.8 },
{ x: 63, y: 29, size: 1, delay: 3.1, duration: 2.7, opacity: 0.4 },
{ x: 71, y: 51, size: 2.5, delay: 0.2, duration: 4.0, opacity: 0.9 },
{ x: 87, y: 96, size: 1.5, delay: 2.0, duration: 3.4, opacity: 0.6 },
{ x: 98, y: 30, size: 2, delay: 1.3, duration: 3.6, opacity: 0.7 },
];

export default function AuraBackground({
  colors,
  isPlaying,
  position = "center",
  brightness = 100,
  glowEnabled = true,
  cosmosEnabled = true,
  isIdle = false,
  transitionDuration = 1.5,
  animSpeed = 1.0,
}: AuraBackgroundProps) {
  const factor = (brightness / 100) * 1.6;
  const centerPercent = position === "left" ? "35%" : "55%";
  const shouldShowAura = glowEnabled && brightness > 0 && !isIdle && isPlaying;
  const shouldShowCosmos = cosmosEnabled && !shouldShowAura;

  const duration1 = 18 / Math.max(0.2, animSpeed);
  const duration2 = 22 / Math.max(0.2, animSpeed);
  const duration3 = 14 / Math.max(0.2, animSpeed);

  return (
    <div className="fixed inset-0 w-screen h-screen pointer-events-none z-0 overflow-hidden select-none bg-[#07070a]">
    <div
    className="absolute inset-0 w-full h-full pointer-events-none"
    style={{
      opacity: shouldShowCosmos ? 1 : 0,
      transition: shouldShowAura ? "opacity 1s ease-out" : glowEnabled ? "opacity 2s ease-out 1.2s" : "opacity 1s ease-out",
    }}
    >
    <div className="absolute inset-0 bg-gradient-to-br from-[#030305] via-[#080712] to-[#030305]" />
    <div className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] bg-[#ffcc00]/5 rounded-full blur-[140px]" />
    <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-purple-900/12 rounded-full blur-[150px]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-indigo-950/15 rounded-full blur-[160px]" />

    <div className="absolute inset-0 opacity-60">
    {COSMOS_STARS.map((star, i) => (
      <div
      key={i}
      className="absolute bg-white rounded-full animate-pulse"
      style={{
        width: `${star.size}px`,
        height: `${star.size}px`,
        left: `${star.x}%`,
        top: `${star.y}%`,
        opacity: star.opacity,
        animationDelay: `${star.delay}s`,
        animationDuration: `${star.duration}s`,
      }}
      />
    ))}
    </div>
    </div>

    <div
    className="absolute inset-0 w-full h-full pointer-events-none"
    style={{
      opacity: shouldShowAura ? Math.min(1, factor) : 0,
          transition: "opacity 1.5s ease-out",
          transform: "translate3d(0, 0, 0)",
    }}
    >
    <div
    className="absolute inset-0 w-full h-full"
    style={{
      background: `radial-gradient(ellipse 90% 80% at ${centerPercent} 50%, ${colors.c1} 0%, ${colors.c2} 40%, transparent 80%)`,
          filter: "blur(60px)",
          opacity: 0.65,
          transition: "background 0.5s ease-out",
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
          transform: "translate3d(0, 0, 0)",
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
          transform: "translate3d(0, 0, 0)",
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
          transform: "translate3d(0, 0, 0)",
          opacity: 0.7,
    }}
    />
    </div>
    </div>
  );
}
