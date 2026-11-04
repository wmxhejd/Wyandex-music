import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ListMusic, ArrowLeft } from "lucide-react";
import TrackList from "./TrackList";
import { Playlist, Track } from "../types";

interface PlaylistsViewProps {
  onPlayTrack: (track: Track, tracks?: Track[], sourceTitle?: string) => void;
}

export default function PlaylistsView({ onPlayTrack }: PlaylistsViewProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const data = await invoke<Playlist[]>("get_playlists");
      setPlaylists(data);
    } catch (err) {
      console.error("Failed to load playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylistTracks = async (playlist: Playlist) => {
    try {
      setLoadingTracks(true);
      setSelectedPlaylist(playlist);
      const tracks = await invoke<Track[]>("get_playlist_tracks", { kind: playlist.kind });
      setPlaylistTracks(tracks);
    } catch (err) {
      console.error("Failed to load playlist tracks:", err);
    } finally {
      setLoadingTracks(false);
    }
  };

  const handleBackToPlaylists = () => {
    setSelectedPlaylist(null);
    setPlaylistTracks([]);
  };

  const getCoverUrl = (playlist: Playlist) => {
    const coverUri = playlist.cover?.uri
    || playlist.cover?.itemsUri?.[0]
    || playlist.ogImage;

    if (!coverUri) return undefined;

    const formatted = coverUri.replace("%%", "300x300");
    return formatted.startsWith("http") ? formatted : `https://${formatted}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selectedPlaylist) {
    if (loadingTracks) {
      return (
        <div className="flex items-center justify-center py-32">
        <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/50 text-xs sm:text-sm">Загрузка треков...</p>
        </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 select-none max-w-5xl">
      <button
      onClick={handleBackToPlaylists}
      className="flex items-center space-x-2 text-white/50 hover:text-white transition-colors mb-2"
      >
      <ArrowLeft className="w-4 h-4 aspect-square shrink-0" />
      <span className="text-xs sm:text-sm font-medium">Назад к плейлистам</span>
      </button>

      <div>
      <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">{selectedPlaylist.title}</h1>
      <p className="text-xs sm:text-sm text-white/40 mt-0.5 sm:mt-1">
      {playlistTracks.length} треков
      </p>
      </div>

      <TrackList
      tracks={playlistTracks}
      onPlayTrack={(track, tracks) => onPlayTrack(track, tracks, selectedPlaylist.title)}
      />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 select-none max-w-5xl">
    <div>
    <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Плейлисты</h1>
    <p className="text-xs sm:text-sm text-white/40 mt-0.5 sm:mt-1">{playlists.length} плейлистов</p>
    </div>

    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4.5">
    {playlists.map((playlist) => {
      const coverUrl = getCoverUrl(playlist);

      return (
        <div
        key={playlist.kind}
        onClick={() => loadPlaylistTracks(playlist)}
        className="p-2.5 sm:p-3 hover:bg-white/[0.04] rounded-2xl transition cursor-pointer group max-w-[13rem] w-full"
        >
        {coverUrl ? (
          <img
          src={coverUrl}
          alt={playlist.title}
          className="w-full aspect-square rounded-xl mb-2 sm:mb-2.5 object-cover shadow-lg group-hover:scale-105 transition-transform shrink-0"
          />
        ) : (
          <div className="aspect-square bg-white/[0.05] rounded-xl mb-2 sm:mb-2.5 flex items-center justify-center shrink-0">
          <ListMusic className="w-8 h-8 sm:w-10 sm:h-10 aspect-square text-white/30 shrink-0" />
          </div>
        )}
        <h3 className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-[#ffcc00] transition-colors">
        {playlist.title}
        </h3>
        <p className="text-[10px] sm:text-xs text-white/40 mt-0.5">
        {playlist.trackCount} треков
        </p>
        </div>
      );
    })}
    </div>
    </div>
  );
}
