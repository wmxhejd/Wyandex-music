export interface LyricLine {
  time: number;
  text: string;
}

export function parseLrc(lrcText: string): LyricLine[] {
  const lines = lrcText.split("\n");
  const result: LyricLine[] = [];
  let fileOffsetMs = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("[offset:")) {
      const match = trimmed.match(/\[offset:\s*(-?\d+)\]/i);
      if (match) fileOffsetMs = parseInt(match[1], 10);
    }
  }

  const timeRegex = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\[(ar|al|ti|au|by|re|ve|length|offset):/i.test(trimmed)) {
      continue;
    }

    const text = trimmed.replace(timeRegex, "").trim();
    let match;
    timeRegex.lastIndex = 0;

    while ((match = timeRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      let millis = 0;

      if (match[3]) {
        if (match[3].length === 1) millis = parseInt(match[3], 10) * 100;
        else if (match[3].length === 2) millis = parseInt(match[3], 10) * 10;
        else millis = parseInt(match[3].slice(0, 3), 10);
      }

      let time = minutes * 60 + seconds + millis / 1000;
      time -= fileOffsetMs / 1000;

      if (text) {
        result.push({ time: Math.max(0, time), text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}
