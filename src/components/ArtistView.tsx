import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft, Music2, Disc3, ChevronRight } from "lucide-react";
import TrackList from "./TrackList";
import { Track } from "../types";

interface ArtistViewProps {
  artistId: number;
  onBack: () => void;
  onPlayTrack: (track: Track, tracks?: Track[]) => void;
  onAlbumClick?: (albumId: number) => void;
}

interface Album {
  id: number;
  title: string;
  year?: number;
  coverUri?: string;
}

interface ArtistDetails {
  id: number;
  name: string;
  cover?: {
    uri?: string;
  };
  genres: string[];
}

interface ArtistInfo {
  artist: ArtistDetails;
  popular_tracks: Track[];
  albums: Album[];
}

export default function ArtistView({ artistId, onBack, onPlayTrack, onAlbumClick }: ArtistViewProps) {
  const [info, setInfo] = useState<ArtistInfo | null>(null);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [loadingAllTracks, setLoadingAllTracks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadArtistInfo();
    setShowAllTracks(false);
    setAllTracks([]);
  }, [artistId]);

  const loadArtistInfo = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await invoke<ArtistInfo>("get_artist_info", { artistId: String(artistId) });
      setInfo(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAllTracks = async () => {
    if (showAllTracks) {
      setShowAllTracks(false);
      return;
    }

    if (allTracks.length > 0) {
      setShowAllTracks(true);
      return;
    }

    try {
      setLoadingAllTracks(true);
      const tracks = await invoke<Track[]>("get_artist_tracks", { artistId: String(artistId) });
      setAllTracks(tracks);
      setShowAllTracks(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAllTracks(false);
    }
  };

  const getArtistCoverUrl = (uri?: string) => {
    if (!uri) return undefined;
    return `https://${uri.replace("%%", "300x300")}`;
  };

  const getAlbumCoverUrl = (uri?: string) => {
    if (!uri) return undefined;
    return `https://${uri.replace("%%", "200x200")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="flex items-center justify-center h-full text-center">
      <div>
      <Music2 className="w-8 h-8 text-red-400 mx-auto mb-4 aspect-square shrink-0" />
      <h2 className="text-xl font-bold text-white mb-2">Ошибка загрузки</h2>
      <p className="text-[var(--text-secondary)] mb-4">{error || "Не удалось загрузить артиста"}</p>
      <button onClick={onBack} className="px-6 py-2 bg-primary text-black rounded-full font-medium">
      Назад
      </button>
      </div>
      </div>
    );
  }

  const coverUrl = getArtistCoverUrl(info.artist.cover?.uri);
  const displayedTracks = showAllTracks ? allTracks : info.popular_tracks;

  return (
    <div className="space-y-6 select-none">
    <div className="glass-strong rounded-2xl p-6 sm:p-8">
    <button
    onClick={onBack}
    className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-white transition mb-4 sm:mb-6"
    >
    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 aspect-square shrink-0" />
    <span className="text-xs sm:text-sm">Назад</span>
    </button>

    <div className="flex items-center space-x-4 sm:space-x-6">
    {coverUrl ? (
      <img
      src={coverUrl}
      alt={info.artist.name}
      className="w-24 h-24 sm:w-36 sm:h-36 aspect-square rounded-full object-cover shadow-lg border border-white/10 shrink-0"
      />
    ) : (
      <div className="w-24 h-24 sm:w-36 sm:h-36 aspect-square rounded-full bg-gradient-to-br from-primary/30 to-cyber-purple/30 flex items-center justify-center shadow-lg border border-white/10 shrink-0">
      <Music2 className="w-12 h-12 sm:w-16 sm:h-16 aspect-square text-white/60 shrink-0" />
      </div>
    )}

    <div className="flex-1 min-w-0">
    <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 truncate">{info.artist.name}</h1>
    {info.artist.genres.length > 0 && (
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {info.artist.genres.map((genre, idx) => (
        <span
        key={idx}
        className="px-2.5 py-0.5 bg-white/10 rounded-full text-xs text-[var(--text-secondary)]"
        >
        {genre}
        </span>
      ))}
      </div>
    )}
    </div>
    </div>
    </div>

    <div>
    <div className="flex items-center justify-between mb-3 sm:mb-4">
    <h2
    onClick={handleToggleAllTracks}
    className="text-lg sm:text-2xl font-bold text-white cursor-pointer hover:text-primary transition flex items-center space-x-1.5 sm:space-x-2 group select-none"
    >
    <span>{showAllTracks ? "Все треки" : "Популярные треки"}</span>
    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 aspect-square text-[var(--text-secondary)] group-hover:text-primary group-hover:translate-x-1 transition-transform shrink-0" />
    </h2>

    <button
    onClick={handleToggleAllTracks}
    className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-white transition"
    >
    {loadingAllTracks ? "Загрузка..." : showAllTracks ? "Только популярные" : "Смотреть все"}
    </button>
    </div>

    <TrackList tracks={displayedTracks} onPlayTrack={onPlayTrack} />
    </div>

    {info.albums.length > 0 && (
      <div>
      <h2 className="text-lg sm:text-2xl font-bold text-white mb-3 sm:mb-4">Альбомы</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4.5">
      {info.albums.map((album) => {
        const albumCoverUrl = getAlbumCoverUrl(album.coverUri);
        return (
          <div
          key={album.id}
          onClick={() => onAlbumClick && onAlbumClick(album.id)}
          className="glass rounded-xl p-2.5 sm:p-3 hover:glass-strong transition cursor-pointer group max-w-[13rem] w-full"
          >
          {albumCoverUrl ? (
            <img
            src={albumCoverUrl}
            alt={album.title}
            className="w-full aspect-square rounded-lg object-cover mb-2 sm:mb-2.5 group-hover:scale-105 transition-transform shrink-0"
            />
          ) : (
            <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-cyber-purple/20 flex items-center justify-center mb-2 sm:mb-2.5 shrink-0">
            <Disc3 className="w-8 h-8 sm:w-9 sm:h-9 aspect-square text-white/40 shrink-0" />
            </div>
          )}
          <h3 className="text-xs sm:text-sm text-white font-medium truncate group-hover:text-primary transition">{album.title}</h3>
          {album.year && (
            <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] mt-0.5">{album.year}</p>
          )}
          </div>
        );
      })}
      </div>
      </div>
    )}
    </div>
  );
}
