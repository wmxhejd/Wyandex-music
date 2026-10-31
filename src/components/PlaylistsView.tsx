import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ListMusic, ArrowLeft } from "lucide-react";
import TrackList from "./TrackList";
import { Playlist, Track } from "../types";

interface PlaylistsViewProps {
  onPlayTrack: (track: Track, tracks?: Track[]) => void;
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
    // Priority: cover.uri -> cover.itemsUri[0] -> ogImage
    const coverUri = playlist.cover?.uri
      || playlist.cover?.itemsUri?.[0]
      || playlist.ogImage;

    if (!coverUri) return undefined;

    const formatted = coverUri.replace('%%', '300x300');
    return formatted.startsWith('http') ? formatted : `https://${formatted}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="glass rounded-2xl p-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Show playlist tracks view
  if (selectedPlaylist) {
    if (loadingTracks) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--text-secondary)]">Загрузка треков...</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-6">
          <button
            onClick={handleBackToPlaylists}
            className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-white transition mb-4"
          >
            <ArrowLeft size={20} />
            <span>Назад к плейлистам</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">{selectedPlaylist.title}</h1>
          <p className="text-[var(--text-secondary)]">
            {playlistTracks.length} треков
          </p>
        </div>
        <TrackList tracks={playlistTracks} onPlayTrack={onPlayTrack} />
      </div>
    );
  }

  // Show playlists grid
  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-2xl p-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-primary to-cyber-blue p-4 rounded-2xl">
            <ListMusic size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Плейлисты</h1>
            <p className="text-[var(--text-secondary)]">{playlists.length} плейлистов</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {playlists.map((playlist) => {
          const coverUrl = getCoverUrl(playlist);

          return (
            <div
              key={playlist.kind}
              onClick={() => loadPlaylistTracks(playlist)}
              className="glass rounded-xl p-4 hover:glass-strong transition-all cursor-pointer group"
            >
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={playlist.title}
                  className="w-full aspect-square rounded-lg mb-3 object-cover"
                />
              ) : (
                <div className="aspect-square bg-gradient-to-br from-cyber-purple to-cyber-blue rounded-lg mb-3 flex items-center justify-center">
                  <ListMusic size={48} className="text-white opacity-50" />
                </div>
              )}
              <h3 className="font-semibold text-white truncate group-hover:text-primary transition">
                {playlist.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {playlist.trackCount} треков
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
