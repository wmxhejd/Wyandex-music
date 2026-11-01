import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Heart } from "lucide-react";
import { Track } from "../types";
import TrackList from "./TrackList";
import { useLikes } from "../context/LikesContext";

interface LikedTracksViewProps {
  onPlayTrack: (track: Track, tracks?: Track[]) => void;
}

export default function LikedTracksView({ onPlayTrack }: LikedTracksViewProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { likedIds } = useLikes();

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const likedTracks = await invoke<Track[]>("get_liked_tracks");
      setTracks(likedTracks);
    } catch (err) {
      console.error("Failed to load liked tracks:", err);
    } finally {
      setLoading(false);
    }
  };

  const likedTracks = tracks.filter((t) => likedIds.has(String(t.id)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl select-none">
    <div className="flex items-center space-x-6">
    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-[0_0_35px_rgba(244,63,94,0.45)]">
    <Heart size={32} className="text-white fill-white" />
    </div>
    <div>
    <h1 className="text-4xl font-black text-white tracking-tight [text-shadow:_0_4px_20px_rgba(0,0,0,0.8)]">
    Любимые треки
    </h1>
    <p className="text-sm text-white/50 mt-1 font-medium">{likedIds.size} треков</p>
    </div>
    </div>

    <TrackList tracks={likedTracks} onPlayTrack={onPlayTrack} />
    </div>
  );
}
