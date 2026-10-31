import { Play, Heart } from "lucide-react";
import { Track } from "../types";
import { useLikes } from "../context/LikesContext";

interface TrackListProps {
  tracks: Track[];
  onPlayTrack: (track: Track, tracks?: Track[]) => void;
}

export default function TrackList({ tracks, onPlayTrack }: TrackListProps) {
  const { isLiked, toggleLike } = useLikes();

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getCoverUrl = (coverUri?: string) => {
    if (!coverUri) return undefined;
    return `https://${coverUri.replace("%%", "100x100")}`;
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#121216]/50 overflow-hidden divide-y divide-white/[0.04]">
      {tracks.map((track, index) => {
        const coverUrl = getCoverUrl(track.coverUri);

        return (
          <div
            key={`${track.id}-${index}`}
            className="flex items-center space-x-4 px-5 py-3 hover:bg-white/[0.04] transition-colors group cursor-pointer"
            onClick={() => onPlayTrack(track, tracks)}
          >
            <div className="w-7 text-center text-xs text-[var(--text-secondary)] font-mono group-hover:hidden">
              {index + 1}
            </div>

            <div className="w-7 items-center justify-center hidden group-hover:flex text-[#ffcc00]">
              <Play size={16} fill="currentColor" />
            </div>

            {coverUrl ? (
              <img
                src={coverUrl}
                alt={track.title}
                className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-white/[0.06]"
              />
            ) : (
              <div className="w-11 h-11 bg-white/[0.05] rounded-lg flex-shrink-0 border border-white/[0.06]" />
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#ffcc00] transition">
                {track.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                {track.artists.map((a) => a.name).join(", ")}
              </p>
            </div>

            <button
              className="opacity-0 group-hover:opacity-100 transition text-[var(--text-secondary)] hover:text-red-400 p-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(track.id);
              }}
            >
              <Heart
                size={18}
                className={isLiked(track.id) ? "fill-red-500 text-red-500" : ""}
              />
            </button>

            <span className="text-xs text-[var(--text-secondary)] font-mono w-14 text-right">
              {formatDuration(track.durationMs)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
