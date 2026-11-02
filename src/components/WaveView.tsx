import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Heart, ThumbsDown, Disc3, Volume2, MoreHorizontal, User, Repeat, Shuffle, FileText, Check, Copy, X } from "lucide-react";
import { Track } from "../types";
import { useLikes } from "../context/LikesContext";
import { formatTime } from "../utils/formatTime";

interface WaveViewProps {
  queue: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeat: boolean;
  shuffle: boolean;
  sourceTitle?: string | null;
  isWaveMode?: boolean;
  onDropToWave?: () => void;
  onPlayTrack: (track: Track, tracks: Track[]) => void;
  onPlayPause: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onDislikeTrack?: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIsDraggingVol: (dragging: boolean) => void;
  onRepeatToggle: () => void;
  onShuffleToggle: () => void;
  onOpenLyrics: () => void;
  onOpenExpanded: () => void;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  onArtistClick?: (artistId: number) => void;
  onStartWaveSession?: () => void;
}

export default function WaveView({
  queue,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  repeat,
  shuffle,
  sourceTitle,
  isWaveMode = false,
  onDropToWave,
  onPlayTrack,
  onPlayPause,
  onNextTrack,
  onPrevTrack,
  onDislikeTrack,
  onSeek,
  onVolumeChange,
  onIsDraggingVol,
  onRepeatToggle,
  onShuffleToggle,
  onOpenLyrics,
  onOpenExpanded,
  isLoading,
  error,
  onRetry,
  onArtistClick,
  onStartWaveSession,
}: WaveViewProps) {
  const { isLiked, toggleLike } = useLikes();
  const [showVolume, setShowVolume] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [overflowOffset, setOverflowOffset] = useState<number>(0);
  const [coverBrightness, setCoverBrightness] = useState<number>(() => {
    const saved = localStorage.getItem("wyandexmusic_cover_brightness");
    return saved !== null ? parseInt(saved, 10) : 100;
  });

  useEffect(() => {
    const updateCoverBrightness = () => {
      const saved = localStorage.getItem("wyandexmusic_cover_brightness");
      if (saved !== null) setCoverBrightness(parseInt(saved, 10));
    };
      window.addEventListener("cover-settings-updated", updateCoverBrightness);
      return () => window.removeEventListener("cover-settings-updated", updateCoverBrightness);
  }, []);

  const isScrubbingRef = useRef(false);
  const capsuleRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const textSpanRef = useRef<HTMLSpanElement>(null);

  const activeTrack = currentTrack || queue[0] || null;
  const isWaveStarted = Boolean(activeTrack);
  const trackIsLiked = activeTrack ? isLiked(activeTrack.id) : false;

  const coverUrl = activeTrack?.coverUri
  ? `https://${activeTrack.coverUri.replace("%%", "600x600")}`
  : undefined;

  const artistName = isWaveStarted ? (activeTrack?.artists?.map((a) => a.name).join(", ") || "Моя волна") : "Моя волна";
  const trackTitle = isWaveStarted ? (activeTrack?.title || "Моя волна") : "Нажмите Play для старта";

  const effectiveDuration = duration > 0 ? duration : (activeTrack?.durationMs ? activeTrack.durationMs / 1000 : 0);

  useEffect(() => {
    if (textContainerRef.current && textSpanRef.current) {
      const diff = textSpanRef.current.scrollWidth - textContainerRef.current.clientWidth;
      setOverflowOffset(diff > 6 ? diff + 12 : 0);
    }
  }, [trackTitle]);

  const updateSeekFromEvent = (clientX: number) => {
    if (!capsuleRef.current || !effectiveDuration || !isWaveStarted) return;
    const rect = capsuleRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = clickX / rect.width;
    onSeek(percent * effectiveDuration);
  };

  const handleCapsuleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isWaveStarted) return;
    isScrubbingRef.current = true;
    updateSeekFromEvent(e.clientX);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (isScrubbingRef.current) {
        updateSeekFromEvent(moveEvent.clientX);
      }
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      if (isScrubbingRef.current) {
        isScrubbingRef.current = false;
        updateSeekFromEvent(upEvent.clientX);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleCopy = () => {
    if (!activeTrack) return;
    navigator.clipboard.writeText(`${artistName} - ${trackTitle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPercent = isWaveStarted && effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  if (isLoading && isWaveStarted) {
    return (
      <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-[#ffcc00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && isWaveStarted) {
    return (
      <div className="flex items-center justify-center h-full">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 text-center max-w-sm border border-white/15">
      <p className="text-red-400 text-sm mb-4">{error}</p>
      <button
      onClick={onRetry}
      className="px-6 py-2 bg-[#ffcc00] text-black rounded-full font-semibold text-sm hover:scale-105 transition"
      >
      Повторить
      </button>
      </div>
      </div>
    );
  }

  const handleMainPlayClick = () => {
    if (!isWaveMode) {
      onStartWaveSession?.();
      return;
    }
    if (currentTrack) {
      onPlayPause();
    } else if (activeTrack) {
      onPlayTrack(activeTrack, queue);
    } else {
      onStartWaveSession?.();
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center overflow-hidden select-none">
    <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto w-full translate-x-20 md:translate-x-28">
    <div className="min-h-8 mb-3 flex items-center justify-center">
    {sourceTitle && (
      <div className="inline-flex items-center space-x-2 py-1 px-3.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl shadow-lg cursor-pointer animate-in fade-in zoom-in-95 duration-200">
      <span className="text-xs md:text-sm font-bold text-[#ffcc00] tracking-wide">
      {sourceTitle}
      </span>
      <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDropToWave?.();
      }}
      className="w-4 h-4 rounded-full bg-[#ffcc00] text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-transform outline-none focus:outline-none"
      >
      <X size={11} strokeWidth={3} />
      </button>
      </div>
    )}
    </div>

    <div className="min-h-16 mb-6 flex items-center justify-center w-full overflow-hidden">
    <h1
    key={activeTrack?.id || "empty-artist"}
    onClick={() => isWaveStarted && activeTrack?.artists?.[0]?.id && onArtistClick && onArtistClick(activeTrack.artists[0].id)}
    className={`text-5xl md:text-6xl font-black text-white tracking-tight leading-tight truncate ${
      isWaveStarted ? "hover:text-[#ffcc00] cursor-pointer" : ""
    } transition-colors select-none`}
    >
    {artistName}
    </h1>
    </div>

    <div
    onClick={() => isWaveStarted && onOpenExpanded()}
    className={`relative mb-10 rounded-[32px] overflow-hidden shadow-[0_28px_70px_rgba(0,0,0,0.85)] border border-white/10 group flex-shrink-0 ${
      isWaveStarted ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""
    } transition-transform duration-300`}
    >
    {coverUrl ? (
      <img
      src={coverUrl}
      alt={activeTrack?.title || "Cover"}
      className="w-72 h-72 md:w-80 md:h-80 lg:w-[350px] lg:h-[350px] object-cover transition-[filter] duration-300"
      style={{ filter: `brightness(${coverBrightness}%)` }}
      />
    ) : (
      <div className="w-72 h-72 md:w-80 md:h-80 lg:w-[350px] lg:h-[350px] bg-white/[0.02] border border-white/[0.08] flex items-center justify-center">
      <Disc3 size={84} className={`text-white/20 ${isLoading ? "animate-spin" : ""}`} />
      </div>
    )}
    </div>

    <div className="flex items-center justify-center space-x-3 w-full mb-10">
    <div
    className="relative group flex-shrink-0"
    onMouseEnter={() => setShowVolume(true)}
    onMouseLeave={() => setShowVolume(false)}
    >
    <button
    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-xl transition flex items-center justify-center shadow-none outline-none focus:outline-none"
    >
    <Volume2 size={19} />
    </button>

    {showVolume && (
      <div className="absolute left-1/2 -translate-x-1/2 bottom-14 py-3.5 px-3 bg-[#121218]/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-30 flex flex-col items-center animate-in fade-in zoom-in-95">
      <span className="text-[11px] font-mono text-white/90 mb-2">{Math.round(volume)}%</span>
      <div className="h-28 w-6 flex items-center justify-center">
      <input
      type="range"
      min="0"
      max="100"
      step="1"
      value={volume}
      onMouseDown={() => onIsDraggingVol(true)}
      onMouseUp={() => onIsDraggingVol(false)}
      onTouchStart={() => onIsDraggingVol(true)}
      onTouchEnd={() => onIsDraggingVol(false)}
      onChange={onVolumeChange}
      className="h-1.5 w-24 -rotate-90 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
      />
      </div>
      </div>
    )}
    </div>

    <button
    disabled={!isWaveStarted}
    onClick={() => {
      if (onDislikeTrack) {
        onDislikeTrack();
      } else {
        onNextTrack();
      }
    }}
    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white border border-white/15 backdrop-blur-xl transition flex items-center justify-center flex-shrink-0 shadow-none outline-none focus:outline-none"
    >
    <ThumbsDown size={19} />
    </button>

    <div
    ref={capsuleRef}
    onMouseDown={handleCapsuleMouseDown}
    className={`relative w-64 md:w-80 h-[72px] bg-white/10 ${isWaveStarted ? "hover:bg-white/15 cursor-pointer" : "cursor-default"} backdrop-blur-xl border border-white/15 rounded-full overflow-hidden select-none transition group flex-shrink-0 shadow-none`}
    >
    <div
    className="absolute top-0 left-0 bottom-0 bg-white/25 pointer-events-none transition-all duration-75"
    style={{ width: `${progressPercent}%` }}
    />

    <div className="relative z-10 w-full h-full px-6 flex items-center justify-between text-white pointer-events-none overflow-hidden">
    <div ref={textContainerRef} className="overflow-hidden mr-3 flex-1 flex items-center">
    <span
    key={activeTrack?.id || "empty-title"}
    ref={textSpanRef}
    style={{
      animation: overflowOffset > 0 ? "marquee-pingpong 7s ease-in-out infinite alternate" : "none",
      "--scroll-dist": `-${overflowOffset}px`,
    } as React.CSSProperties}
    className="whitespace-nowrap inline-block text-sm font-semibold"
    >
    {trackTitle}
    </span>
    </div>
    <span className="font-mono text-white/80 text-xs flex-shrink-0">
    {formatTime(currentTime)} / {formatTime(effectiveDuration)}
    </span>
    </div>
    </div>

    <button
    disabled={!isWaveStarted}
    onClick={() => activeTrack && toggleLike(activeTrack.id)}
    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 border border-white/15 backdrop-blur-xl transition flex items-center justify-center flex-shrink-0 shadow-none outline-none focus:outline-none"
    >
    <Heart
    size={19}
    className={trackIsLiked ? "fill-red-500 text-red-500" : "text-white"}
    />
    </button>

    <div className="relative flex-shrink-0">
    <button
    disabled={!isWaveStarted}
    onClick={() => setShowMenu(!showMenu)}
    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white border border-white/15 backdrop-blur-xl transition flex items-center justify-center shadow-none outline-none focus:outline-none"
    >
    <MoreHorizontal size={19} />
    </button>

    {showMenu && isWaveStarted && (
      <div className="absolute right-0 bottom-16 w-60 bg-[#121218]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-2xl text-left z-30 animate-in fade-in zoom-in-95 space-y-1">
      <button
      onClick={() => {
        setShowMenu(false);
        onOpenLyrics();
      }}
      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-white transition"
      >
      <FileText size={15} />
      <span>Текст песни / Караоке</span>
      </button>
      <button
      onClick={onRepeatToggle}
      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs transition ${repeat ? "text-[#ffcc00] font-semibold" : "text-white"}`}
      >
      <Repeat size={15} />
      <span>{repeat ? "Повтор включен" : "Повторять трек"}</span>
      </button>
      <button
      onClick={onShuffleToggle}
      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs transition ${shuffle ? "text-[#ffcc00] font-semibold" : "text-white"}`}
      >
      <Shuffle size={15} />
      <span>{shuffle ? "Случайный порядок" : "Перемешать"}</span>
      </button>
      {activeTrack?.artists?.[0]?.id && onArtistClick && (
        <button
        onClick={() => {
          setShowMenu(false);
          onArtistClick(activeTrack.artists[0].id);
        }}
        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-white transition"
        >
        <User size={15} />
        <span className="truncate">К исполнителю</span>
        </button>
      )}
      <button
      onClick={handleCopy}
      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-white transition"
      >
      {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
      <span>{copied ? "Скопировано!" : "Копировать название"}</span>
      </button>
      </div>
    )}
    </div>
    </div>

    <div className="flex items-center justify-center space-x-8">
    <button
    disabled={!isWaveStarted}
    onClick={onPrevTrack}
    className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white transition-all hover:scale-105 border border-white/15 backdrop-blur-xl flex items-center justify-center flex-shrink-0 shadow-none outline-none focus:outline-none"
    >
    <SkipBack size={22} fill="currentColor" />
    </button>

    <button
    onClick={handleMainPlayClick}
    className="w-20 h-20 rounded-full bg-[#ffcc00] hover:scale-105 active:scale-95 text-black shadow-[0_0_35px_rgba(255,204,0,0.35)] transition-all flex items-center justify-center flex-shrink-0 outline-none focus:outline-none"
    >
    {isPlaying ? (
      <Pause size={32} fill="currentColor" />
    ) : (
      <Play size={32} fill="currentColor" className="translate-x-0.5" />
    )}
    </button>

    <button
    disabled={!isWaveStarted}
    onClick={onNextTrack}
    className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white transition-all hover:scale-105 border border-white/15 backdrop-blur-xl flex items-center justify-center flex-shrink-0 shadow-none outline-none focus:outline-none"
    >
    <SkipForward size={22} fill="currentColor" />
    </button>
    </div>
    </div>
    </div>
  );
}
