import { useState, useEffect } from "react";
import { ChevronDown, FileText } from "lucide-react";
import CoverOverlay from "./CoverOverlay";
import KaraokeLyricsView from "./KaraokeLyricsView";
import ProgressBar from "./ProgressBar";
import VolumeSlider from "./VolumeSlider";
import WindowControls from "./WindowControls";
import AuraBackground from "./AuraBackground";
import { LyricLine } from "../../utils/lrcParser";
import { ProviderItem } from "./MoreMenu";
import { useCoverColors } from "../../hooks/useCoverColors";

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
  const colors = useCoverColors(coverUrl, `${title}-${artistNames}`);

  const [masterBrightness, setMasterBrightness] = useState<number>(() => {
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

  useEffect(() => {
    const update = () => {
      const b = localStorage.getItem("wyandexmusic_aura_brightness");
      if (b !== null) setMasterBrightness(parseInt(b, 10));
      const t = localStorage.getItem("wyandexmusic_aura_transition");
      if (t !== null) setTransitionDuration(parseFloat(t));
      const s = localStorage.getItem("wyandexmusic_aura_anim_speed");
      if (s !== null) setAnimSpeed(parseFloat(s));
    };

      window.addEventListener("aura-settings-updated", update);
      return () => window.removeEventListener("aura-settings-updated", update);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#07070a] overflow-hidden select-none animate-in fade-in duration-200">
    <AuraBackground
    colors={colors}
    isPlaying={isPlaying}
    position={showLyricsColumn ? "left" : "center"}
    brightness={masterBrightness}
    transitionDuration={transitionDuration}
    animSpeed={animSpeed}
    />

    <div data-tauri-drag-region className="h-12 flex items-center justify-between px-6 z-20 flex-shrink-0">
    <div data-tauri-drag-region className="flex-1 h-full" />
    <div className="flex items-center space-x-3 pointer-events-auto">
    <WindowControls />
    <div className="w-[1px] h-3.5 bg-white/10" />
    <button
    onClick={onClose}
    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all transform hover:scale-105 active:scale-95"
    >
    <ChevronDown size={18} />
    </button>
    </div>
    </div>

    <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-10 pb-8 overflow-hidden relative z-10">
    <div className={`w-full ${showLyricsColumn ? "md:w-5/12" : "max-w-xl"} flex flex-col items-center justify-center p-8 text-center select-none transition-all duration-300 ease-out`}>
    <div className="relative group mb-8 rounded-3xl overflow-hidden shadow-[0_28px_60px_rgba(0,0,0,0.8)] border border-white/10">
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
    className="text-lg text-white/50 hover:text-primary font-medium max-w-md truncate mb-6 cursor-pointer transition"
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

    <div
    ref={lyricsContainerRef}
    className={`h-full flex flex-col items-center justify-start text-center relative transition-all duration-300 ease-out overflow-hidden ${
      showLyricsColumn
      ? "w-full md:w-7/12 opacity-100 px-8 py-12 overflow-y-auto"
      : "w-0 opacity-0 p-0 pointer-events-none"
    }`}
    >
    {lyricsLoading ? (
      <div className="m-auto flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-[#ffcc00] border-t-transparent rounded-full animate-spin" />
      <p className="text-white/50 text-sm">Загружаем текст трека...</p>
      </div>
    ) : lyricsMode === "karaoke" && parsedLyrics.length > 0 ? (
      <KaraokeLyricsView
      lyrics={parsedLyrics}
      currentLineIndex={currentLineIndex}
      activeLineRef={activeLineRef}
      onLineClick={onLineClick}
      />
    ) : plainLyrics ? (
      <div className="m-auto max-w-2xl py-10 w-full">
      <div className="space-y-2 text-center">
      {plainLyrics.split(/\r?\n/).map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-4" />;
        }
        return (
          <p
          key={idx}
          className="text-xl md:text-2xl text-white font-medium tracking-wide leading-relaxed"
          >
          {trimmed}
          </p>
        );
      })}
      </div>
      </div>
    ) : (
      <div className="m-auto text-center">
      <FileText size={56} className="text-white/20 mx-auto mb-4" />
      <p className="text-xl text-white/50">Текст песни не найден</p>
      </div>
    )}
    </div>
    </div>
    </div>
  );
}
