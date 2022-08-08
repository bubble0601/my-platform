import axios from 'axios';

export interface Song {
  id: number;
  title: string;
  artist: Artist;
  album: Album;
  digest: string;
  filename: string;
  created_at: string;
  time: number;
  year: number | null;
  rating: number;
  played_count: number;
  weight?: number;
}

export interface Metadata {
  format: {
    codec: string;
    length: number;
    channels: number;
    bitrate: number;
    sample_rate: number;
    tag_type: string;
  };
  tags: {
    title: string | null;
    artist: string | null;
    album: string | null;
    album_artist: string | null;
    track: string | null;
    disc: string | null;
    year: string | null;
    lyrics: string | null;
    cover_art?: {
      mime: string;
      data: string; // base64
    }
  };
}

export interface Album {
  id: number;
  title: string;
  artist: string;
}

export interface Artist {
  id: number;
  name: string;
  ruby: string;
}

export interface Playlist {
  id: number;
  name: string;
  songs?: Song[];
}

export interface Smartlist {
  id: number;
  name: string;
  songs?: Song[];
}

export enum NetworkStatus {
  Processing,
  Success,
  Warning,
  Error,
}

export interface DownloadStatus {
  status: NetworkStatus;
  url: string;
  metadata: Record<string, string>;
  song?: Song;
}

export interface UploadStatus {
  status: NetworkStatus;
  data: FormData;
  metadata: Record<string, string>;
  filename: string;
  progress: number;
  songs?: Song[];
  expanded: boolean;
  files: File[];
}

export const getFilepath = (song: Song) => encodeURI(`/static/music/${song.digest}/${song.filename}`);

export default {
  fetchSongs: (params: Record<string, unknown> = {}) => axios.get<Song[]>('/api/music/songs', { params }),
  fetchSong: (id: number) => axios.get<Song>(`/api/music/songs/${id}`),
  fetchAudio: (song: Song) => axios.get<Blob>(getFilepath(song), { responseType: 'blob' }),
  fetchMetadata: (id: number) => axios.get<Metadata>(`/api/music/songs/${id}/metadata`),

  updateSong: (id: number, data: Partial<Song>) => axios.put(`/api/music/songs/${id}`, data),
  updateSongTag: (id: number, data: Record<string, unknown>) => axios.put(`/api/music/songs/${id}/tag`, data),
  incrementPlayedCount: (id: number) => axios.put(`/api/music/songs/${id}/increment`),
  deleteSong: (id: number) => axios.delete(`/api/music/songs/${id}`),

  downloadSong: (status: DownloadStatus) => axios.post<Song | null>('/api/music/songs', {
    url: status.url,
    metadata: status.metadata,
  }),
  uploadSong: (status: UploadStatus) => axios.post<Song[] | null>('/api/music/songs', status.data, {
    onUploadProgress: (e: ProgressEvent) => {
      status.progress = Math.round((e.loaded * 100) / e.total);
    },
  }),

  fetchArtist: (id: number) => axios.get<Artist>(`/api/music/artists/${id}`),
  fetchArtists: () => axios.get<Artist[]>('/api/music/artists'),
  fetchArtistSongs: (id: number) => axios.get<Song[]>(`/api/music/artists/${id}/songs`),
  updateArtist: (id: number, data: Partial<Artist>) => axios.put(`/api/music/artists/${id}`, data),

  fetchPlaylists: () => axios.get<Playlist[]>('/api/music/playlists'),
  fetchPlaylistSongs: (id: number) => axios.get<Song[]>(`/api/music/playlists/${id}/songs`),
  createPlaylist: (name: string) => axios.post<Playlist>('/api/music/playlists', { name }),
  fetchPlaylistSong: (id: number, songId: number) => axios.get<Song>(`/api/music/playlists/${id}/songs/${songId}`),
  addSongToPlaylist: (id: number, songIds: number[]) => axios.post(`/api/music/playlists/${id}/songs`, songIds),
  updatePlaylistSong: (id: number, songId: number, weight: number) =>
                        axios.put(`/api/music/playlists/${id}/songs/${songId}`, { weight }),
  removePlaylistSong: (id: number, songId: number) => axios.delete(`/api/music/playlists/${id}/songs/${songId}`),

  fetchSmartlists: () => axios.get<Smartlist[]>('/api/music/smartlists'),
  fetchSmartlistSongs: (id: number) => axios.get<Song[]>(`/api/music/smartlists/${id}/songs`),

  getCandidates: (url: string) => axios.get<{ title: string[], artist: string[] }>('/api/music/tools/candidates', { params: { url } }),
};
