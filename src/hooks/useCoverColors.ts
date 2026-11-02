import { useState, useEffect } from "react";

function getSeedPalette(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return {
    c1: `hsl(${hue}, 95%, 60%)`,
    c2: `hsl(${(hue + 35) % 360}, 90%, 55%)`,
    c3: `hsl(${(hue + 75) % 360}, 85%, 52%)`,
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
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
        let bestR = 255, bestG = 120, bestB = 40;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;

          const [h, s, l] = rgbToHsl(r, g, b);

          if (l >= 20 && l <= 85 && s >= 25) {
            const score = (s * 2.2) + (50 - Math.abs(l - 55));
            if (score > bestScore) {
              bestScore = score;
              bestR = r;
              bestG = g;
              bestB = b;
            }
          }
        }

        if (bestScore > 0) {
          const [h, s] = rgbToHsl(bestR, bestG, bestB);
          const finalSat = Math.max(75, s);

          const c1 = `hsl(${h}, ${finalSat}%, 60%)`;
          const c2 = `hsl(${(h + 35) % 360}, ${Math.max(70, finalSat - 5)}%, 54%)`;
          const c3 = `hsl(${(h + 70) % 360}, ${Math.max(65, finalSat - 10)}%, 50%)`;

          setColors({ c1, c2, c3 });
        }
      } catch {
        setColors(getSeedPalette(trackSeed));
      }
    };
  }, [coverUrl, trackSeed]);

  return colors;
}
