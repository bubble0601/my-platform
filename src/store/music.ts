import { VuexModule, Module, Action, Mutation } from 'vuex-module-decorators';
import axios, { AxiosRequestConfig } from 'axios';
import { clone, concat, isEmpty, fill, findIndex, last, shuffle as sh, takeRight } from 'lodash';
import { Dict } from '@/types';
import { message } from '@/utils/Dialogs';

export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  digest: string;
  filename: string;
  time: number;
  year: number | null;
  rate: number;
  album_artist: string;
  weight?: number;
}

export interface Artist {
  id: number;
  name: string;
}

export interface Playlist {
  id: number;
  name: string;
  songs?: Song[];
}

interface FetchSongParams {
  tab?: string;
  artist?: number;
  playlist?: number;
}

export enum REPEAT {
  NONE,
  ALL,
  ONE,
}

const getFilename = (song: Song) => `/static/music/${song.digest}/${song.filename}`;

const api = {
  fetchSongs: (params: FetchSongParams) => axios.get<Song[]>('/api/music/songs', { params }),
  fetchSong: (id: number) => axios.get<Song>(`/api/music/songs/${id}`),
  fetchAudio: (song: Song) => axios.get<Blob>(getFilename(song), { responseType: 'blob' }),
  uploadSong: (data: FormData, config: AxiosRequestConfig) => axios.post('/api/music/songs', data, config),
  downloadSong: (data: { url: string, metadata: Dict<string> }) => axios.post('/api/music/songs', data),
  updateSong: (id: number, data: Partial<Song>) => axios.put(`/api/music/songs/${id}`, data),
  updateSongTag: (id: number, data: Dict<any>) => axios.put(`/api/music/songs/${id}/tag`, data),
  fixSong: (id: number) => axios.put(`/api/music/songs/${id}/fix`),

  fetchArtists: () => axios.get<Artist[]>('/api/music/artists'),

  fetchPlaylists: () => axios.get<Playlist[]>('/api/music/playlists'),
  fetchPlaylist: (id: number) => axios.get<Required<Playlist>>(`/api/music/playlists/${id}`),
  createPlaylist: (name: string) => axios.post<Playlist>('/api/music/playlists', { name }),
  fetchPlaylistSong: (id: number, songId: number) => axios.get(`/api/music/playlists/${id}/songs/${songId}`),
  addPlaylistSong: (id: number, songIds: number[]) => axios.post(`/api/music/playlists/${id}/songs`, songIds),
  updatePlaylistSong: (id: number, songId: number, weight: number) =>
                        axios.put(`/api/music/playlists/${id}/songs/${songId}`, { weight }),
  removePlaylistSong: (id: number, songId: number) => axios.delete(`/api/music/playlists/${id}/songs/${songId}`),

  prepareSync: () => axios.get<{ output: string }>('/api/music/sync/testrun'),
  sync: () => axios.post<{ output: string }>('/api/music/sync/run'),
  scan: () => axios.post<{ output: string }>('/api/music/scan'),
};

@Module({ name: 'music' })
export default class MusicModule extends VuexModule {
  private tab = '';  // for FetchSongs

  public songs: Song[] = [];
  public displayedSongs: Song[] = [];

  public artists: Artist[] = [];
  public artistId: number | null = null;
  public playlists: Playlist[] = [];
  public playlistId: number | null = null;

  public current: Song | null = null;
  public audioData: Blob | null = null;
  public audioSrc: string | null = null;
  public queue: Song[] = [];
  public queueSet: Song[] = [];
  public history: Song[] = [];

  public playing = false;
  public shuffle = false;
  public repeat: REPEAT = REPEAT.NONE;
  public mute = false;
  public volume = 100;

  @Mutation
  private SET_TAB(tab: string) {
    this.tab = tab;
  }

  @Mutation
  private SET_SONGS(songs: Song[]) {
    this.songs = songs;
  }

  @Mutation
  private UPDATE_SONGS(data: { id: number, song: Song }) {
    const { id, song } = data;
    const n = findIndex(this.songs, { id });
    if (n >= 0) {
      this.songs = this.songs.map((v, i) => n === i ? song : v);
    } else {
      this.songs.push(song);
    }
  }

  @Mutation
  private SET_ARTISTS(artists: Artist[]) {
    this.artists = artists;
  }

  @Mutation
  private SET_ARTIST_ID(id: number | null) {
    this.artistId = id;
  }

  @Mutation
  private SET_PLAYLISTS(playlists: Playlist[]) {
    this.playlists = playlists;
  }

  @Mutation
  private SET_PLAYLIST_ID(id: number | null) {
    this.playlistId = id;
  }

  @Mutation
  public SET_DISPLAYED_SONGS(songs: Song[]) {
    this.displayedSongs = songs;
  }

