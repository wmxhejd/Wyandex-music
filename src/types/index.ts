export interface Track {
  id: string;
  title: string;
  artists: Artist[];
  coverUri?: string;
  durationMs: number;
}

export interface Artist {
  id: number;
  name: string;
}

export interface Playlist {
  kind: number;
  title: string;
  trackCount: number;
  cover?: {
    uri?: string;
    itemsUri?: string[];
    dir?: string;
  };
  ogImage?: string;
}

export interface AccountInfo {
  account: {
    uid: number;
    login: string;
    displayName?: string;
  };
}
