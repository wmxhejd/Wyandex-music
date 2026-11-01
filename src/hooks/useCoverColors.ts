import { useState, useEffect } from "react";

function getSeedPalette(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return {
    c1: `hsl(${hue}, 85%, 40%)`,
    c2: `hsl(${(hue + 45) % 360}, 80%, 35%)`,
    c3: `hsl(${(hue + 90) % 360}, 75%, 30%)`,
  };
}

export function useCoverColors(coverUrl?: string, trackSeed = "default") {
  const [colors, setColors] = useState(() => getSeedPalette(trackSeed));

  useEffect(() => {
    setColors(getSeedPalette(trackSeed));

    if (!coverUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.src = coverUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, 32, 32);
        const data = ctx.getImageData(0, 0, 32, 32).data;

        let bestScore = -1;
        let r1 = 180, g1 = 20, b1 = 70;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          const lum = (max + min) / 510;

          if (lum > 0.15 && lum < 0.75 && sat > 0.2) {
            const score = sat * 2.5 + (0.45 - Math.abs(lum - 0.45));
            if (score > bestScore) {
              bestScore = score;
              r1 = r;
              g1 = g;
              b1 = b;
            }
          }
        }

        if (bestScore > 0) {
          const c1 = `rgb(${Math.round(r1 * 0.85)}, ${Math.round(g1 * 0.85)}, ${Math.round(b1 * 0.85)})`;
          const c2 = `rgb(${Math.min(255, Math.round(b1 * 0.9 + 25))}, ${Math.max(0, Math.round(g1 * 0.3))}, ${Math.min(255, Math.round(r1 * 0.75 + 40))})`;
          const c3 = `rgb(${Math.min(255, Math.round(r1 * 0.8 + 30))}, ${Math.min(255, Math.round(g1 * 0.8 + 30))}, ${Math.max(0, Math.round(b1 * 0.25))})`;
          setColors({ c1, c2, c3 });
        }
      } catch {
        setColors(getSeedPalette(trackSeed));
      }
    };
  }, [coverUrl, trackSeed]);

  return colors;
}
