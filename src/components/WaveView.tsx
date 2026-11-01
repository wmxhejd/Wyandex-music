import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Heart, ThumbsDown, Disc3, Volume2, MoreHorizontal, User, Repeat, Shuffle, FileText, Check, Copy } from "lucide-react";
import { Track } from "../types";
import { useLikes } from "../context/LikesContext";
import { formatTime } from "../utils/formatTime";
import { useCoverColors } from "../hooks/useCoverColors";
import AuraBackground from "./player/AuraBackground";

interface WaveViewProps {
  queue: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeat: boolean;
  shuffle: boolean;
  onPlayTrack: (track: Track, tracks: Track[]) => void;
  onPlayPause: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
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
  onPlayTrack,
  onPlayPause,
  onNextTrack,
  onPrevTrack,
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
}: WaveViewProps) {
  const { isLiked, toggleLike } = useLikes();
  const [showVolume, setShowVolume] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [overflowOffset, setOverflowOffset] = useState<number>(0);

  const isScrubbingRef = useRef(false);
  const capsuleRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const textSpanRef = useRef<HTMLSpanElement>(null);

  const activeTrack = currentTrack || queue[0] || null;
  const trackIsLiked = activeTrack ? isLiked(activeTrack.id) : false;

  const coverUrl = activeTrack?.coverUri
    ? `https://${activeTrack.coverUri.replace("%%", "600x600")}`
    : undefined;

  const trackSeed = activeTrack ? `${activeTrack.title}-${activeTrack.id}` : "wave";
  const colors = useCoverColors(coverUrl, trackSeed);

  const artistName = activeTrack?.artists?.map((a) => a.name).join(", ") || "Моя волна";
  const trackTitle = activeTrack?.title || "Моя волна";

  useEffect(() => {
    if (textContainerRef.current && textSpanRef.current) {
      const diff = textSpanRef.current.scrollWidth - textContainerRef.current.clientWidth;
      setOverflowOffset(diff > 6 ? diff + 12 : 0);
    }
  }, [trackTitle]);

  const updateSeekFromEvent = (clientX: number) => {
    if (!capsuleRef.current || !duration) return;
    const rect = capsuleRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = clickX / rect.width;
    onSeek(percent * duration);
  };

  const handleCapsuleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isLoading && !activeTrack) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-[#ffcc00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !activeTrack) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="glass-strong rounded-3xl p-8 text-center max-w-sm">
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

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center overflow-hidden select-none">
      <AuraBackground colors={colors} isPlaying={isPlaying} position="center" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-2xl mx-auto w-full">
        <div className="h-14 mb-4 flex items-center justify-center w-full max-w-xl">
          <h1
            onClick={() => activeTrack?.artists?.[0]?.id && onArtistClick && onArtistClick(activeTrack.artists[0].id)}
            className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight truncate hover:text-[#ffcc00] transition cursor-pointer select-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
            title="К исполнителю"
          >
            {artistName}
          </h1>
        </div>

        <div
          onClick={onOpenExpanded}
          className="relative mb-8 rounded-3xl overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.95)] border border-white/10 group flex-shrink-0 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
          title="Развернуть полноэкранный плеер"
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={activeTrack?.title || "Cover"}
              className="w-52 h-52 md:w-60 md:h-60 object-cover"
            />
          ) : (
            <div className="w-52 h-52 md:w-60 md:h-60 bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
              <Disc3 size={56} className="text-white/40" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center space-x-2.5 w-full mb-8">
          <div
            className="relative group flex-shrink-0"
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => setShowVolume(false)}
          >
            <button
              title="Громкость"
              className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white/70 hover:text-white border border-white/10 shadow-lg transition flex items-center justify-center"
            >
              <Volume2 size={18} />
            </button>

            {showVolume && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-13 py-3 px-2.5 bg-[#14141a]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-30 flex flex-col items-center animate-in fade-in zoom-in-95">
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
            onClick={onNextTrack}
            title="Не нравится (следующий трек)"
            className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white/70 hover:text-white border border-white/10 shadow-lg transition flex items-center justify-center flex-shrink-0"
          >
            <ThumbsDown size={18} />
          </button>

          <div
            ref={capsuleRef}
            onMouseDown={handleCapsuleMouseDown}
            title="Зажмите и тяните для перемотки"
            className="relative w-52 md:w-60 h-11 bg-black/60 hover:bg-black/80 backdrop-blur-2xl border border-white/15 rounded-full overflow-hidden cursor-pointer select-none shadow-2xl transition group flex-shrink-0"
          >
            <div
              className="absolute top-0 left-0 bottom-0 bg-white/[0.2] pointer-events-none transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />

            <div className="relative z-10 w-full h-full px-4 flex items-center justify-between text-xs font-semibold text-white pointer-events-none overflow-hidden">
              <div ref={textContainerRef} className="overflow-hidden mr-2 flex-1 flex items-center">
                <span
                  ref={textSpanRef}
                  style={{
                    animation: overflowOffset > 0 ? "marquee-pingpong 7s ease-in-out infinite alternate" : "none",
                    "--scroll-dist": `-${overflowOffset}px`,
                  } as React.CSSProperties}
                  className="whitespace-nowrap inline-block"
                >
                  {trackTitle}
                </span>
              </div>
              <span className="font-mono text-white/70 text-[11px] flex-shrink-0">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          <button
            onClick={() => activeTrack && toggleLike(activeTrack.id)}
            title={trackIsLiked ? "Удалить из любимых" : "Нравится"}
            className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 shadow-lg transition flex items-center justify-center flex-shrink-0"
          >
            <Heart
              size={18}
              className={trackIsLiked ? "fill-red-500 text-red-500" : "text-white/70 hover:text-white"}
            />
          </button>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              title="Меню"
              className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white/70 hover:text-white border border-white/10 shadow-lg transition flex items-center justify-center"
            >
              <MoreHorizontal size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 bottom-14 w-60 glass-strong border border-white/20 rounded-2xl p-2 shadow-2xl text-left z-30 animate-in fade-in zoom-in-95 space-y-1">
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
            onClick={onPrevTrack}
            className="w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition hover:scale-110 shadow-lg border border-white/10 flex items-center justify-center flex-shrink-0"
          >
            <SkipBack size={22} fill="currentColor" />
          </button>

          <button
            onClick={() => {
              if (currentTrack) {
                onPlayPause();
              } else if (activeTrack) {
                onPlayTrack(activeTrack, queue);
              }
            }}
            className="w-16 h-16 rounded-full bg-[#ffcc00] hover:scale-110 active:scale-95 text-black shadow-2xl shadow-[#ffcc00]/25 transition flex items-center justify-center flex-shrink-0"
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play size={28} fill="currentColor" className="translate-x-0.5" />
            )}
          </button>

          <button
            onClick={onNextTrack}
            className="w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition hover:scale-110 shadow-lg border border-white/10 flex items-center justify-center flex-shrink-0"
          >
            <SkipForward size={22} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
