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

  const [masterAuraEnabled, setMasterAuraEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("wyandexmusic_aura_master_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [cosmosEnabled, setCosmosEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("wyandexmusic_cosmos_enabled");
    return saved !== null ? saved === "true" : true;
  });

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

  const [tabGlowConfigs, setTabGlowConfigs] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem("wyandexmusic_tab_glow_configs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  useEffect(() => {
    const update = () => {
      const e = localStorage.getItem("wyandexmusic_aura_master_enabled");
      if (e !== null) setMasterAuraEnabled(e === "true");
      const c = localStorage.getItem("wyandexmusic_cosmos_enabled");
      if (c !== null) setCosmosEnabled(c === "true");
      const b = localStorage.getItem("wyandexmusic_aura_brightness");
      if (b !== null) setMasterBrightness(parseInt(b, 10));
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

    window.addEventListener("aura-settings-updated", update);
    return () => window.removeEventListener("aura-settings-updated", update);
  }, []);

  const expandedCfg = tabGlowConfigs["expanded"];
  const glowEnabled = masterAuraEnabled && (expandedCfg ? (expandedCfg.glowEnabled ?? expandedCfg.enabled ?? true) : true);
  const tabCosmosEnabled = cosmosEnabled && (expandedCfg ? (expandedCfg.cosmosEnabled ?? true) : true);
  const effectiveBrightness = Math.round(masterBrightness * (expandedCfg ? (expandedCfg.brightness ?? 100) / 100 : 1));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#07070a] overflow-hidden select-none animate-in fade-in duration-200">
    <AuraBackground
    colors={colors}
    isPlaying={isPlaying}
    position={showLyricsColumn ? "left" : "center"}
    brightness={effectiveBrightness}
    glowEnabled={glowEnabled}
    cosmosEnabled={tabCosmosEnabled}
    transitionDuration={transitionDuration}
    animSpeed={animSpeed}
    />

    <div data-tauri-drag-region className="h-10 sm:h-12 flex items-center justify-between px-4 sm:px-6 z-20 flex-shrink-0">
    <div data-tauri-drag-region className="flex-1 h-full" />
    <div className="flex items-center space-x-2.5 sm:space-x-3 pointer-events-auto">
    <WindowControls />
    <div className="w-[1px] h-3.5 bg-white/10" />
    <button
    onClick={onClose}
    className="w-7 h-7 sm:w-8 sm:h-8 aspect-square rounded-full bg-white/10 hover:bg-white/20 text-white transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
    >
    <ChevronDown className="w-4 h-4 sm:w-4.5 sm:h-4.5 aspect-square shrink-0" />
    </button>
    </div>
    </div>

    <div className="flex-1 flex flex-row items-center justify-center px-4 sm:px-8 pb-4 overflow-hidden relative z-10 min-h-0 w-full h-full">
    <div className={`h-full ${showLyricsColumn ? "w-5/12 max-w-sm sm:max-w-md lg:max-w-lg" : "w-full max-w-md lg:max-w-xl"} shrink-0 flex flex-col items-center justify-center p-2 sm:p-5 text-center select-none transition-all duration-300 ease-out min-h-0 overflow-hidden`}>
    <div className="relative group mb-3.5 sm:mb-5 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 flex-shrink aspect-square w-[15rem] h-[15rem] sm:w-[19rem] sm:h-[19rem] md:w-[23rem] md:h-[23rem] max-w-[80vw] max-h-[39vh]">
    {coverUrl ? (
      <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-cyber-purple/30" />
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

    <h1 className="text-base sm:text-xl md:text-2xl font-extrabold text-white mb-0.5 max-w-full truncate shrink-0 px-2">
    {title}
    </h1>
    <p
    onClick={onArtistClick}
    className="text-xs sm:text-sm md:text-base text-white/50 hover:text-primary font-medium max-w-full truncate mb-3.5 shrink-0 cursor-pointer transition px-2"
    >
    {artistNames}
    </p>

    <div className="w-full max-w-xs sm:max-w-sm shrink-0 flex flex-col items-center space-y-2">
    <ProgressBar
    currentTime={currentTime}
    duration={duration}
    onSeek={onSeek}
    maxWidth="max-w-full"
    />
    <VolumeSlider
    volume={volume}
    onVolumeChange={onVolumeChange}
    isDraggingRef={isDraggingRef}
    />
    </div>
    </div>

    <div
    ref={lyricsContainerRef}
    className={`h-full flex flex-col items-center justify-start text-center relative transition-all duration-300 ease-out overflow-hidden min-h-0 ${
      showLyricsColumn
      ? "flex-1 w-7/12 opacity-100 px-6 sm:px-12 py-4 overflow-y-auto"
      : "w-0 opacity-0 p-0 pointer-events-none"
    }`}
    >
    {lyricsLoading ? (
      <div className="m-auto flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 border-3 border-[#ffcc00] border-t-transparent rounded-full animate-spin" />
      <p className="text-white/50 text-xs">Загрузка текста...</p>
      </div>
    ) : lyricsMode === "karaoke" && parsedLyrics.length > 0 ? (
      <KaraokeLyricsView
      lyrics={parsedLyrics}
      currentLineIndex={currentLineIndex}
      activeLineRef={activeLineRef}
      onLineClick={onLineClick}
      />
    ) : plainLyrics ? (
      <div className="m-auto max-w-xl py-6 w-full">
      <div className="space-y-2 text-center">
      {plainLyrics.split(/\r?\n/).map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-3" />;
        }
        return (
          <p
          key={idx}
          className="text-sm sm:text-lg md:text-xl text-white font-medium tracking-wide leading-relaxed"
          >
          {trimmed}
          </p>
        );
      })}
      </div>
      </div>
    ) : (
      <div className="m-auto text-center">
      <FileText className="w-10 h-10 text-white/20 mx-auto mb-2 aspect-square shrink-0" />
      <p className="text-sm sm:text-base text-white/50">Текст песни не найден</p>
      </div>
    )}
    </div>
    </div>
    </div>
  );
}
