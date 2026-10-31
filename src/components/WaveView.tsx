import { Play, Radio } from "lucide-react";
import { Track } from "../types";
import TrackList from "./TrackList";

interface WaveViewProps {
  queue: Track[];
  onPlayTrack: (track: Track, tracks: Track[]) => void;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
}

export default function WaveView({ queue, onPlayTrack, isLoading, error, onRetry }: WaveViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-[#ffcc00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="glass-strong rounded-3xl p-8 text-center max-w-sm">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-[#ffcc00] text-black rounded-full font-semibold text-sm hover:scale-105 transition"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#16161e] via-[#1a1622] to-[#14141a] border border-white/[0.08] p-8 shadow-2xl">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-5">
            <div className="p-4 rounded-2xl bg-[#ffcc00]/10 border border-[#ffcc00]/20 text-[#ffcc00]">
              <Radio size={36} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-1">Моя волна</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Бесконечный персональный поток музыки • {queue.length} треков
              </p>
            </div>
          </div>

          <button
            onClick={() => queue[0] && onPlayTrack(queue[0], queue)}
            disabled={queue.length === 0}
            className="bg-[#ffcc00] hover:scale-105 active:scale-95 text-black font-bold px-8 py-3.5 rounded-full flex items-center space-x-2.5 shadow-xl shadow-[#ffcc00]/15 transition disabled:opacity-50"
          >
            <Play size={20} fill="currentColor" />
            <span>Слушать волну</span>
          </button>
        </div>
      </div>

      <TrackList
        tracks={queue}
        onPlayTrack={(track) => onPlayTrack(track, queue)}
      />
    </div>
  );
}
