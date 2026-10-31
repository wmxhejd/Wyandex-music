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
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <Disc3 size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Ошибка загрузки альбома</h2>
          <p className="text-[var(--text-secondary)] mb-4">{error || "Альбом не найден"}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-primary text-black rounded-full font-medium"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  const coverUrl = getCoverUrl(album.coverUri);

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-8 border border-white/10">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-white transition mb-6"
        >
          <ArrowLeft size={20} />
          <span>Назад</span>
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={album.title}
              className="w-52 h-52 rounded-2xl object-cover shadow-2xl border border-white/10 flex-shrink-0"
            />
          ) : (
            <div className="w-52 h-52 rounded-2xl bg-gradient-to-br from-primary/30 to-cyber-purple/30 flex items-center justify-center flex-shrink-0 shadow-2xl border border-white/10">
              <Disc3 size={64} className="text-white/40" />
            </div>
          )}

          <div className="flex-1 text-center md:text-left">
            <span className="text-xs uppercase tracking-wider text-primary font-bold">Альбом</span>
            <h1 className="text-4xl font-extrabold text-white mt-1 mb-2">{album.title}</h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-[var(--text-secondary)] mb-6">
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
              className="bg-[#ffcc00] hover:scale-105 active:scale-95 text-black font-bold px-8 py-3.5 rounded-full flex items-center justify-center space-x-2 shadow-xl transition disabled:opacity-50 mx-auto md:mx-0"
            >
              <Play size={20} fill="currentColor" />
              <span>Слушать альбом</span>
            </button>
          </div>
        </div>
      </div>

      <TrackList tracks={album.tracks} onPlayTrack={onPlayTrack} />
    </div>
  );
}
