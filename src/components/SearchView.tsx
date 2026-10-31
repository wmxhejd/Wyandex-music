import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Search, Music2, Disc3 } from "lucide-react";
import TrackList from "./TrackList";
import { Track } from "../types";

interface SearchViewProps {
  query: string;
  onPlayTrack: (track: Track, tracks?: Track[]) => void;
  onArtistClick?: (artistId: number) => void;
  onAlbumClick?: (albumId: number) => void;
}

type SearchType = "top" | "track" | "artist" | "album";

interface Artist {
  id: number;
  name: string;
  cover?: {
    uri?: string;
  };
}

interface SearchAlbum {
  id: number;
  title: string;
  year?: number;
  coverUri?: string;
  artists: { id: number; name: string }[];
  trackCount?: number;
}

export default function SearchView({ query, onPlayTrack, onArtistClick, onAlbumClick }: SearchViewProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<SearchAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("top");

  useEffect(() => {
    if (query.trim()) {
      searchContent();
    } else {
      setTracks([]);
      setArtists([]);
      setAlbums([]);
    }
  }, [query, searchType]);

  const searchContent = async () => {
    try {
      setLoading(true);
      setError("");

      if (searchType === "top") {
        const results = await invoke<{ tracks: Track[]; artists: Artist[] }>("search_all", { query });
        setTracks(results.tracks || []);
        setArtists(results.artists || []);
        setAlbums([]);
      } else if (searchType === "track") {
        const trackResults = await invoke<Track[]>("search_tracks", { query, searchType: "track" });
        setTracks(trackResults);
        setArtists([]);
        setAlbums([]);
      } else if (searchType === "artist") {
        const results = await invoke<{ tracks: Track[]; artists: Artist[] }>("search_all", { query });
        setArtists(results.artists || []);
        setTracks(results.tracks?.slice(0, 10) || []);
        setAlbums([]);
      } else if (searchType === "album") {
        const albumResults = await invoke<SearchAlbum[]>("search_albums", { query });
        setAlbums(albumResults);
        setTracks([]);
        setArtists([]);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const filters: { type: SearchType; label: string }[] = [
    { type: "top", label: "Топ" },
    { type: "track", label: "Треки" },
    { type: "artist", label: "Исполнители" },
    { type: "album", label: "Альбомы" },
  ];

  const getArtistCoverUrl = (artist: Artist) => {
    const uri = artist.cover?.uri;
    if (!uri) return undefined;
    return `https://${uri.replace("%%", "300x300")}`;
  };

  const getAlbumCoverUrl = (uri?: string) => {
    if (!uri) return undefined;
    return `https://${uri.replace("%%", "300x300")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <Search size={32} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Ошибка поиска</h2>
          <p className="text-[var(--text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Music2 size={40} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Ищите музыку</h2>
          <p className="text-[var(--text-secondary)]">Треки, исполнители и альбомы</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        {filters.map((filter) => (
          <button
            key={filter.type}
            onClick={() => setSearchType(filter.type)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              searchType === filter.type
                ? "bg-[#ffcc00] text-black shadow-lg"
                : "glass text-white hover:glass-strong hover:scale-105"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {searchType === "top" && (
        <div className="space-y-6">
          {artists.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Исполнители</h2>
              <div className="flex gap-6 overflow-x-auto pb-4">
                {artists.map((artist) => {
                  const coverUrl = getArtistCoverUrl(artist);
                  return (
                    <div
                      key={artist.id}
                      className="flex flex-col items-center cursor-pointer group flex-shrink-0"
                      onClick={() => onArtistClick && onArtistClick(artist.id)}
                    >
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={artist.name}
                          className="w-32 h-32 rounded-full object-cover shadow-lg border border-white/10 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-cyber-purple/30 flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
                          <Music2 size={48} className="text-white/60" />
                        </div>
                      )}
                      <p className="mt-3 text-white font-medium text-center max-w-[128px] truncate">
                        {artist.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tracks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Треки</h2>
              <TrackList tracks={tracks.slice(0, 15)} onPlayTrack={onPlayTrack} />
            </div>
          )}
        </div>
      )}

      {searchType === "track" && tracks.length > 0 && (
        <TrackList tracks={tracks} onPlayTrack={onPlayTrack} />
      )}

      {searchType === "artist" && artists.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {artists.map((artist) => {
            const coverUrl = getArtistCoverUrl(artist);
            return (
              <div
                key={artist.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => onArtistClick && onArtistClick(artist.id)}
              >
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={artist.name}
                    className="w-full aspect-square rounded-full object-cover shadow-lg border border-white/10 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-full bg-gradient-to-br from-primary/30 to-cyber-purple/30 flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
                    <Music2 size={64} className="text-white/60" />
                  </div>
                )}
                <p className="mt-3 text-white font-medium text-center w-full truncate px-2">
                  {artist.name}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {searchType === "album" && (
        <div>
          {albums.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {albums.map((album) => {
                const coverUrl = getAlbumCoverUrl(album.coverUri);
                return (
                  <div
                    key={album.id}
                    onClick={() => onAlbumClick && onAlbumClick(album.id)}
                    className="glass rounded-xl p-4 hover:glass-strong transition cursor-pointer group"
                  >
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={album.title}
                        className="w-full aspect-square rounded-lg object-cover mb-3 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-cyber-purple/20 flex items-center justify-center mb-3">
                        <Disc3 size={48} className="text-white/40" />
                      </div>
                    )}
                    <h3 className="text-white font-medium truncate group-hover:text-primary transition">{album.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {album.artists.map((a) => a.name).join(", ")}
                    </p>
                    {album.year && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{album.year}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Disc3 size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">Альбомы не найдены</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
