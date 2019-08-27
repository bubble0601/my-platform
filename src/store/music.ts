import { VuexModule, Module, Action, Mutation } from 'vuex-module-decorators';
import axios, { AxiosRequestConfig } from 'axios';
import { concat, findIndex, last, shuffle as sh, isEmpty } from 'lodash';
import { Obj } from '@/types';

export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  digest: string;
  filename: string;
  time: number;
  year: number;
  rate: number;
}

export interface Artist {
  id: number;
  name: string;
}

interface FetchSongParams {
  tab?: string;
  artist?: number;
}

export enum REPEAT {
  NONE,
  ALL,
  ONE,
}

const getFilename = (song: Song) => `/static/music/${song.digest}/${song.filename}`;

const api = {
  fetchSongs: (params: FetchSongParams) => {
    return axios.get<Song[]>('/api/music/songs', { params });
  },
  fetchSong: (id: number) => axios.get<Song>(`/api/music/songs/${id}`),
  fetchAudio: (song: Song) => axios.get<Blob>(getFilename(song), { responseType: 'blob' }),
  uploadSong: (data: FormData, config: AxiosRequestConfig) => axios.post('/api/music/songs/new', data, config),
  downloadSong: (data: { url: string, metadata: Obj<string> }) => axios.post('/api/music/songs/new', data),
  updateSong: (id: number, data: Obj<any>) => axios.put(`/api/music/songs/${id}`, data),

  fetchArtists: () => axios.get<Artist[]>('/api/music/artists'),
};

@Module({ name: 'music' })
export default class Music extends VuexModule {
  private tab = '';  // for FetchSongs

  public songs: Song[] = [];
  public displayedSongs: Song[] = [];

  public artists: Artist[] = [];

  public current: Song | null = null;
  public audioData: Blob | null = null;
  public audioSrc: string | null = null;
  public queue: Song[] = [];
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
  private SET_QUEUE(songs: Song[]) {
    this.queue = songs;
  }

  @Mutation
  public REMOVE_FROM_QUEUE(i: number) {
    this.queue = concat(this.queue.slice(0, i), this.queue.slice(i + 1));
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
  private OP_HISTORY(op: string) {
    switch (op) {
      case 'push':
        if (this.current) {
          this.history.push(this.current);
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

  @Action
  private setQueue(song: Song | null, songs: Song[] = this.displayedSongs) {
    if (this.repeat === REPEAT.ONE) {
      this.SET_QUEUE([]);
    } else {
      let queue = songs;
      if (song) {
        const i = songs.indexOf(song);
        if (i >= 0) {
          queue = concat(songs.slice(i + 1), songs.slice(0, i));
        }
      }
      if (this.shuffle) {
        this.SET_QUEUE(sh(queue));
      } else {
        this.SET_QUEUE(queue);
      }
    }
  }

  @Action({ rawError: true })
  public async FetchSongs(params: FetchSongParams = {}) {
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

  @Action({ rawError: true })
  public async FetchAudio(song: Song) {
    if (!song) return;
    const res = await api.fetchAudio(song).catch(this.PlayNext);
    if (res) {
      this.SET_AUDIO(res.data);
    }
  }

  @Action
  private async updateSong(id: number) {
    const { data } = await api.fetchSong(id);
    this.UPDATE_SONGS({ id, song: data });
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
    this.SET_AUDIO(null);
    this.FetchAudio(song);
    this.SET_PLAYING(true);
    this.setQueue(song);
  }

  @Action
  public PlayNext() {
    this.OP_HISTORY('push');
    const next = this.queue[0];
    if (next) {
      this.SET_CURRENT(next);
      this.SET_AUDIO(null);
      this.FetchAudio(next);
      this.OP_QUEUE('shift');
    } else if (this.repeat === REPEAT.ALL && this.history.length > 0) {
      this.setQueue(null, this.history);
      this.PlayNext();
    } else {
      this.SET_CURRENT(null);
    }
  }

  @Action
  public PlayPrev() {
    const prev = last(this.history);
    if (prev) {
      this.OP_QUEUE('unshift');
      this.SET_CURRENT(prev);
      this.SET_AUDIO(null);
      this.FetchAudio(prev);
      this.OP_HISTORY('pop');
    }
  }

  @Action
  public async UpdateSong(payload: { id: number, data: Obj<any> }) {
    const { id, data } = payload;
    await api.updateSong(id, data);
    this.updateSong(id);
  }

  @Action({ rawError: true })
  public async Upload(payload: { data: FormData, onUploadProgress: (e: ProgressEvent) => void }) {
    const { data, onUploadProgress } = payload;
    const config: AxiosRequestConfig = {};
    if (onUploadProgress) config.onUploadProgress = onUploadProgress;
    await api.uploadSong(data, config);
  }

  @Action({ rawError: true })
  public async Download(data: { url: string, metadata: Obj<string> }) {
    await api.downloadSong(data);
  }
}

const keys = [
  'current',
  'queue',
  'history',
  'shuffle',
  'repeat',
  'mute',
  'volume',
];
export const paths = keys.map((str) => `music.${str}`);