  @Mutation
  public SET_CURRENT(song: Song | null) {
    this.current = song;
  }

  @Mutation
  private SET_AUDIO(data: Blob | null) {
    if (data) {
      this.audioData = data;
      this.audioSrc = URL.createObjectURL(data);
    } else {
      if (this.audioSrc) URL.revokeObjectURL(this.audioSrc);
      this.audioData = null;
      this.audioSrc = null;
    }
  }

  @Mutation
  public SET_QUEUE(songs: Song[]) {
    this.queue = songs;
  }

  @Mutation
  public REMOVE_FROM_QUEUE(i: number) {
    this.queue = concat(this.queue.slice(0, i), this.queue.slice(i + 1));
  }

  @Mutation
  private SET_QUEUE_SET(songs: Song[]) {
    this.queueSet = songs;
  }

  @Mutation
  private OP_QUEUE(op: string) {
    switch (op) {
      case 'unshift':
        if (this.current) {
          this.queue.unshift(this.current);
        }
        break;
      case 'shift':
        this.queue.shift();
        break;
    }
  }

  @Mutation
  private PUSH_QUEUE(songs: Song[]) {
    this.queue.push(...songs);
  }

  @Mutation
  private OP_HISTORY(op: string) {
    switch (op) {
      case 'push':
        if (this.current) {
          this.history.push(this.current);
          if (this.history.length > 100) this.history = takeRight(this.history, 100);
        }
        break;
      case 'pop':
        this.history.pop();
        break;
    }
  }

  @Mutation
  public SET_PLAYING(val: boolean) {
    if (val === false || this.current != null) {
      this.playing = val;
    }
  }

  @Mutation
  public SET_SHUFFLE(val: boolean) {
    this.shuffle = val;

  }

  @Mutation
  public SET_REPEAT(val: REPEAT) {
    this.repeat = val;
  }

  @Mutation
  public SET_MUTE(val: boolean) {
    this.mute = val;
  }

  @Mutation
  public SET_VOLUME(val: number) {
    this.volume = val;
  }

  // Queueにセットする
  // REPEAT=ALLの場合、Queueが30以上になるようにする
  @Action
  private setQueue(data: { song: Song | null, songs?: Song[]} | Song | null) {
    const song = data && 'song' in data ? data.song : data;
    let songs = data && 'songs' in data ? data.songs : null;

    if (songs && songs.length > 0 && songs[0].weight) {
      const rsongs = songs as Array<Required<Song>>;
      songs = [];
      rsongs.forEach((s) => {
        songs!.push(...fill(Array(s.weight), s));
      });
    }

    if (songs) this.SET_QUEUE_SET(clone(songs));
    songs = songs || this.queueSet;

    if (this.repeat === REPEAT.ONE || songs.length === 0) {
      this.SET_QUEUE([]);
    } else {
      let queue = clone(songs);
      if (song) {
        const i = songs.indexOf(song);
        if (i >= 0) {
          queue = concat(songs.slice(i + 1), songs.slice(0, i));
        }
      }
      if (this.shuffle) {
        queue = sh(queue);
        if (this.repeat === REPEAT.ALL) {
          while (queue.length < 30) {
            queue.push(...sh(songs));
          }
        }
        this.SET_QUEUE(queue);
      } else {
        if (this.repeat === REPEAT.ALL) {
          while (queue.length < 30) {
            queue.push(...songs);
          }
        }
        this.SET_QUEUE(queue);
      }
    }
  }

  // REPEAT=ALLの場合、Queueが30以下になったら補充
  @Action
  private updateQueue() {
    if (this.repeat !== REPEAT.ALL) return;
    const queue = this.queueSet;
    if (!queue.length) return;
    while (this.queue.length < 30) {
      this.PUSH_QUEUE(this.shuffle ? sh(queue) : queue);
    }
  }

  @Action({ rawError: true })
  public async FetchSongs(params: FetchSongParams = {}) {
    this.SET_SONGS([]);
    if (params.artist) this.SET_ARTIST_ID(params.artist);
    else this.SET_ARTIST_ID(null);

    if (params.playlist) this.SET_PLAYLIST_ID(params.playlist);
    else this.SET_PLAYLIST_ID(null);

    if (params.tab) {
      this.SET_TAB(params.tab);
    } else if (isEmpty(params)) {
      params.tab = this.tab;
    }

    const { data } = await api.fetchSongs(params);
    this.SET_SONGS(data);
  }

  @Action
  public async FetchArtists() {
    const { data } = await api.fetchArtists();
    this.SET_ARTISTS(data);
  }

  @Action
  public async FetchPlaylists() {
    const { data } = await api.fetchPlaylists();
    this.SET_PLAYLISTS(data);
  }

