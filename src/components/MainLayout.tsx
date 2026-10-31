import { useState, useEffect, useRef, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import Sidebar from "./Sidebar";
import WaveView from "./WaveView";
import LikedTracksView from "./LikedTracksView";
import PlaylistsView from "./PlaylistsView";
import SearchView from "./SearchView";
import ArtistView from "./ArtistView";
import AlbumView from "./AlbumView";
import Player from "./Player";
import WindowControls from "./player/WindowControls";
import { Track } from "../types";

interface MainLayoutProps {
  onLogout: () => void;
}

type View = "wave" | "liked" | "playlists" | "search" | "artist" | "album";

export default function MainLayout({ onLogout }: MainLayoutProps) {
  const [currentView, setCurrentView] = useState<View>("wave");
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [queue, setQueue] = useState<Track[]>([]);
  const [waveQueue, setWaveQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [isWaveMode, setIsWaveMode] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);

  const isFetchingWaveRef = useRef(false);
  const sessionSeenIdsRef = useRef<Set<string>>(new Set());
  const [isDirectClick, setIsDirectClick] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [waveLoading, setWaveLoading] = useState(false);
  const [waveError, setWaveError] = useState("");

  const queueRef = useRef(queue);
  queueRef.current = queue;
  const queueIndexRef = useRef(queueIndex);
  queueIndexRef.current = queueIndex;
  const isWaveModeRef = useRef(isWaveMode);
  isWaveModeRef.current = isWaveMode;
  const currentTrackRef = useRef(currentTrack);
  currentTrackRef.current = currentTrack;
  const shuffleRef = useRef(shuffle);
  shuffleRef.current = shuffle;

  const replenishWaveQueue = useCallback((activeQueue: Track[], activeIndex: number, track: Track) => {
    if (!isWaveModeRef.current || isFetchingWaveRef.current) return;

    const remaining = activeQueue.length - (activeIndex + 1);
    if (remaining <= 3) {
      isFetchingWaveRef.current = true;
      invoke<any>("get_next_wave_tracks", { recentTrackIds: [String(track.id)] })
        .then((response) => {
          const batch = response.sequence ? response.sequence.map((item: any) => item.track) : [];
          if (batch && batch.length > 0) {
            const fresh = batch.filter((t: Track) => !sessionSeenIdsRef.current.has(String(t.id)));
            fresh.forEach((t: Track) => sessionSeenIdsRef.current.add(String(t.id)));

            if (fresh.length > 0) {
              setQueue((prev) => [...prev, ...fresh]);
              setWaveQueue((prev) => [...prev, ...fresh]);
            }
          }
        })
        .catch((err) => console.error("Failed to replenish wave:", err))
        .finally(() => {
          isFetchingWaveRef.current = false;
        });
    }
  }, []);

  const startWaveSession = useCallback(async () => {
    try {
      setWaveLoading(true);
      setWaveError("");

      sessionSeenIdsRef.current.clear();
      const sessionResponse = await invoke<any>("start_wave_session");

      const initialTracks = sessionResponse.sequence
        ? sessionResponse.sequence.map((item: any) => item.track)
        : [];

      initialTracks.forEach((t: Track) => sessionSeenIdsRef.current.add(String(t.id)));

      setWaveQueue(initialTracks);
      setWaveLoading(false);
    } catch (err) {
      console.error("Failed to start wave session:", err);
      setWaveError("Failed to load wave tracks");
      setWaveLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentView === "wave" && waveQueue.length === 0 && !waveLoading) {
      startWaveSession();
    }
  }, [currentView, waveQueue.length, waveLoading, startWaveSession]);

  const handlePlayTrack = (track: Track, fromQueue?: Track[], fromWave = false) => {
    if (!fromQueue) return;

    const targetIndex = fromQueue.findIndex((t) => String(t.id) === String(track.id));

    setCurrentTrack(track);
    setIsPlaying(true);
    setIsWaveMode(fromWave);
    setIsDirectClick(true);
    setQueue(fromQueue);
    setQueueIndex(targetIndex !== -1 ? targetIndex : 0);

    if (fromWave) {
      setWaveQueue(fromQueue);
      invoke("send_rotor_feedback", {
        eventType: "trackStarted",
        trackId: String(track.id),
        playedSeconds: 0.0,
      }).catch(() => {});

      replenishWaveQueue(fromQueue, targetIndex !== -1 ? targetIndex : 0, track);
    }
  };

  const handleNextTrack = useCallback((isManual = true) => {
    const currentQ = queueRef.current;
    const currentIdx = queueIndexRef.current;
    const activeTrack = currentTrackRef.current;

    if (currentQ.length === 0) return;

    setIsDirectClick(false);

    if (isWaveModeRef.current && activeTrack) {
      const playedSeconds = audioRef.current ? audioRef.current.currentTime : 0;
      invoke("send_rotor_feedback", {
        eventType: isManual ? "skip" : "trackFinished",
        trackId: String(activeTrack.id),
        playedSeconds,
      }).catch(() => {});
    }

    let nextIndex: number;
    if (shuffleRef.current) {
      const availableIndices = currentQ
        .map((_, i) => i)
        .filter((i) => i !== currentIdx);

      if (availableIndices.length > 0) {
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      } else {
        nextIndex = (currentIdx + 1) % currentQ.length;
      }
    } else {
      if (isWaveModeRef.current) {
        nextIndex = currentIdx + 1;

        if (activeTrack) {
          replenishWaveQueue(currentQ, nextIndex, activeTrack);
        }

        if (nextIndex >= currentQ.length) {
          return;
        }
      } else {
        nextIndex = (currentIdx + 1) % currentQ.length;
      }
    }

    setQueueIndex(nextIndex);
    const nextTrack = currentQ[nextIndex];
    setCurrentTrack(nextTrack);
    setIsPlaying(true);

    if (isWaveModeRef.current && nextTrack) {
      invoke("send_rotor_feedback", {
        eventType: "trackStarted",
        trackId: String(nextTrack.id),
        playedSeconds: 0.0,
      }).catch(() => {});
    }
  }, [replenishWaveQueue]);

  const handlePrevTrack = useCallback(() => {
    const currentQ = queueRef.current;
    const currentIdx = queueIndexRef.current;

    if (currentQ.length === 0) return;

    setIsDirectClick(false);

    const prevIndex = currentIdx === 0 ? currentQ.length - 1 : currentIdx - 1;
    setQueueIndex(prevIndex);
    setCurrentTrack(currentQ[prevIndex]);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    const unlistenPlayPause = listen("tray-play-pause", () => {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
      }
    });

    const unlistenNext = listen("tray-next", () => {
      handleNextTrack(true);
    });

    const unlistenPrev = listen("tray-prev", () => {
      handlePrevTrack();
    });

    return () => {
      unlistenPlayPause.then((fn) => fn());
      unlistenNext.then((fn) => fn());
      unlistenPrev.then((fn) => fn());
    };
  }, [handleNextTrack, handlePrevTrack]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setCurrentView("search");
    }
  };

  const handleArtistClick = (artistId: number) => {
    setSelectedArtistId(artistId);
    setCurrentView("artist");
  };

  const handleAlbumClick = (albumId: number) => {
    setSelectedAlbumId(albumId);
    setCurrentView("album");
  };

  return (
    <div className="flex h-screen bg-[#0e0e12] overflow-hidden select-none">
      <audio
        ref={audioRef}
        id="main-audio"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <Sidebar
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v as View)}
        onLogout={onLogout}
        onSearch={handleSearch}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-[#121216] relative">
        <div data-tauri-drag-region className="h-10 flex-shrink-0 flex items-center justify-end px-3">
          <WindowControls />
        </div>

        <main className="flex-1 overflow-y-auto px-8 pb-8">
          {currentView === "wave" && (
            <WaveView
              queue={waveQueue}
              onPlayTrack={(track, tracks) => handlePlayTrack(track, tracks, true)}
              isLoading={waveLoading}
              error={waveError}
              onRetry={startWaveSession}
            />
          )}
          {currentView === "liked" && <LikedTracksView onPlayTrack={handlePlayTrack} />}
          {currentView === "playlists" && <PlaylistsView onPlayTrack={handlePlayTrack} />}
          {currentView === "search" && (
            <SearchView
              query={searchQuery}
              onPlayTrack={handlePlayTrack}
              onArtistClick={handleArtistClick}
              onAlbumClick={handleAlbumClick}
            />
          )}
          {currentView === "artist" && selectedArtistId && (
            <ArtistView
              artistId={selectedArtistId}
              onBack={() => setCurrentView("search")}
              onPlayTrack={handlePlayTrack}
              onAlbumClick={handleAlbumClick}
            />
          )}
          {currentView === "album" && selectedAlbumId && (
            <AlbumView
              albumId={selectedAlbumId}
              onBack={() => setCurrentView("search")}
              onPlayTrack={handlePlayTrack}
              onArtistClick={handleArtistClick}
            />
          )}
        </main>

        <Player
          track={currentTrack}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          shuffle={shuffle}
          onShuffleToggle={() => setShuffle(!shuffle)}
          isDirectClick={isDirectClick}
          audioRef={audioRef}
          onArtistClick={handleArtistClick}
        />
      </div>
    </div>
  );
}
