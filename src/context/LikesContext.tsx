import React, { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface LikesContextType {
  likedIds: Set<string>;
  isLiked: (trackId: string) => boolean;
  toggleLike: (trackId: string) => Promise<void>;
  loadLikedTracks: () => Promise<void>;
}

const LikesContext = createContext<LikesContextType | null>(null);

export function LikesProvider({ children }: { children: React.ReactNode }) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const loadLikedTracks = async () => {
    try {
      const ids = await invoke<string[]>('get_liked_track_ids');
      setLikedIds(new Set(ids.map(String)));
    } catch (err) {
      console.error('Failed to load liked track ids:', err);
    }
  };

  useEffect(() => {
    loadLikedTracks();
  }, []);

  const isLiked = (trackId: string): boolean => {
    return likedIds.has(String(trackId));
  };

  const toggleLike = async (trackId: string): Promise<void> => {
    const id = String(trackId);
    const wasLiked = likedIds.has(id);

    setLikedIds(prev => {
      const next = new Set(prev);
      if (wasLiked) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    try {
      await invoke('toggle_like_track', { trackId: id });
    } catch (err) {
      console.error('Failed to toggle like:', err);
      setLikedIds(prev => {
        const next = new Set(prev);
        if (wasLiked) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    }
  };

  return (
    <LikesContext.Provider value={{ likedIds, isLiked, toggleLike, loadLikedTracks }}>
    {children}
    </LikesContext.Provider>
  );
}

export function useLikes() {
  const context = useContext(LikesContext);
  if (!context) {
    throw new Error('useLikes must be used within LikesProvider');
  }
  return context;
}