  @Action({ rawError: true })
  public async FetchAudio(song: Song) {
    if (!song) return;
    this.SET_AUDIO(null);
    const res = await api.fetchAudio(song).catch(this.PlayNext);
    if (res) {
      this.SET_AUDIO(res.data);
    }
  }

  @Action
  public async ReloadSong(id: number) {
    const { data } = await api.fetchSong(id);
    this.UPDATE_SONGS({ id, song: data });
  }

  @Action
  public async ReloadPlaylistSong(sid: number) {
    if (this.playlistId) {
      const { data } = await api.fetchPlaylistSong(this.playlistId, sid);
      this.UPDATE_SONGS({ id: sid, song: data });
    } else {
      message.error('An error occurred');
    }
  }

  @Action
  public SetControl(data: { shuffle?: boolean, repeat?: REPEAT }) {
    const { shuffle, repeat } = data;
    if (shuffle != null) {
      this.SET_SHUFFLE(shuffle);
      if (this.current) {
        this.setQueue(this.current);
      }
    }
    if (repeat != null) {
      this.SET_REPEAT(repeat);
      if (this.current) {
        this.setQueue(this.current);
      }
    }
  }

  @Action({ rawError: true })
  public Play(song: Song | undefined) {
    if (!song) return;
    this.SET_CURRENT(song);
    this.FetchAudio(song);
    this.SET_PLAYING(true);
    this.setQueue({ song, songs: this.displayedSongs });
  }

  @Action
  public PlayFromQueue(i: number) {
    const song = this.queue[i];
    this.SET_CURRENT(song);
    this.FetchAudio(song);
    this.SET_QUEUE(this.queue.slice(i + 1));
    this.updateQueue();
  }

  @Action
  public PlayNext() {
    this.OP_HISTORY('push');
    const next = this.queue[0];
    if (next) {
      this.SET_CURRENT(next);
      this.FetchAudio(next);
      this.OP_QUEUE('shift');
      this.updateQueue();
    } else {
      this.SET_CURRENT(null);
      this.SET_AUDIO(null);
    }
  }

  @Action
  public PlayPrev() {
    const prev = last(this.history);
    if (prev) {
      this.OP_QUEUE('unshift');
      this.SET_CURRENT(prev);
      this.FetchAudio(prev);
      this.OP_HISTORY('pop');
    }
  }

  @Action
  public async UpdateSong(payload: { id: number, data: Partial<Song> }) {
    const { id, data } = payload;
    await api.updateSong(id, data);
  }

  @Action({ rawError: true })
  public async UpdateSongTag(payload: { id: number, data: Dict<string> }) {
    const { id, data } = payload;
    await api.updateSongTag(id, data);
  }

  @Action({ rawError: true })
  public async Upload(payload: { data: FormData, onUploadProgress: (e: ProgressEvent) => void }) {
    const { data, onUploadProgress } = payload;
    const config: AxiosRequestConfig = {};
    if (onUploadProgress) config.onUploadProgress = onUploadProgress;
    await api.uploadSong(data, config);
  }

  @Action({ rawError: true })
  public async Download(data: { url: string, metadata: Dict<string> }) {
    await api.downloadSong(data);
  }

  @Action
  public async CreatePlaylist(data: { name: string, songs: Song[]}) {
    const res = await api.createPlaylist(data.name);
    if (this.songs.length === 0) return;
    await api.addPlaylistSong(res.data.id, data.songs.map((s) => s.id));
  }

  @Action
  public AddPlaylistSong(data: { id: number, songs: Song[] }) {
    if (this.songs.length === 0) return;
    api.addPlaylistSong(data.id, data.songs.map((s) => s.id));
  }

  @Action
  public async UpdatePlaylistSong(payload: { id: number, data: { weight: number } }) {
    const { id, data } = payload;
    if (this.playlistId) {
      await api.updatePlaylistSong(this.playlistId, id, data.weight);
    } else {
      message.error('An error occurred');
    }
  }

  @Action
  public RemovePlaylistSong(data: { songs: Song[] }) {
    if (this.songs.length === 0) return;
    if (!this.playlistId) return;
    data.songs.forEach((song) => {
      api.removePlaylistSong(this.playlistId!, song.id);
    });
  }

  @Action
  public Fix(id: number) {
    api.fixSong(id);
  }

  @Action
  public async PrepareSync() {
    const { data } = await api.prepareSync();
    return data;
  }

  @Action
  public async Sync() {
    const { data } = await api.sync();
    return data;
  }

  @Action
  public async Scan() {
    const { data } = await api.scan();
    return data;
  }
}

const keys = [
  'current',
  'queue',
  'queueSet',
  'history',
  'shuffle',
  'repeat',
  'mute',
  'volume',
  'artistId',
  'playlistId',
];
export const paths = keys.map((str) => `music.${str}`);
