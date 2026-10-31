import { Heart, Maximize2, FileText, Mic2 } from "lucide-react";
import PlaybackControls from "./PlaybackControls";
import ProgressBar from "./ProgressBar";
import VolumeSlider from "./VolumeSlider";

interface BottomBarProps {
  title: string;
  artistNames: string;
  coverUrl?: string;
  trackIsLiked: boolean;
  isPlaying: boolean;
  loading: boolean;
  repeat: boolean;
  shuffle: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  hasPlain: boolean;
  hasSynced: boolean;
  isDraggingRef: React.MutableRefObject<boolean>;
  onExpand: () => void;
  onArtistClick?: () => void;
  onLikeClick: (e: React.MouseEvent) => void;
  onShuffleToggle: () => void;
  onPrev: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onRepeatToggle: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenPlainLyrics: () => void;
  onOpenKaraokeLyrics: () => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BottomBar({
  title,
  artistNames,
  coverUrl,
  trackIsLiked,
  isPlaying,
  loading,
  repeat,
  shuffle,
  currentTime,
  duration,
  volume,
  hasPlain,
  hasSynced,
  isDraggingRef,
  onExpand,
  onArtistClick,
  onLikeClick,
  onShuffleToggle,
  onPrev,
  onPlayPause,
  onNext,
  onRepeatToggle,
  onSeek,
  onOpenPlainLyrics,
  onOpenKaraokeLyrics,
  onVolumeChange,
}: BottomBarProps) {
  return (
    <div className="glass-strong border-t border-white/20 backdrop-blur-xl">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between space-x-6">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div
              onClick={onExpand}
              className="relative group cursor-pointer flex-shrink-0"
              title="Развернуть полноэкранный плеер"
            >
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={title}
                  className="w-16 h-16 rounded-xl object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-cyber-purple rounded-xl" />
              )}
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 size={20} className="text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <h3
                onClick={onExpand}
                className="text-white font-semibold truncate cursor-pointer hover:text-primary transition"
              >
                {title}
              </h3>
              <p
                onClick={onArtistClick}
                className="text-sm text-[var(--text-secondary)] hover:text-white cursor-pointer transition truncate"
              >
                {artistNames}
              </p>
            </div>

            <button
              onClick={onLikeClick}
              title={trackIsLiked ? "Удалить из любимых" : "Нравится"}
              className="text-[var(--text-secondary)] hover:text-red-400 transition flex-shrink-0"
            >
              <Heart
                size={20}
                className={trackIsLiked ? "fill-red-500 text-red-500" : ""}
              />
            </button>
          </div>

          <div className="flex flex-col items-center space-y-2 flex-1">
            <PlaybackControls
              isPlaying={isPlaying}
              loading={loading}
              repeat={repeat}
              shuffle={shuffle}
              onPlayPause={onPlayPause}
              onNext={onNext}
              onPrev={onPrev}
              onRepeatToggle={onRepeatToggle}
              onShuffleToggle={onShuffleToggle}
            />

            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={onSeek}
              maxWidth="max-w-2xl"
            />
          </div>

          <div className="flex items-center space-x-4 flex-1 justify-end">
            <button
              disabled={!hasPlain}
              onClick={onOpenPlainLyrics}
              title={hasPlain ? "Текст песни" : "Текст недоступен"}
              className={`transition ${
                hasPlain
                  ? "text-[var(--text-secondary)] hover:text-white"
                  : "text-white/20 cursor-not-allowed"
              }`}
            >
              <FileText size={20} />
            </button>

            <button
              disabled={!hasSynced}
              onClick={onOpenKaraokeLyrics}
              title={hasSynced ? "Караоке (официальный Яндекс)" : "Караоке недоступно"}
              className={`transition ${
                hasSynced
                  ? "text-[var(--text-secondary)] hover:text-white"
                  : "text-white/20 cursor-not-allowed"
              }`}
            >
              <Mic2 size={20} />
            </button>

            <VolumeSlider
              volume={volume}
              onVolumeChange={onVolumeChange}
              isDraggingRef={isDraggingRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
