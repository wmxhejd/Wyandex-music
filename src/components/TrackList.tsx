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
    <div className="space-y-1.5 select-none">
    {tracks.map((track, index) => {
      const coverUrl = getCoverUrl(track.coverUri);

      return (
        <div
        key={`${track.id}-${index}`}
        className="flex items-center space-x-4 px-4 py-3 rounded-2xl hover:bg-white/[0.06] transition-all group cursor-pointer"
        onClick={() => onPlayTrack(track, tracks)}
        >
        <div className="w-8 text-center text-sm font-semibold text-white/70 group-hover:hidden">
        {index + 1}
        </div>

        <div className="w-8 items-center justify-center hidden group-hover:flex text-[#ffcc00]">
        <Play size={18} fill="currentColor" />
        </div>

        {coverUrl ? (
          <img
          src={coverUrl}
          alt={track.title}
          className="w-13 h-13 rounded-xl object-cover flex-shrink-0 shadow-md"
          />
        ) : (
          <div className="w-13 h-13 bg-white/[0.05] rounded-xl flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-white truncate group-hover:text-[#ffcc00] transition-colors">
        {track.title}
        </h3>
        <p className="text-sm text-white/50 truncate mt-0.5">
        {track.artists.map((a) => a.name).join(", ")}
        </p>
        </div>

        <button
        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400 p-1.5"
        onClick={(e) => {
          e.stopPropagation();
          toggleLike(track.id);
        }}
        >
        <Heart
        size={20}
        className={isLiked(track.id) ? "fill-red-500 text-red-500 !opacity-100" : ""}
        />
        </button>

        <span className="text-sm text-white/50 font-mono w-16 text-right">
        {formatDuration(track.durationMs)}
        </span>
        </div>
      );
    })}
    </div>
  );
}
