import { VuexModule, Module, Action, Mutation } from 'vuex-module-decorators';
import axios, { AxiosRequestConfig } from 'axios';
import { clone, concat, isNumber, fill, findIndex, last, shuffle as sh, takeRight } from 'lodash';
import { Dict } from '@/types';
import { message } from '@/utils/Dialogs';

export interface Song {
  id: number;
  title: string;
  artist: Artist;
  album: Album;
  digest: string;
  filename: string;
  time: number;
  year: number | null;
  rate: number;
  weight?: number;
}

export interface Album {
  id: number;
  title: string;
  artist: string;
}

export interface Artist {
  id: number;
  name: string;
}

export interface Playlist {
  id: number | string;
  name: string;
  songs?: Song[];
}

export interface NormalPlaylist {
  id: number;
  name: string;
  songs?: Song[];
}

interface FetchSongParams {
  artist?: number;
  playlist?: number | string;
}

interface CandidateResponse {
  title: string[];
  artist: string[];
}

export enum REPEAT {
  NONE,
  ALL,
  ONE,
}

export const getFilename = (song: Song) => `/static/music/${song.digest}/${song.filename}`;

const api = {
  fetchSongs: (params: FetchSongParams) => axios.get<Song[]>('/api/music/songs', { params }),
  fetchSong: (id: number) => axios.get<Song>(`/api/music/songs/${id}`),
  fetchAudio: (song: Song) => axios.get<Blob>(getFilename(song), { responseType: 'blob' }),

  uploadSong: (data: FormData, config: AxiosRequestConfig) => axios.post<Song[] | null>('/api/music/songs', data, config),
  downloadSong: (data: { url: string, metadata: Dict<string> }) => axios.post<Song | null>('/api/music/songs', data),
  getCandidates: (url: string) => axios.get<CandidateResponse>('/api/music/tools/candidates', { params: { url } }),

  updateSong: (id: number, data: Partial<Song>) => axios.put(`/api/music/songs/${id}`, data),
  updateSongTag: (id: number, data: Dict<any>) => axios.put(`/api/music/songs/${id}/tag`, data),
  deleteSong: (id: number) => axios.delete(`/api/music/songs/${id}`),
  fixSong: (id: number) => axios.put(`/api/music/songs/${id}/fix`),

  fetchArtists: () => axios.get<Artist[]>('/api/music/artists'),

  fetchPlaylists: () => axios.get<Playlist[]>('/api/music/playlists'),
  fetchPlaylist: (id: number) => axios.get<Required<Playlist>>(`/api/music/playlists/${id}`),
  createPlaylist: (name: string) => axios.post<NormalPlaylist>('/api/music/playlists', { name }),
  fetchPlaylistSong: (id: number | string, songId: number) => axios.get(`/api/music/playlists/${id}/songs/${songId}`),
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
  public songs: Song[] = [];
  public displayedSongs: Song[] = [];

  public artists: Artist[] = [];
  public artistId: number | null = null;
  public playlists: Playlist[] = [];
  public playlistId: number | string | null = null;

  public livePlaylists: Playlist[] = [
    { id: 'new', name: 'New' },
    { id: 'fabulous', name: 'Fabulous' },
    { id: 'excellent', name: 'Excellent' },
    { id: 'great', name: 'Great' },
    { id: 'good', name: 'Good' },
    { id: 'unrated', name: 'Unrated' },
  ];

  public current: Song | null = null;
  public audioData: Blob | null = null;
  public audioSrc: string | null = null;
  public nextSong: Song | null = null;
  public nextAudio: Blob | null = null;
  public queue: Song[] = [];
  public queueSet: Song[] = [];
  public history: Song[] = [];

  public playing = false;
  public shuffle = false;
  public repeat: REPEAT = REPEAT.NONE;
  public mute = false;
  public volume = 100;

  @Mutation
  private SET_SONGS(songs: Song[]) {
    this.songs = songs;
  }

  @Mutation
  private UPDATE_SONGS(data: { id: number, song: Song | null }) {
    const { id, song } = data;
    const n = findIndex(this.songs, { id });
    if (song) {
      if (n >= 0) {
        this.songs = this.songs.map((v, i) => n === i ? song : v);
      } else {
        this.songs.push(song);
      }
    } else {
      this.songs = this.songs.filter((v, i) => n !== i);
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
  private SET_PLAYLIST_ID(id: number | string | null) {
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
      this.audioSrc = '';
    }
  }

  @Mutation
  private SET_NEXT(data: { song: Song, audio: Blob | null}) {
    this.nextSong = data.song;
    this.nextAudio = data.audio;
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
  private SHIFT_QUEUE() {
    this.queue.shift();
  }

  @Mutation
  private UNSHIFT_QUEUE(song = this.current) {
    if (song) {
      this.queue.unshift(song);
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
    if (song === this.nextSong && this.nextAudio) {
      this.SET_AUDIO(this.nextAudio);
      return;
    }
    this.SET_AUDIO(null);
    const res = await api.fetchAudio(song).catch(this.playing ? this.PlayNext : null);
    if (res) {
      this.SET_AUDIO(res.data);
    }
  }

  @Action
  public async Prefetch() {
    if (this.repeat === REPEAT.ONE || this.queue.length === 0) return;
    const next = this.queue[0];
    if (next === this.nextSong) return;
    const res = await api.fetchAudio(next).catch(() => {
      this.SET_NEXT({ song: next, audio: null });
    });
    if (res) {
      this.SET_NEXT({ song: next, audio: res.data });
    }
  }

  @Action
  public async ReloadSong(id: number) {
    const { data } = await api.fetchSong(id);
    this.UPDATE_SONGS({ id, song: data });
    if (this.current && this.current.id === id) {
      this.SET_CURRENT(data);
    }
  }

  @Action
  public async ReloadSongs() {
    const params: FetchSongParams = {};
    params.artist = this.artistId || undefined;
    params.playlist = this.playlistId || undefined;

    const { data } = await api.fetchSongs(params);
    this.SET_SONGS(data);
  }

  @Action
  public async ReloadPlaylistSong(sid: number) {
    if (this.playlistId) {
      const { data } = await api.fetchPlaylistSong(this.playlistId, sid);
      this.UPDATE_SONGS({ id: sid, song: data });
      if (this.current && this.current.id === sid) {
        this.SET_CURRENT(data);
      }
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
  public async Play(song: Song | undefined) {
    if (!song) return;
    this.SET_CURRENT(song);
    await this.FetchAudio(song);
    this.SET_PLAYING(true);
  }

  @Action
  public async PlayAndSet(song: Song | undefined) {
    if (!song) return;
    this.Play(song);
    this.setQueue({ song, songs: this.songs });
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
      const promise = this.FetchAudio(next);
      this.SET_CURRENT(next);
      this.SHIFT_QUEUE();
      this.updateQueue();
      promise.then(() => this.SET_PLAYING(true));
      return promise;
    } else {
      this.SET_CURRENT(null);
      this.SET_AUDIO(null);
    }
  }

  @Action
  public PlayPrev() {
    const prev = last(this.history);
    if (prev) {
      const promise = this.FetchAudio(prev);
      this.UNSHIFT_QUEUE();
      this.SET_CURRENT(prev);
      this.OP_HISTORY('pop');
      return promise;
    }
  }

  @Action
  public InsertIntoNext(song: Song) {
    this.UNSHIFT_QUEUE(song);
  }

  @Action
  public Insert(songs: Song[]) {
    songs.reverse().forEach((s) => {
      this.UNSHIFT_QUEUE(s);
    });
  }

  @Action
  public async UpdateSong(payload: { id: number, data: Partial<Song> }) {
    const { id, data } = payload;
    await api.updateSong(id, data);
  }

  @Action({ rawError: true })
  public async UpdateSongTag(payload: { id: number, data: Dict<string | null> }) {
    const { id, data } = payload;
    await api.updateSongTag(id, data);
  }

  @Action
  public DeleteSong(id: number) {
    api.deleteSong(id);
    this.UPDATE_SONGS({ id, song: null });
  }

  @Action({ rawError: true })
  public async Upload(payload: { data: FormData, onUploadProgress: (e: ProgressEvent) => void }) {
    const { data, onUploadProgress } = payload;
    const config: AxiosRequestConfig = {};
    config.onUploadProgress = onUploadProgress;
    return await api.uploadSong(data, config);
  }

  @Action({ rawError: true })
  public async Download(data: { url: string, metadata: Dict<string> }) {
    return await api.downloadSong(data);
  }

  @Action
  public async GetCandidatesFromURL(url: string) {
    return await api.getCandidates(url);
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
    if (isNumber(this.playlistId)) {
      await api.updatePlaylistSong(this.playlistId, id, data.weight);
    } else {
      message.error('An error occurred');
    }
  }

  @Action
  public RemovePlaylistSong(data: { songs: Song[] }) {
    if (this.songs.length === 0) return;
    if (!this.playlistId || !isNumber(this.playlistId)) return;
    const id = this.playlistId;
    data.songs.forEach((song) => {
      api.removePlaylistSong(id, song.id);
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

// 永続化する値
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
export const paths = keys.map((k) => `music.${k}`);
