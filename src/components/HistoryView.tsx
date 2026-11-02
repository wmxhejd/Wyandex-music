import { useState, useEffect } from "react";
import { History as HistoryIcon, Trash2 } from "lucide-react";
import TrackList from "./TrackList";
import { Track } from "../types";

interface HistoryViewProps {
    onPlayTrack: (track: Track, tracks?: Track[], sourceTitle?: string) => void;
}

export default function HistoryView({ onPlayTrack }: HistoryViewProps) {
    const [tracks, setTracks] = useState<Track[]>([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        const raw = localStorage.getItem("wyandexmusic_history");
        if (raw) {
            try {
                setTracks(JSON.parse(raw));
            } catch {}
        } else {
            setTracks([]);
        }
    };

    const handleClearHistory = () => {
        localStorage.removeItem("wyandexmusic_history");
        setTracks([]);
    };

    return (
        <div className="space-y-8 select-none max-w-5xl">
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-5">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.45)]">
        <HistoryIcon size={32} className="text-white" />
        </div>
        <div>
        <h1 className="text-4xl font-black text-white tracking-tight">История прослушиваний</h1>
        <p className="text-sm text-white/40 mt-1">{tracks.length} треков</p>
        </div>
        </div>

        {tracks.length > 0 && (
            <button
            onClick={handleClearHistory}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-all border border-white/[0.06] hover:border-red-500/20 text-xs font-semibold"
            >
            <Trash2 size={16} />
            <span>Очистить историю</span>
            </button>
        )}
        </div>

        {tracks.length > 0 ? (
            <TrackList
            tracks={tracks}
            onPlayTrack={(t, tr) => onPlayTrack(t, tr, "История")}
            />
        ) : (
            <div className="text-center py-32 text-white/30 text-sm">
            История пуста. Включите любой трек, чтобы он появился здесь.
            </div>
        )}
        </div>
    );
}
