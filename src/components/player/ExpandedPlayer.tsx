import { ChevronDown, FileText } from "lucide-react";
import CoverOverlay from "./CoverOverlay";
import KaraokeLyricsView from "./KaraokeLyricsView";
import ProgressBar from "./ProgressBar";
import VolumeSlider from "./VolumeSlider";
import WindowControls from "./WindowControls";
import { LyricLine } from "../../utils/lrcParser";
import { ProviderItem } from "./MoreMenu";

interface ExpandedPlayerProps {
  title: string;
  artistNames: string;
  coverUrl?: string;
  isPlaying: boolean;
  repeat: boolean;
  trackIsLiked: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDraggingRef: React.MutableRefObject<boolean>;
  showLyricsColumn: boolean;
  lyricsMode: "karaoke" | "plain";
  setLyricsMode: (mode: "karaoke" | "plain") => void;
  lyricsLoading: boolean;
  parsedLyrics: LyricLine[];
  plainLyrics?: string | null;
  currentLineIndex: number;
  activeLineRef: React.RefObject<HTMLDivElement | null>;
  lyricsContainerRef: React.RefObject<HTMLDivElement | null>;
  hasLyrics: boolean;
  hasSynced: boolean;
  hasPlain: boolean;
  providers: ProviderItem[];
  currentProvider: string;
  onSelectProvider: (source: string) => void;
  onClose: () => void;
  onPrev: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onLikeClick: (e: React.MouseEvent) => void;
  onRepeatToggle: () => void;
  onToggleLyricsColumn: () => void;
  onArtistClick?: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLineClick: (time: number) => void;
}

export default function ExpandedPlayer({
  title,
  artistNames,
  coverUrl,
  isPlaying,
  repeat,
  trackIsLiked,
  currentTime,
  duration,
  volume,
  onVolumeChange,
  isDraggingRef,
  showLyricsColumn,
  lyricsMode,
  setLyricsMode,
  lyricsLoading,
  parsedLyrics,
  plainLyrics,
  currentLineIndex,
  activeLineRef,
  lyricsContainerRef,
  hasLyrics,
  hasSynced,
  hasPlain,
  providers,
  currentProvider,
  onSelectProvider,
  onClose,
  onPrev,
  onPlayPause,
  onNext,
  onLikeClick,
  onRepeatToggle,
  onToggleLyricsColumn,
  onArtistClick,
  onSeek,
  onLineClick,
}: ExpandedPlayerProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0e0e12] animate-in fade-in duration-300">
      <div data-tauri-drag-region className="h-11 flex items-center justify-between px-4 select-none flex-shrink-0">
        <div data-tauri-drag-region className="flex-1 h-full" />
        <div className="flex items-center space-x-3">
          <WindowControls />
          <div className="w-[1px] h-3.5 bg-white/10" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all transform hover:scale-105 active:scale-95"
            title="Свернуть плеер"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-10 pb-8 overflow-hidden">
        <div className={`w-full ${showLyricsColumn ? "md:w-5/12" : "max-w-xl"} flex flex-col items-center justify-center p-8 text-center select-none transition-all duration-500`}>
          <div className="relative group mb-8 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10">
            {coverUrl ? (
              <img src={coverUrl} alt={title} className="w-72 h-72 md:w-96 md:h-96 object-cover" />
            ) : (
              <div className="w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-primary/30 to-cyber-purple/30" />
            )}

            <CoverOverlay
              isPlaying={isPlaying}
              repeat={repeat}
              trackIsLiked={trackIsLiked}
              hasLyrics={hasLyrics}
              showLyricsColumn={showLyricsColumn}
              title={title}
              artistNames={artistNames}
              onPrev={onPrev}
              onPlayPause={onPlayPause}
              onNext={onNext}
              onLikeClick={onLikeClick}
              onRepeatToggle={onRepeatToggle}
              onToggleLyricsColumn={onToggleLyricsColumn}
              onArtistClick={onArtistClick}
              lyricsMode={lyricsMode}
              onSetLyricsMode={setLyricsMode}
              hasSynced={hasSynced}
              hasPlain={hasPlain}
              providers={providers}
              currentProvider={currentProvider}
              onSelectProvider={onSelectProvider}
            />
          </div>

          <h1 className="text-3xl font-extrabold text-white mb-2 max-w-md truncate">
            {title}
          </h1>
          <p
            onClick={onArtistClick}
            className="text-lg text-[var(--text-secondary)] hover:text-primary font-medium max-w-md truncate mb-6 cursor-pointer transition"
          >
            {artistNames}
          </p>

          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek}
            maxWidth="max-w-md"
          />

          <div className="w-full max-w-xs flex items-center justify-center mt-5">
            <VolumeSlider
              volume={volume}
              onVolumeChange={onVolumeChange}
              isDraggingRef={isDraggingRef}
            />
          </div>
        </div>

        {showLyricsColumn && (
          <div
            ref={lyricsContainerRef}
            className="w-full md:w-7/12 h-full overflow-y-auto px-8 py-12 flex flex-col items-center justify-start text-center relative animate-in fade-in duration-300"
          >
            {lyricsLoading ? (
              <div className="m-auto flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#ffcc00] border-t-transparent rounded-full animate-spin" />
                <p className="text-[var(--text-secondary)] text-sm">Загружаем текст трека...</p>
              </div>
            ) : lyricsMode === "karaoke" && parsedLyrics.length > 0 ? (
              <KaraokeLyricsView
                lyrics={parsedLyrics}
                currentLineIndex={currentLineIndex}
                activeLineRef={activeLineRef}
                onLineClick={onLineClick}
              />
            ) : plainLyrics ? (
              <div className="m-auto max-w-2xl py-10">
                <div className="space-y-4 text-center">
                  {plainLyrics.split("\n\n").map((verse, vIdx) => (
                    <div key={vIdx} className="space-y-1.5 py-2">
                      {verse.split("\n").map((line, lIdx) => (
                        <p
                          key={lIdx}
                          className="text-xl md:text-2xl text-white font-medium tracking-wide leading-relaxed"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="m-auto text-center">
                <FileText size={56} className="text-white/20 mx-auto mb-4" />
                <p className="text-xl text-[var(--text-secondary)]">Текст песни не найден</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
