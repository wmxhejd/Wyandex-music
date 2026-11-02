export interface LyricLine {
  time: number;
  text: string;
}

export function parseLrc(lrcText: string): LyricLine[] {
  if (!lrcText || !lrcText.trim()) return [];

  const lines = lrcText.split(/\r?\n/);
  const result: LyricLine[] = [];
  let fileOffset = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const offsetMatch = line.match(/^\[offset:\s*(-?\d+)\]/i);
    if (offsetMatch) {
      fileOffset = parseInt(offsetMatch[1], 10) / 1000;
      continue;
    }

    if (/^\[(ar|al|ti|au|by|re|ve|length):/i.test(line)) {
      continue;
    }

    const timestampRegex = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
    const timestamps: number[] = [];
    let match: RegExpExecArray | null;

    while ((match = timestampRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      let millis = 0;

      if (match[3]) {
        if (match[3].length === 1) {
          millis = parseInt(match[3], 10) * 100;
        } else if (match[3].length === 2) {
          millis = parseInt(match[3], 10) * 10;
        } else {
          millis = parseInt(match[3].slice(0, 3), 10);
        }
      }

      const totalTime = minutes * 60 + seconds + millis / 1000 - fileOffset;
      timestamps.push(Math.max(0, totalTime));
    }

    const cleanText = line
    .replace(/<[^>]+>/g, "")
    .replace(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/g, "")
    .trim();

    if (cleanText) {
      for (const time of timestamps) {
        result.push({ time, text: cleanText });
      }
    }
  }

  result.sort((a, b) => a.time - b.time);

  const deduplicated: LyricLine[] = [];
  for (let i = 0; i < result.length; i++) {
    if (i === 0 || Math.abs(result[i].time - deduplicated[deduplicated.length - 1].time) > 0.05) {
      deduplicated.push(result[i]);
    }
  }

  return deduplicated;
}
