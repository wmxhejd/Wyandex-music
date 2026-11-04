import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft, Disc3, Play } from "lucide-react";
import TrackList from "./TrackList";
import { Track, Artist } from "../types";

interface AlbumDetails {
  id: number;
  title: string;
  year?: number;
  coverUri?: string;
  artists: Artist[];
  tracks: Track[];
}

interface AlbumViewProps {
  albumId: number;
  onBack: () => void;
  onPlayTrack: (track: Track, tracks?: Track[]) => void;
  onArtistClick?: (artistId: number) => void;
}

export default function AlbumView({ albumId, onBack, onPlayTrack, onArtistClick }: AlbumViewProps) {
  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAlbum();
  }, [albumId]);

  const loadAlbum = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await invoke<AlbumDetails>("get_album_with_tracks", { albumId });
      setAlbum(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const getCoverUrl = (uri?: string) => {
    if (!uri) return undefined;
    return `https://${uri.replace("%%", "400x400")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-[#ffcc00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="flex items-center justify-center py-32 text-center">
      <div>
      <Disc3 className="w-12 h-12 text-red-400 mx-auto mb-3 aspect-square shrink-0" />
      <h2 className="text-xl font-bold text-white mb-2">Ошибка загрузки альбома</h2>
      <p className="text-white/40 text-xs sm:text-sm mb-4">{error || "Альбом не найден"}</p>
      <button
      onClick={onBack}
      className="px-6 py-2 bg-[#ffcc00] text-black rounded-full font-semibold text-xs sm:text-sm hover:scale-105 transition"
      >
      <span>Назад</span>
      </button>
      </div>
      </div>
    );
  }

  const coverUrl = getCoverUrl(album.coverUri);

  return (
    <div className="space-y-6 select-none max-w-5xl">
    <div className="glass-strong rounded-3xl p-6 sm:p-8 border border-white/10">
    <button
    onClick={onBack}
    className="flex items-center space-x-2 text-white/50 hover:text-white transition mb-4 sm:mb-6"
    >
    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 aspect-square shrink-0" />
    <span className="text-xs sm:text-sm font-medium">Назад</span>
    </button>

    <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 sm:space-x-8">
    {coverUrl ? (
      <img
      src={coverUrl}
      alt={album.title}
      className="w-36 h-36 sm:w-48 sm:h-48 aspect-square rounded-2xl object-cover shadow-2xl border border-white/10 shrink-0"
      />
    ) : (
      <div className="w-36 h-36 sm:w-48 sm:h-48 aspect-square rounded-2xl bg-gradient-to-br from-[#ffcc00]/20 to-purple-600/20 flex items-center justify-center shrink-0 shadow-2xl border border-white/10">
      <Disc3 className="w-14 h-14 sm:w-16 sm:h-16 aspect-square text-white/40 shrink-0" />
      </div>
    )}

    <div className="flex-1 text-center md:text-left min-w-0">
    <span className="text-xs uppercase tracking-wider text-[#ffcc00] font-bold">Альбом</span>
    <h1 className="text-2xl sm:text-4xl font-black text-white mt-1 mb-2 tracking-tight truncate">{album.title}</h1>

    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs sm:text-sm text-white/50 mb-5">
    {album.artists.map((artist, i) => (
      <span key={artist.id}>
      <span
      onClick={() => onArtistClick && onArtistClick(artist.id)}
      className="hover:text-white hover:underline cursor-pointer font-medium"
      >
      {artist.name}
      </span>
      {i < album.artists.length - 1 && ", "}
      </span>
    ))}
    {album.year && <span>• {album.year}</span>}
    <span>• {album.tracks.length} треков</span>
    </div>

    <button
    disabled={album.tracks.length === 0}
    onClick={() => album.tracks[0] && onPlayTrack(album.tracks[0], album.tracks)}
    className="bg-[#ffcc00] hover:scale-105 active:scale-95 text-black font-bold px-6 sm:px-8 py-3 rounded-full inline-flex items-center justify-center space-x-2 shadow-xl transition disabled:opacity-50 border-none outline-none cursor-pointer"
    >
    <Play className="w-4 h-4 sm:w-5 sm:h-5 aspect-square shrink-0" fill="currentColor" />
    <span className="text-xs sm:text-sm font-bold">Слушать альбом</span>
    </button>
    </div>
    </div>
    </div>

    <TrackList tracks={album.tracks} onPlayTrack={onPlayTrack} />
    </div>
  );
}
