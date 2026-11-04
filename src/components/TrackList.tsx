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
    return `https://${coverUri.replace("%%", "150x150")}`;
  };

  return (
    <div className="space-y-1 select-none">
    {tracks.map((track, index) => {
      const coverUrl = getCoverUrl(track.coverUri);

      return (
        <div
        key={`${track.id}-${index}`}
        className="flex items-center space-x-2.5 sm:space-x-3.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl hover:bg-white/[0.06] transition-all group cursor-pointer"
        onClick={() => onPlayTrack(track, tracks)}
        >
        <div className="w-5 sm:w-7 text-center text-xs sm:text-sm font-semibold text-white/70 group-hover:hidden flex-shrink-0">
        {index + 1}
        </div>

        <div className="w-5 sm:w-7 items-center justify-center hidden group-hover:flex text-[#ffcc00] flex-shrink-0">
        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 aspect-square shrink-0" fill="currentColor" />
        </div>

        {coverUrl ? (
          <img
          src={coverUrl}
          alt={track.title}
          className="w-10 h-10 sm:w-11 sm:h-11 aspect-square rounded-xl object-cover flex-shrink-0 shadow-md"
          />
        ) : (
          <div className="w-10 h-10 sm:w-11 sm:h-11 aspect-square bg-white/[0.05] rounded-xl flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
        <h3 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-[#ffcc00] transition-colors">
        {track.title}
        </h3>
        <p className="text-[11px] sm:text-xs text-white/50 truncate mt-0.5">
        {track.artists.map((a) => a.name).join(", ")}
        </p>
        </div>

        <button
        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400 p-1 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          toggleLike(track.id);
        }}
        >
        <Heart
        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 aspect-square shrink-0 ${isLiked(track.id) ? "fill-red-500 text-red-500 !opacity-100" : ""}`}
        />
        </button>

        <span className="text-[11px] sm:text-xs text-white/50 font-mono w-12 sm:w-14 text-right flex-shrink-0">
        {formatDuration(track.durationMs)}
        </span>
        </div>
      );
    })}
    </div>
  );
}
