import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Search, Music2, Disc3, X } from "lucide-react";
import TrackList from "./TrackList";
import { Track } from "../types";

interface SearchViewProps {
  query: string;
  onQueryChange: (q: string) => void;
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

export default function SearchView({ query, onQueryChange, onPlayTrack, onArtistClick, onAlbumClick }: SearchViewProps) {
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

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl select-none">
    <div className="relative border-b border-white/10 focus-within:border-[#ffcc00] transition-colors pb-2.5 sm:pb-3">
    <Search className="absolute left-1 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5 sm:w-6 sm:h-6 aspect-square shrink-0" />
    <input
    type="text"
    autoFocus
    value={query}
    onChange={(e) => onQueryChange(e.target.value)}
    placeholder="Что хотите послушать?"
    className="w-full bg-transparent pl-8 sm:pl-11 pr-8 py-1 text-xl sm:text-3xl font-black text-white placeholder:text-white/25 focus:outline-none tracking-tight"
    />
    {query && (
      <button
      onClick={() => onQueryChange("")}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition w-4 h-4 sm:w-5 sm:h-5 aspect-square shrink-0 flex items-center justify-center"
      >
      <X className="w-4 h-4 sm:w-5 sm:h-5 aspect-square shrink-0" />
      </button>
    )}
    </div>

    <div className="flex items-center space-x-5 sm:space-x-8">
    {filters.map((filter) => (
      <button
      key={filter.type}
      onClick={() => setSearchType(filter.type)}
      className={`relative pb-2 text-xs sm:text-sm font-bold transition-all ${
        searchType === filter.type
        ? "text-[#ffcc00]"
        : "text-white/40 hover:text-white"
      }`}
      >
      <span>{filter.label}</span>
      {searchType === filter.type && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffcc00] shadow-[0_0_12px_rgba(255,204,0,0.8)]" />
      )}
      </button>
    ))}
    </div>

    {loading && (
      <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-3 border-[#ffcc00] border-t-transparent rounded-full animate-spin" />
      </div>
    )}

    {error && (
      <div className="text-center py-10 text-red-400 text-xs sm:text-sm">
      {error}
      </div>
    )}

    {!loading && !query.trim() && (
      <div className="flex flex-col items-center justify-center py-20 text-center">
      <Music2 className="text-white/20 mb-3 stroke-[1.5] w-10 h-10 sm:w-11 sm:h-11 aspect-square shrink-0" />
      <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">Поиск треков, артистов и альбомов</h2>
      <p className="text-xs text-white/40 mt-1">Введите название песни, имя исполнителя или альбом выше</p>
      </div>
    )}

    {!loading && query.trim() && searchType === "top" && (
      <div className="space-y-6 sm:space-y-8">
      {artists.length > 0 && (
        <div>
        <h2 className="text-base sm:text-lg font-bold text-white mb-3">Исполнители</h2>
        <div className="flex gap-4 overflow-x-auto pb-3">
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
              className="w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-full object-cover shadow-xl border border-white/10 group-hover:scale-105 transition-transform shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-full bg-white/[0.06] flex items-center justify-center shadow-xl border border-white/10 group-hover:scale-105 transition-transform shrink-0">
              <Music2 className="w-7 h-7 sm:w-8 sm:h-8 aspect-square shrink-0 text-white/40" />
              </div>
            )}
            <p className="mt-2 text-xs text-white font-semibold text-center max-w-[80px] sm:max-w-[96px] truncate">
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
        <h2 className="text-base sm:text-lg font-bold text-white mb-3">Треки</h2>
        <TrackList tracks={tracks.slice(0, 15)} onPlayTrack={onPlayTrack} />
        </div>
      )}
      </div>
    )}

    {!loading && query.trim() && searchType === "track" && tracks.length > 0 && (
      <TrackList tracks={tracks} onPlayTrack={onPlayTrack} />
    )}

    {!loading && query.trim() && searchType === "artist" && artists.length > 0 && (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-5">
      {artists.map((artist) => {
        const coverUrl = getArtistCoverUrl(artist);
        return (
          <div
          key={artist.id}
          className="flex flex-col items-center cursor-pointer group text-center"
          onClick={() => onArtistClick && onArtistClick(artist.id)}
          >
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 aspect-square rounded-full overflow-hidden shadow-xl border border-white/10 group-hover:scale-105 transition-transform shrink-0">
          {coverUrl ? (
            <img
            src={coverUrl}
            alt={artist.name}
            className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/[0.06] flex items-center justify-center">
            <Music2 className="w-8 h-8 sm:w-10 sm:h-10 aspect-square shrink-0 text-white/40" />
            </div>
          )}
          </div>
          <p className="mt-2 text-xs sm:text-sm text-white font-semibold w-full truncate px-1">
          {artist.name}
          </p>
          </div>
        );
      })}
      </div>
    )}

    {!loading && query.trim() && searchType === "album" && (
      <div>
      {albums.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4.5">
        {albums.map((album) => {
          const coverUrl = getAlbumCoverUrl(album.coverUri);
          return (
            <div
            key={album.id}
            onClick={() => onAlbumClick && onAlbumClick(album.id)}
            className="p-2.5 sm:p-3 hover:bg-white/[0.04] rounded-2xl transition cursor-pointer group max-w-[13rem] w-full"
            >
            {coverUrl ? (
              <img
              src={coverUrl}
              alt={album.title}
              className="w-full aspect-square rounded-xl object-cover mb-2 sm:mb-2.5 group-hover:scale-105 transition-transform shadow-lg shrink-0"
              />
            ) : (
              <div className="w-full aspect-square rounded-xl bg-white/[0.05] flex items-center justify-center mb-2 sm:mb-2.5 shrink-0">
              <Disc3 className="w-8 h-8 sm:w-9 sm:h-9 aspect-square shrink-0 text-white/40" />
              </div>
            )}
            <h3 className="text-xs sm:text-sm text-white font-semibold truncate group-hover:text-[#ffcc00] transition">
            {album.title}
            </h3>
            <p className="text-[10px] sm:text-xs text-white/40 truncate mt-0.5">
            {album.artists.map((a) => a.name).join(", ")}
            </p>
            </div>
          );
        })}
        </div>
      ) : (
        <div className="text-center py-16 text-white/30 text-xs sm:text-sm">
        Альбомы не найдены
        </div>
      )}
      </div>
    )}
    </div>
  );
}
