import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import Sidebar from "./Sidebar";
import WaveView from "./WaveView";
import LikedTracksView from "./LikedTracksView";
import PlaylistsView from "./PlaylistsView";
import HistoryView from "./HistoryView";
import SearchView from "./SearchView";
import ArtistView from "./ArtistView";
import AlbumView from "./AlbumView";
import SettingsView from "./SettingsView";
import Player, { PlayerHandle } from "./Player";
import WindowControls from "./player/WindowControls";
import AuraBackground from "./player/AuraBackground";
import { useCoverColors } from "../hooks/useCoverColors";
import { Track } from "../types";

interface MainLayoutProps {
  onLogout: () => void;
}

type View = "wave" | "liked" | "playlists" | "history" | "search" | "artist" | "album" | "settings";

const VIEW_AURAS: Record<Exclude<View, "wave">, { c1: string; c2: string; c3: string }> = {
  liked: {
    c1: "#ff1744",
    c2: "#ff4081",
    c3: "#f50057",
  },
  playlists: {
    c1: "#3d5afe",
    c2: "#00e5ff",
    c3: "#651fff",
  },
  history: {
    c1: "#06b6d4",
    c2: "#3b82f6",
    c3: "#0284c7",
  },
  search: {
    c1: "#ff9100",
    c2: "#ffab00",
    c3: "#ffd600",
  },
  settings: {
    c1: "#d500f9",
    c2: "#7c4dff",
    c3: "#651fff",
  },
  artist: {
    c1: "#651fff",
    c2: "#d500f9",
    c3: "#2979ff",
  },
  album: {
    c1: "#ff6d00",
    c2: "#ff9100",
    c3: "#ff1744",
  },
};

