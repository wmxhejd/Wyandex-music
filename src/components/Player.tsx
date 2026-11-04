import { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Track } from "../types";
import { useLikes } from "../context/LikesContext";
import { parseLrc } from "../utils/lrcParser";
import ExpandedPlayer from "./player/ExpandedPlayer";
import BottomBar from "./player/BottomBar";
import { ProviderItem } from "./player/MoreMenu";

interface PlayerProps {
  track: Track | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onNextTrack: (isManual?: boolean) => void;
  onPrevTrack: () => void;
  shuffle: boolean;
  onShuffleToggle: () => void;
  repeat: boolean;
  onRepeatToggle: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onArtistClick?: (artistId: number) => void;
  hideBottomBar?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

interface LyricsData {
  plainLyrics: string | null;
  syncedLyrics: string | null;
  providers?: ProviderItem[];
}

export interface PlayerHandle {
  openLyrics: () => void;
  openExpanded: () => void;
}

interface CachedStream {
  url: string;
  expiresAt: number;
}

const urlCache = new Map<string, CachedStream>();

const Player = forwardRef<PlayerHandle, PlayerProps>(({
  track,
  isPlaying,
  onNextTrack,
  onPrevTrack,
  shuffle,
  onShuffleToggle,
  repeat,
  onRepeatToggle,
  audioRef,
  onArtistClick,
  hideBottomBar = false,
  onExpandedChange,
}, ref) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("wyandexmusic_volume") || localStorage.getItem("yandexarbuz_volume");
    return saved ? parseInt(saved, 10) : 80;
  });
  const [loading, setLoading] = useState(true);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showLyricsColumn, setShowLyricsColumn] = useState(false);
  const [lyricsMode, setLyricsMode] = useState<"karaoke" | "plain">("karaoke");

  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("lrclib");

  const isDraggingRef = useRef(false);
  const activeRequestIdRef = useRef(0);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const { isLiked, toggleLike } = useLikes();

  const trackIsLiked = track ? isLiked(track.id) : false;

  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  useImperativeHandle(ref, () => ({
    openLyrics: () => {
      setIsExpanded(true);
      setShowLyricsColumn(true);
    },
    openExpanded: () => {
      setIsExpanded(true);
      setShowLyricsColumn(false);
    },
  }));

  const currentLyrics = useMemo(() => {
    if (!lyricsData) return { plainLyrics: null, syncedLyrics: null };
    const p = lyricsData.providers?.find((x) => x.source === selectedProvider);
    if (p) {
      return { plainLyrics: p.plainLyrics, syncedLyrics: p.syncedLyrics };
    }
    return { plainLyrics: lyricsData.plainLyrics, syncedLyrics: lyricsData.syncedLyrics };
  }, [lyricsData, selectedProvider]);

  const parsedLyrics = useMemo(() => {
    if (!currentLyrics.syncedLyrics) return [];
    return parseLrc(currentLyrics.syncedLyrics);
  }, [currentLyrics.syncedLyrics]);

  const currentLineIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    const targetTime = currentTime + 0.15;
    let idx = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (targetTime >= parsedLyrics[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [parsedLyrics, currentTime]);

  const scrollToActiveLine = useCallback((instant = false) => {
    const container = lyricsContainerRef.current;
    const activeEl = activeLineRef.current;
    if (!container || !activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    if (containerRect.height === 0 || activeRect.height === 0) return;

    const delta = (activeRect.top - containerRect.top) - (containerRect.height / 2) + (activeRect.height / 2);
    const targetTop = container.scrollTop + delta;

    container.scrollTo({
      top: Math.max(0, targetTop),
                       behavior: instant ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    if (!isExpanded || !showLyricsColumn || lyricsMode !== "karaoke" || lyricsLoading) return;

    scrollToActiveLine(false);

    const t1 = setTimeout(() => scrollToActiveLine(true), 60);
    const t2 = setTimeout(() => scrollToActiveLine(false), 220);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentLineIndex, isExpanded, showLyricsColumn, lyricsMode, lyricsLoading, parsedLyrics.length, scrollToActiveLine]);

  useEffect(() => {
    if (!track) return;
    loadStreamUrl();
  }, [track?.id]);

  useEffect(() => {
    if (!track) {
      setLyricsData(null);
      return;
    }

    let isCancelled = false;
    setLyricsLoading(true);
    setLyricsData(null);

    const artist = track.artists?.map((a) => a.name).join(", ") || "";

    invoke<LyricsData>("get_lyrics", {
      trackId: track.id,
      artist,
      title: track.title,
      durationMs: track.durationMs,
    })
    .then((data) => {
      if (!isCancelled) {
        setLyricsData(data);

        const preferred = localStorage.getItem("wyandexmusic_preferred_lyrics_provider");
        const preferredProv = data.providers?.find((p) => p.source === preferred);
        const syncedProv = data.providers?.find((p) => p.syncedLyrics);
        const chosen = (preferredProv?.syncedLyrics ? preferredProv : null) || syncedProv || preferredProv || data.providers?.[0];

        if (chosen) {
          setSelectedProvider(chosen.source);
          setLyricsMode(chosen.syncedLyrics ? "karaoke" : "plain");
        } else {
          setLyricsMode("plain");
        }
      }
    })
    .catch(() => {
      if (!isCancelled) {
        setLyricsData(null);
      }
    })
    .finally(() => {
      if (!isCancelled) {
        setLyricsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [track?.id, track?.durationMs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsExpanded(false);
    };
      if (isExpanded) window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  useEffect(() => {
    if (!track) return;

    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const audioDuration = audio.duration;
      setDuration(!isNaN(audioDuration) && audioDuration > 0
      ? audioDuration
      : track.durationMs / 1000
      );
    };

    const handleAudioVolumeChange = () => {
      if (!isDraggingRef.current) {
        const linearVal = Math.round(Math.cbrt(audio.volume) * 100);
        const clampedVal = Math.min(100, Math.max(0, linearVal));
        setVolume(clampedVal);
        localStorage.setItem("wyandexmusic_volume", String(clampedVal));
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("seeked", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleTimeUpdate);
    audio.addEventListener("volumechange", handleAudioVolumeChange);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("seeked", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleTimeUpdate);
      audio.removeEventListener("volumechange", handleAudioVolumeChange);
    };
  }, [track?.id, track?.durationMs]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !track) return;

    const artistNames = track.artists?.map(a => a.name).join(", ") || "Неизвестный исполнитель";
    const coverUrl = track.coverUri ? `https://${track.coverUri.replace("%%", "300x300")}` : "";

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: artistNames,
      album: "Wyandexmusic",
      artwork: coverUrl ? [{ src: coverUrl, sizes: "300x300", type: "image/jpeg" }] : []
    });

    navigator.mediaSession.setActionHandler("play", () => {
      if (audioRef.current) audioRef.current.play().catch(() => {});
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      if (audioRef.current) audioRef.current.pause();
    });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        onNextTrack(true);
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        onPrevTrack();
      });
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
        }
      });

      return () => {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("seekto", null);
      };
  }, [track?.id, onNextTrack, onPrevTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.pow(volume / 100, 3);
    }
  }, []);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!track) return;
    await toggleLike(track.id);
  };

  const loadStreamUrl = async () => {
    if (!track) return;

    const currentRequestId = ++activeRequestIdRef.current;
    setLoading(true);

    try {
      const cached = urlCache.get(track.id);
      let url = "";

      if (cached && cached.expiresAt > Date.now()) {
        url = cached.url;
      } else {
        url = await invoke<string>("get_stream_url", { trackId: track.id });
        urlCache.set(track.id, { url, expiresAt: Date.now() + 2 * 60 * 60 * 1000 });
      }

      if (currentRequestId !== activeRequestIdRef.current) return;

      const audio = audioRef.current;
      if (!audio) return;

      audio.pause();
      audio.src = url;
      audio.currentTime = 0;
      audio.volume = Math.pow(volume / 100, 3);
      audio.load();

      audio.play().catch((e) => {
        if (e.name !== "AbortError") {
          console.error("Playback error:", e);
        }
      });
    } catch (err) {
      console.error("Failed to load stream URL:", err);
    } finally {
      if (currentRequestId === activeRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleLineClick = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
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

  const handlePrevious = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      onPrevTrack();
    }
  };

  const getCoverUrl = (coverUri?: string) => {
    if (!coverUri) return undefined;
    return `https://${coverUri.replace("%%", "600x600")}`;
  };

  const coverUrl = track ? getCoverUrl(track.coverUri) : undefined;

  if (!track) {
    return null;
  }

  const hasSynced = !!currentLyrics.syncedLyrics;
  const hasPlain = !!currentLyrics.plainLyrics;
  const artistNames = track.artists?.map((a) => a.name).join(", ") || "Неизвестный исполнитель";

  const handleArtistClickAction = () => {
    if (track.artists?.[0]?.id && onArtistClick) {
      setIsExpanded(false);
      onArtistClick(track.artists[0].id);
    }
  };

  return (
    <>
    {isExpanded && (
      <ExpandedPlayer
      title={track.title}
      artistNames={artistNames}
      coverUrl={coverUrl}
      isPlaying={isPlaying}
      repeat={repeat}
      trackIsLiked={trackIsLiked}
      currentTime={currentTime}
      duration={duration}
      volume={volume}
      onVolumeChange={handleVolumeChange}
      isDraggingRef={isDraggingRef}
      showLyricsColumn={showLyricsColumn}
      lyricsMode={lyricsMode}
      setLyricsMode={setLyricsMode}
      lyricsLoading={lyricsLoading}
      parsedLyrics={parsedLyrics}
      plainLyrics={currentLyrics.plainLyrics}
      currentLineIndex={currentLineIndex}
      activeLineRef={activeLineRef}
      lyricsContainerRef={lyricsContainerRef}
      hasLyrics={hasPlain || hasSynced}
      hasSynced={hasSynced}
      hasPlain={hasPlain}
      providers={lyricsData?.providers || []}
      currentProvider={selectedProvider}
      onSelectProvider={(src) => {
        setSelectedProvider(src);
        const p = lyricsData?.providers?.find((x) => x.source === src);
        if (p?.syncedLyrics) {
          setLyricsMode("karaoke");
        } else if (p?.plainLyrics) {
          setLyricsMode("plain");
        }
      }}
      onClose={() => setIsExpanded(false)}
      onPrev={handlePrevious}
      onPlayPause={() => {
        if (!audioRef.current) return;
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(() => {});
        }
      }}
      onNext={() => onNextTrack(true)}
      onLikeClick={handleLikeClick}
      onRepeatToggle={onRepeatToggle}
      onToggleLyricsColumn={() => setShowLyricsColumn(!showLyricsColumn)}
      onArtistClick={handleArtistClickAction}
      onSeek={handleSeek}
      onLineClick={handleLineClick}
      />
    )}

    {!hideBottomBar && (
      <BottomBar
      title={track.title}
      artistNames={artistNames}
      coverUrl={coverUrl}
      trackIsLiked={trackIsLiked}
      isPlaying={isPlaying}
      loading={loading}
      repeat={repeat}
      shuffle={shuffle}
      currentTime={currentTime}
      duration={duration}
      volume={volume}
      hasPlain={hasPlain}
      hasSynced={hasSynced}
      isDraggingRef={isDraggingRef}
      onExpand={() => {
        setIsExpanded(true);
        setShowLyricsColumn(false);
      }}
      onArtistClick={handleArtistClickAction}
      onLikeClick={handleLikeClick}
      onShuffleToggle={onShuffleToggle}
      onPrev={handlePrevious}
      onPlayPause={() => {
        if (!audioRef.current) return;
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(() => {});
        }
      }}
      onNext={() => onNextTrack(true)}
      onRepeatToggle={onRepeatToggle}
      onSeek={handleSeek}
      onOpenPlainLyrics={() => {
        setLyricsMode("plain");
        setShowLyricsColumn(true);
        setIsExpanded(true);
      }}
      onOpenKaraokeLyrics={() => {
        setLyricsMode("karaoke");
        setShowLyricsColumn(true);
        setIsExpanded(true);
      }}
      onVolumeChange={handleVolumeChange}
      />
    )}
    </>
  );
});

export default Player;
