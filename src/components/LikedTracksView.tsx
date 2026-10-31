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
      const likedTracks = await invoke<Track[]>('get_liked_tracks');
      setTracks(likedTracks);
    } catch (err) {
      console.error("Failed to load liked tracks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter tracks to only show ones that are still liked
  const likedTracks = tracks.filter(t => likedIds.has(String(t.id)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="glass rounded-2xl p-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-2xl p-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-2xl">
            <Heart size={32} className="text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Любимые треки</h1>
            <p className="text-[var(--text-secondary)]">{likedIds.size} треков</p>
          </div>
        </div>
      </div>

      <TrackList tracks={likedTracks} onPlayTrack={onPlayTrack} />
    </div>
  );
}