export default function MainLayout({ onLogout }: MainLayoutProps) {
  const [currentView, setCurrentView] = useState<View>("wave");
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSourceTitle, setPlaybackSourceTitle] = useState<string | null>(null);
  const [isWaveMode, setIsWaveMode] = useState(false);

  const waveQueueRef = useRef<Track[]>([]);
  const waveIndexRef = useRef<number>(0);
  const waveTrackRef = useRef<Track | null>(null);
  const [waveQueue, setWaveQueue] = useState<Track[]>([]);

  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("wyandexmusic_volume") || localStorage.getItem("yandexarbuz_volume");
    return saved ? parseInt(saved, 10) : 80;
  });

  const [masterAuraEnabled, setMasterAuraEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("wyandexmusic_aura_master_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [masterAuraBrightness, setMasterAuraBrightness] = useState<number>(() => {
    const saved = localStorage.getItem("wyandexmusic_aura_brightness");
    return saved !== null ? parseInt(saved, 10) : 100;
  });

  const [transitionDuration, setTransitionDuration] = useState<number>(() => {
    const saved = localStorage.getItem("wyandexmusic_aura_transition");
    return saved !== null ? parseFloat(saved) : 1.5;
  });

  const [animSpeed, setAnimSpeed] = useState<number>(() => {
    const saved = localStorage.getItem("wyandexmusic_aura_anim_speed");
    return saved !== null ? parseFloat(saved) : 1.0;
  });

  const [tabGlowConfigs, setTabGlowConfigs] = useState<Record<string, { enabled: boolean; brightness: number }>>(() => {
    const saved = localStorage.getItem("wyandexmusic_tab_glow_configs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  useEffect(() => {
    const updateAura = () => {
      const e = localStorage.getItem("wyandexmusic_aura_master_enabled");
      if (e !== null) setMasterAuraEnabled(e === "true");
      const b = localStorage.getItem("wyandexmusic_aura_brightness");
      if (b !== null) setMasterAuraBrightness(parseInt(b, 10));
      const t = localStorage.getItem("wyandexmusic_aura_transition");
      if (t !== null) setTransitionDuration(parseFloat(t));
      const s = localStorage.getItem("wyandexmusic_aura_anim_speed");
      if (s !== null) setAnimSpeed(parseFloat(s));
      const cfgs = localStorage.getItem("wyandexmusic_tab_glow_configs");
      if (cfgs) {
        try {
          setTabGlowConfigs(JSON.parse(cfgs));
        } catch {}
      }
    };

    window.addEventListener("aura-settings-updated", updateAura);
    return () => window.removeEventListener("aura-settings-updated", updateAura);
  }, []);

  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);

  const isDraggingVolRef = useRef(false);
  const isFetchingWaveRef = useRef(false);
  const sessionSeenIdsRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);
  const [waveLoading, setWaveLoading] = useState(false);
  const [waveError, setWaveError] = useState("");
  const playerRef = useRef<PlayerHandle | null>(null);

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
  const repeatRef = useRef(repeat);
  repeatRef.current = repeat;

  const activeWaveTrack = currentTrack || waveQueue[0] || null;
  const waveCoverUrl = activeWaveTrack?.coverUri
  ? `https://${activeWaveTrack.coverUri.replace("%%", "600x600")}`
  : undefined;
  const waveTrackSeed = activeWaveTrack ? `${activeWaveTrack.title}-${activeWaveTrack.id}` : "wave";
  const waveCoverColors = useCoverColors(waveCoverUrl, waveTrackSeed);

  const activeAuraColors = useMemo(() => {
    if (currentView === "wave") {
      return waveCoverColors;
    }
    return VIEW_AURAS[currentView] || VIEW_AURAS.settings;
  }, [currentView, waveCoverColors]);

  const currentTabCfg = tabGlowConfigs[currentView];
  const isCurrentAuraEnabled = masterAuraEnabled && (currentTabCfg ? currentTabCfg.enabled : true);
  const tabBrightnessFactor = currentTabCfg ? currentTabCfg.brightness / 100 : 1;
  const effectiveAuraBrightness = Math.round(masterAuraBrightness * tabBrightnessFactor);

  const isWaveIdle = currentView === "wave" && !currentTrack && waveQueue.length === 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTime = () => {
      setCurrentTime(audio.currentTime);
      const d = audio.duration;
      if (!isNaN(d) && d > 0) {
        setDuration(d);
      } else if (currentTrackRef.current) {
        setDuration(currentTrackRef.current.durationMs / 1000);
      }
    };

    const handleEnd = () => {
      if (repeatRef.current) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNextTrack(false);
      }
    };

    const handleVol = () => {
      if (isDraggingVolRef.current) return;
      const linearVal = Math.round(Math.cbrt(audio.volume) * 100);
      const clampedVal = Math.min(100, Math.max(0, linearVal));
      setVolume(clampedVal);
      localStorage.setItem("wyandexmusic_volume", String(clampedVal));
    };

    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("seeked", handleTime);
    audio.addEventListener("loadedmetadata", handleTime);
    audio.addEventListener("ended", handleEnd);
    audio.addEventListener("volumechange", handleVol);

    return () => {
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("seeked", handleTime);
      audio.removeEventListener("loadedmetadata", handleTime);
      audio.removeEventListener("ended", handleEnd);
      audio.removeEventListener("volumechange", handleVol);
    };
  }, []);

  const replenishWaveQueue = useCallback(async (activeTrack?: Track) => {
    if (isFetchingWaveRef.current) return;
    isFetchingWaveRef.current = true;

    try {
      const trackId = activeTrack ? String(activeTrack.id) : (waveTrackRef.current ? String(waveTrackRef.current.id) : "");
      const response = await invoke<any>("get_next_wave_tracks", {
        recentTrackIds: trackId ? [trackId] : [],
      });

      const batch = response.sequence ? response.sequence.map((item: any) => item.track) : [];
      if (batch && batch.length > 0) {
        const fresh = batch.filter((t: Track) => !sessionSeenIdsRef.current.has(String(t.id)));
        fresh.forEach((t: Track) => sessionSeenIdsRef.current.add(String(t.id)));

        if (fresh.length > 0) {
          waveQueueRef.current = [...waveQueueRef.current, ...fresh];
          setWaveQueue([...waveQueueRef.current]);
          if (isWaveModeRef.current) {
            setQueue([...waveQueueRef.current]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to replenish wave:", err);
    } finally {
      isFetchingWaveRef.current = false;
    }
  }, []);

  const recordTrackToHistory = (track: Track) => {
    try {
      const raw = localStorage.getItem("wyandexmusic_history");
      const list: Track[] = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((t) => String(t.id) !== String(track.id));
      const updated = [track, ...filtered].slice(0, 100);
      localStorage.setItem("wyandexmusic_history", JSON.stringify(updated));
    } catch {}
  };

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

      waveQueueRef.current = initialTracks;
      waveIndexRef.current = 0;
      setWaveQueue(initialTracks);
      setWaveLoading(false);

      if (initialTracks.length > 0) {
        waveTrackRef.current = initialTracks[0];
        handlePlayTrack(initialTracks[0], initialTracks, true, null, 0);
      }
    } catch (err) {
      console.error("Failed to start wave session:", err);
      setWaveError("Failed to load wave tracks");
      setWaveLoading(false);
    }
  }, []);

  const handlePlayTrack = (
    track: Track,
    fromQueue?: Track[],
    fromWave = false,
    sourceTitle?: string | null,
    forcedIndex?: number
  ) => {
    if (!fromQueue) return;

    const targetIndex = forcedIndex !== undefined
    ? forcedIndex
    : fromQueue.findIndex((t) => String(t.id) === String(track.id));

    setCurrentTrack(track);
    setIsPlaying(true);
    setIsWaveMode(fromWave);
    setQueue(fromQueue);
    setQueueIndex(targetIndex !== -1 ? targetIndex : 0);
    setPlaybackSourceTitle(fromWave ? null : (sourceTitle || null));

    recordTrackToHistory(track);

    if (fromWave) {
      waveTrackRef.current = track;
      waveIndexRef.current = targetIndex !== -1 ? targetIndex : 0;

      invoke("send_rotor_feedback", {
        eventType: "trackStarted",
        trackId: String(track.id),
             playedSeconds: 0.0,
      }).catch(() => {});

      const remaining = fromQueue.length - (waveIndexRef.current + 1);
      if (remaining <= 5) {
        replenishWaveQueue(track);
      }
    }

    const nextTrack = fromQueue[(targetIndex !== -1 ? targetIndex : 0) + 1];
    if (nextTrack) {
      if (nextTrack.coverUri) {
        const img = new Image();
        img.src = `https://${nextTrack.coverUri.replace("%%", "600x600")}`;
      }
      invoke<string>("get_stream_url", { trackId: nextTrack.id }).catch(() => {});
    }
  };

  const handleDropToWave = () => {
    setPlaybackSourceTitle(null);
    setIsWaveMode(true);
    setCurrentView("wave");
    startWaveSession();
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleNextTrack = useCallback(async (isManual = true) => {
    const currentQ = queueRef.current;
    const currentIdx = queueIndexRef.current;
    const activeTrack = currentTrackRef.current;

    if (currentQ.length === 0) return;

    if (isWaveModeRef.current && activeTrack) {
      const playedSeconds = audioRef.current ? audioRef.current.currentTime : 0;
      invoke("send_rotor_feedback", {
        eventType: isManual ? "skip" : "trackFinished",
        trackId: String(activeTrack.id),
             playedSeconds,
      }).catch(() => {});
    }

    let nextIndex: number;
    if (shuffleRef.current && !isWaveModeRef.current) {
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

        const remaining = waveQueueRef.current.length - (nextIndex + 1);
        if (remaining <= 5) {
          replenishWaveQueue(activeTrack || undefined);
        }

        if (nextIndex >= waveQueueRef.current.length) {
          setWaveLoading(true);
          await replenishWaveQueue(activeTrack || undefined);
          setWaveLoading(false);
          if (nextIndex >= waveQueueRef.current.length) {
            return;
          }
        }
      } else {
        nextIndex = (currentIdx + 1) % currentQ.length;
      }
    }

    const currentList = isWaveModeRef.current ? waveQueueRef.current : currentQ;
    const nextTrack = currentList[nextIndex];
    if (!nextTrack) return;

    setQueueIndex(nextIndex);
    setCurrentTrack(nextTrack);
    setIsPlaying(true);
    recordTrackToHistory(nextTrack);

    if (isWaveModeRef.current) {
      waveIndexRef.current = nextIndex;
      waveTrackRef.current = nextTrack;

      invoke("send_rotor_feedback", {
        eventType: "trackStarted",
        trackId: String(nextTrack.id),
             playedSeconds: 0.0,
      }).catch(() => {});
    }

    const followingTrack = currentList[nextIndex + 1];
    if (followingTrack) {
      if (followingTrack.coverUri) {
        const img = new Image();
        img.src = `https://${followingTrack.coverUri.replace("%%", "600x600")}`;
      }
      invoke<string>("get_stream_url", { trackId: followingTrack.id }).catch(() => {});
    }
  }, [replenishWaveQueue]);

  const handleDislikeTrack = useCallback(() => {
    const activeTrack = currentTrackRef.current;
    if (isWaveModeRef.current && activeTrack) {
      const playedSeconds = audioRef.current ? audioRef.current.currentTime : 0;
      invoke("send_rotor_feedback", {
        eventType: "dislike",
        trackId: String(activeTrack.id),
             playedSeconds,
      }).catch(() => {});
    }
    handleNextTrack(true);
  }, [handleNextTrack]);

  const handlePrevTrack = useCallback(() => {
    const currentQ = isWaveModeRef.current ? waveQueueRef.current : queueRef.current;
    const currentIdx = isWaveModeRef.current ? waveIndexRef.current : queueIndexRef.current;

    if (currentQ.length === 0) return;

    const prevIndex = currentIdx === 0 ? currentQ.length - 1 : currentIdx - 1;
    const prevTrack = currentQ[prevIndex];
    if (!prevTrack) return;

    setQueueIndex(prevIndex);
    setCurrentTrack(prevTrack);
    setIsPlaying(true);
    recordTrackToHistory(prevTrack);

    if (isWaveModeRef.current) {
      waveIndexRef.current = prevIndex;
      waveTrackRef.current = prevTrack;
    }
  }, []);

  const handleSeekSeconds = (secs: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = secs;
      setCurrentTime(secs);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const norm = val / 100;
    setVolume(val);
    localStorage.setItem("wyandexmusic_volume", String(val));
    if (audioRef.current) {
      audioRef.current.volume = Math.pow(norm, 3);
    }
  };

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

  const handleArtistClick = (artistId: number) => {
    setSelectedArtistId(artistId);
    setCurrentView("artist");
  };

  const handleAlbumClick = (albumId: number) => {
    setSelectedAlbumId(albumId);
    setCurrentView("album");
  };

  return (
    <div className="flex h-screen w-screen bg-[#07070a] overflow-hidden select-none relative">
    <audio
    ref={audioRef}
    id="main-audio"
    onPlay={() => setIsPlaying(true)}
    onPause={() => setIsPlaying(false)}
    />

    <AuraBackground
    colors={activeAuraColors}
    isPlaying={isPlaying}
    position="center"
    brightness={effectiveAuraBrightness}
    enabled={isCurrentAuraEnabled}
    isIdle={isWaveIdle}
    transitionDuration={transitionDuration}
    animSpeed={animSpeed}
    />

    {!isPlayerExpanded && (
      <Sidebar
      currentView={currentView}
      onViewChange={(v) => setCurrentView(v as View)}
      />
    )}

    <div className="flex-1 flex flex-col overflow-hidden relative w-full h-full">
    {!isPlayerExpanded && (
      <div className="absolute top-2.5 right-3.5 z-40 flex items-center pointer-events-auto">
      <WindowControls />
      </div>
    )}

    <div data-tauri-drag-region className="absolute top-0 left-0 right-16 h-10 z-30" />

    <main className="flex-1 overflow-y-auto relative w-full h-full">
    {currentView === "wave" && (
      <WaveView
      queue={isWaveMode ? waveQueue : queue}
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      currentTime={currentTime}
      duration={duration}
      volume={volume}
      repeat={repeat}
      shuffle={shuffle}
      sourceTitle={playbackSourceTitle}
      isWaveMode={isWaveMode}
      onDropToWave={handleDropToWave}
      onPlayTrack={(track, tracks) => handlePlayTrack(track, tracks, isWaveMode, playbackSourceTitle)}
      onPlayPause={handlePlayPause}
      onNextTrack={handleNextTrack}
      onPrevTrack={handlePrevTrack}
      onDislikeTrack={handleDislikeTrack}
      onSeek={handleSeekSeconds}
      onVolumeChange={handleVolumeChange}
      onIsDraggingVol={(d) => { isDraggingVolRef.current = d; }}
      onRepeatToggle={() => setRepeat(!repeat)}
      onShuffleToggle={() => setShuffle(!shuffle)}
      onOpenLyrics={() => playerRef.current?.openLyrics()}
      onOpenExpanded={() => playerRef.current?.openExpanded()}
      isLoading={waveLoading}
      error={waveError}
      onRetry={startWaveSession}
      onArtistClick={handleArtistClick}
      onStartWaveSession={startWaveSession}
      />
    )}
    {currentView === "liked" && (
      <div className="p-8 pt-16 pl-80">
      <LikedTracksView onPlayTrack={(track, tracks) => handlePlayTrack(track, tracks, false, "Мне нравится")} />
      </div>
    )}
    {currentView === "playlists" && (
      <div className="p-8 pt-16 pl-80">
      <PlaylistsView onPlayTrack={(track, tracks, title) => handlePlayTrack(track, tracks, false, title)} />
      </div>
    )}
    {currentView === "history" && (
      <div className="p-8 pt-16 pl-80">
      <HistoryView onPlayTrack={(track, tracks, title) => handlePlayTrack(track, tracks, false, title || "История")} />
      </div>
    )}
    {currentView === "search" && (
      <div className="p-8 pt-16 pl-80">
      <SearchView
      query={searchQuery}
      onQueryChange={setSearchQuery}
      onPlayTrack={(track, tracks) => handlePlayTrack(track, tracks, false, "Поиск")}
      onArtistClick={handleArtistClick}
      onAlbumClick={handleAlbumClick}
      />
      </div>
    )}
    {currentView === "artist" && selectedArtistId && (
      <div className="p-8 pt-16 pl-80">
      <ArtistView
      artistId={selectedArtistId}
      onBack={() => setCurrentView("search")}
      onPlayTrack={(track, tracks) => handlePlayTrack(track, tracks, false, "Исполнитель")}
      onAlbumClick={handleAlbumClick}
      />
      </div>
    )}
    {currentView === "album" && selectedAlbumId && (
      <div className="p-8 pt-16 pl-80">
      <AlbumView
      albumId={selectedAlbumId}
      onBack={() => setCurrentView("search")}
      onPlayTrack={(track, tracks) => handlePlayTrack(track, tracks, false, "Альбом")}
      onArtistClick={handleArtistClick}
      />
      </div>
    )}
    {currentView === "settings" && (
      <div className="p-8 pt-16 pl-80">
      <SettingsView onLogout={onLogout} />
      </div>
    )}
    </main>

    <Player
    ref={playerRef}
    track={currentTrack}
    isPlaying={isPlaying}
    setIsPlaying={setIsPlaying}
    onNextTrack={handleNextTrack}
    onPrevTrack={handlePrevTrack}
    shuffle={shuffle}
    onShuffleToggle={() => setShuffle(!shuffle)}
    audioRef={audioRef}
    onArtistClick={handleArtistClick}
    hideBottomBar={currentView === "wave"}
    onExpandedChange={setIsPlayerExpanded}
    />
    </div>
    </div>
  );
}
