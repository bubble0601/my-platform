import { VuexModule, Module, Action, Mutation } from 'vuex-module-decorators';
import axios from 'axios';
import { Dictionary, clone, concat, fill, findIndex, last, sample, shuffle as sh, takeRight } from 'lodash';
import { message } from '@/utils/Dialogs';

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

export interface Rule {
  key: string;
  field: 'title' | 'artist' | 'album' | 'album_artist' | 'rating' | 'created_at';
  operator: string;
  value: string | number;
}

export interface Metadata {
  format: {
    codec: string;
    length: number;
    bitrate: string;
    sample_rate: string;
    channels: string;
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

export interface NormalPlaylist {
  id: number;
  name: string;
  songs?: Song[];
}

export enum REPEAT {
  NONE,
  ALL,
  ONE,
}

export const getFilepath = (song: Song) => encodeURI(`/static/music/${song.digest}/${song.filename}`);

const api = {
  fetchSongs: (params: Dictionary<any> = {}) => axios.get<Song[]>('/api/music/songs', { params }),
  fetchSong: (id: number) => axios.get<Song>(`/api/music/songs/${id}`),
  fetchAudio: (song: Song) => axios.get<Blob>(getFilepath(song), { responseType: 'blob' }),
  fetchMetadata: (id: number) => axios.get<Metadata>(`/api/music/songs/${id}/metadata`),

  updateSong: (id: number, data: Partial<Song>) => axios.put(`/api/music/songs/${id}`, data),
  updateSongTag: (id: number, data: Dictionary<any>) => axios.put(`/api/music/songs/${id}/tag`, data),
  incrementPlayedCount: (id: number) => axios.put(`/api/music/songs/${id}/increment`),
  deleteSong: (id: number) => axios.delete(`/api/music/songs/${id}`),

  fetchArtists: () => axios.get<Artist[]>('/api/music/artists'),
  fetchArtistSongs: (id: number) => axios.get<Song[]>(`/api/music/artists/${id}/songs`),

  fetchPlaylists: () => axios.get<Playlist[]>('/api/music/playlists'),
  fetchPlaylistSongs: (id: number) => axios.get<Song[]>(`/api/music/playlists/${id}/songs`),
  createPlaylist: (name: string) => axios.post<NormalPlaylist>('/api/music/playlists', { name }),
  fetchPlaylistSong: (id: number, songId: number) => axios.get<Song>(`/api/music/playlists/${id}/songs/${songId}`),
  addPlaylistSong: (id: number, songIds: number[]) => axios.post(`/api/music/playlists/${id}/songs`, songIds),
  updatePlaylistSong: (id: number, songId: number, weight: number) =>
                        axios.put(`/api/music/playlists/${id}/songs/${songId}`, { weight }),
  removePlaylistSong: (id: number, songId: number) => axios.delete(`/api/music/playlists/${id}/songs/${songId}`),

  fetchSmartlists: () => axios.get<Smartlist[]>('/api/music/smartlists'),
  fetchSmartlistSongs: (id: number) => axios.get<Song[]>(`/api/music/smartlists/${id}/songs`),
};

@Module({ name: 'music' })
export default class MusicModule extends VuexModule {
  public songs: Song[] = [];
  public displayedSongs: Song[] = [];

  public artists: Artist[] = [];
  public artistId: number | null = null;
  public playlists: Playlist[] = [];
  public playlistId: number  | null = null;
  public smartlists: Smartlist[] = [];
  public smartlistId: number | null = null;
  public temporaryPlaylist: Song[] | null = null;

  public current: Song | null = null;
  public audioData: Blob | null = null;
  public audioSrc: string | null = null;
  public audioMetadata: Metadata | null = null;
  private prefetching = false;
  public nextSong: Song | null = null;
  public nextAudio: Blob | null = null;
  public nextMetadata: Metadata | null = null;
  public queue: Song[] = [];
  public queueSet: Song[] = [];
  public history: Song[] = [];

  public playing = false;
  public shuffle = false;
  public repeat: REPEAT = REPEAT.NONE;
  public mute = false;
  public volume = 100;

  public notifySong = false;

  @Mutation
  public SET_SONGS(songs: Song[]) {
    this.songs = songs;
  }

  @Mutation
  private UPDATE_SONGS(data: { id: number, song: Song | null }) {
    const { id, song } = data;
    const n = findIndex(this.songs, { id });
    if (song) {
      if (n >= 0) {
        this.songs = this.songs.map((v, i) => n === i ? song : v);
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
  private SET_PLAYLIST_ID(id: number | null) {
    this.playlistId = id;
  }

  @Mutation
  private SET_SMARTLISTS(smartlists: Smartlist[]) {
    this.smartlists = smartlists;
  }

  @Mutation
  private SET_SMARTLIST_ID(id: number | null) {
    this.smartlistId = id;
  }

  @Mutation
  private RESET_FETCH_SONGS() {
    this.artistId = null;
    this.playlistId = null;
    this.smartlistId = null;
  }

  @Mutation
  public SET_DISPLAYED_SONGS(songs: Song[]) {
    this.displayedSongs = songs;
  }

  @Mutation
  public SET_TEMPORARY_PLAYLIST(songs?: Song[] | null) {
    if (songs === undefined) {
      if (this.temporaryPlaylist) this.songs = this.temporaryPlaylist;
    } else {
      this.temporaryPlaylist = songs;
      this.songs = songs || [];
    }
  }

  @Mutation
  public ADD_TO_TEMPORARY_PLAYLIST(songs: Song[]) {
    if (!this.temporaryPlaylist) return;
    this.temporaryPlaylist.push(...songs);
  }

  @Mutation
  public REMOVE_FROM_TEMPORARY_PLAYLIST(songs: Song[]) {
    if (!this.temporaryPlaylist) return;
    const targetIds = songs.map((s) => s.id);
    this.temporaryPlaylist = this.temporaryPlaylist.filter((s) => !targetIds.includes(s.id));
  }

  // player control
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
  private SET_METADATA(data: Metadata | null) {
    this.audioMetadata = data;
  }

  @Mutation
  private SET_PREFETCHING(data: boolean) {
    this.prefetching = data;
  }

  @Mutation
  private SET_NEXT(data: { song: Song, audio: Blob, metadata: Metadata }) {
    this.nextSong = data.song;
    this.nextAudio = data.audio;
    this.nextMetadata = data.metadata;
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
  private UPDATE_QUEUE_ITEM(song: Song) {
    const find  = (queue: Song[]) => {
      return findIndex(queue, (s) => s.id === song.id && s.digest !== song.digest);
    };
    let n = find(this.queue);
    while (n >= 0) {
      this.queue[n] = song;
      n = find(this.queue);
    }
    n = find(this.queueSet);
    while (n >= 0) {
      this.queueSet[n] = song;
      n = find(this.queueSet);
    }
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

  // Settings
  @Mutation
  private SET_NOTIFY_SONG(val: boolean) {
    this.notifySong = val;
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

  /* Fetchers */
  @Action
  public async FetchAll() {
    this.SET_SONGS([]);
    this.RESET_FETCH_SONGS();
    const { data } = await api.fetchSongs();
    this.SET_SONGS(data);
  }

  @Action
  public async FetchSongs(params: { rules: Rule[][], limit?: number, sortBy?: string }) {
    return await api.fetchSongs(params);
  }

  @Action
  public async FetchArtists() {
    const { data } = await api.fetchArtists();
    this.SET_ARTISTS(data);
  }

  @Action
  public async FetchArtistSongs(id: number) {
    this.SET_SONGS([]);
    this.RESET_FETCH_SONGS();
    this.SET_ARTIST_ID(id);
    const { data } = await api.fetchArtistSongs(id);
    this.SET_SONGS(data);
  }

  @Action
  public async FetchPlaylists() {
    const { data } = await api.fetchPlaylists();
    this.SET_PLAYLISTS(data);
  }

  @Action
  public async FetchPlaylistSongs(id: number) {
    this.SET_SONGS([]);
    this.RESET_FETCH_SONGS();
    this.SET_PLAYLIST_ID(id);
    const { data } = await api.fetchPlaylistSongs(id);
    this.SET_SONGS(data);
  }

  @Action
  public async FetchSmartlists() {
    const { data } = await api.fetchSmartlists();
    this.SET_SMARTLISTS(data);
  }

  @Action
  public async FetchSmartlistSongs(id: number) {
    this.SET_SONGS([]);
    const { data } = await api.fetchSmartlistSongs(id);
    this.RESET_FETCH_SONGS();
    this.SET_SMARTLIST_ID(id);
    this.SET_SONGS(data);
  }

  @Action
  public async ReloadSong(id: number) {
    let data = null;
    if (this.playlistId) {
      const res = await api.fetchPlaylistSong(this.playlistId, id);
      data = res.data;
    } else {
      const res = await api.fetchSong(id);
      data = res.data;
    }
    this.UPDATE_SONGS({ id, song: data });
    this.UPDATE_QUEUE_ITEM(data);
    if (this.current && this.current.id === id) {
      this.SET_CURRENT(data);
    }
    return data;
  }

  @Action
  public async ReloadSongs() {
    if (this.artistId) {
      const { data } = await api.fetchArtistSongs(this.artistId);
      this.SET_SONGS(data);
    } else if (this.playlistId) {
      const { data } = await api.fetchPlaylistSongs(this.playlistId);
      this.SET_SONGS(data);
    } else if (this.smartlistId) {
      const { data } = await api.fetchSmartlistSongs(this.smartlistId);
      this.SET_SONGS(data);
    } else { // all
      const { data } = await api.fetchSongs();
      this.SET_SONGS(data);
    }
  }

  @Action
  public async FetchAudio(song: Song) {
    const results = await Promise.all([
      api.fetchAudio(song),
      api.fetchMetadata(song.id),
    ]);
    return {
      audio: results[0].data,
      meta: results[1].data,
    };
  }

  @Action
  public async FetchAudioForPlay(song: Song) {
    if (!song) return;
    if (song === this.nextSong) {
      this.SET_AUDIO(this.nextAudio);
      this.SET_METADATA(this.nextMetadata);
      return;
    }
    this.SET_AUDIO(null);
    this.SET_METADATA(null);
    const res = await this.FetchAudio(song).catch(this.playing ? this.PlayNext : null);
    if (res) {
      this.SET_AUDIO(res.audio);
      this.SET_METADATA(res.meta);
    }
  }

  @Action
  public async Prefetch() {
    if (this.prefetching) return;
    if (this.repeat === REPEAT.ONE || this.queue.length === 0) return;
    const next = this.queue[0];
    if (next === this.nextSong) return;
    this.SET_PREFETCHING(true);
    const res = await this.FetchAudio(next);
    this.SET_NEXT({ song: next, audio: res.audio, metadata: res.meta });
    this.SET_PREFETCHING(false);
  }

  /* Player controls */
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

  @Action
  public async Play(song: Song | undefined) {
    if (!song) return;
    this.SET_CURRENT(song);
    await this.FetchAudioForPlay(song);
    this.SET_PLAYING(true);
  }

  @Action
  public Pause() {
    this.SET_PLAYING(false);
  }

  @Action
  public async PlayAndSet(song: Song | undefined) {
    if (!song) return;
    this.Play(song);
    this.setQueue({ song, songs: this.songs });
  }

  @Action
  public PlaySongs(songs: Song[]) {
    const song = sample(songs);
    if (!song) return;
    this.Play(song);
    this.setQueue({ song, songs: this.songs });
  }

  @Action
  public PlayFromQueue(i: number) {
    const song = this.queue[i];
    this.SET_CURRENT(song);
    this.FetchAudioForPlay(song);
    this.SET_QUEUE(this.queue.slice(i + 1));
    this.updateQueue();
  }

  @Action
  public PlayNext() {
    this.OP_HISTORY('push');
    const next = this.queue[0];
    if (next) {
      const promise = this.FetchAudioForPlay(next);
      this.SET_CURRENT(next);
      this.SHIFT_QUEUE();
      this.updateQueue();
      return promise;
    } else {
      this.SET_CURRENT(null);
      this.SET_AUDIO(null);
      this.SET_METADATA(null);
    }
  }

  @Action
  public PlayPrev() {
    const prev = last(this.history);
    if (prev) {
      const promise = this.FetchAudioForPlay(prev);
      this.UNSHIFT_QUEUE();
      this.SET_CURRENT(prev);
      this.OP_HISTORY('pop');
      return promise;
    }
  }

  @Action
  public InsertIntoNext(songs: Song[]) {
    songs.reverse().forEach((s) => {
      this.UNSHIFT_QUEUE(s);
    });
  }

  /* Operations */
  @Action
  public async UpdateSong(payload: { id: number, data: Partial<Song> }) {
    const { id, data } = payload;
    await api.updateSong(id, data);
  }

  @Action
  public async IncrementPlayedCount(id: number) {
    return await api.incrementPlayedCount(id);
  }

  @Action
  public async UpdateSongTag(payload: { id: number, data: Dictionary<string | null> }) {
    const { id, data } = payload;
    return await api.updateSongTag(id, data);
  }

  @Action
  public DeleteSong(id: number) {
    api.deleteSong(id);
    this.UPDATE_SONGS({ id, song: null });
  }

  @Action
  public async CreatePlaylist(data: { name: string, songs: Song[]}) {
    const res = await api.createPlaylist(data.name);
    if (data.songs.length === 0) return res.data.id;
    await api.addPlaylistSong(res.data.id, data.songs.map((s) => s.id));
    return res.data.id;
  }

  @Action
  public async AddPlaylistSong(data: { id: number, songs: Song[] }) {
    if (this.songs.length === 0) return;
    return await api.addPlaylistSong(data.id, data.songs.map((s) => s.id));
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
  public async RemovePlaylistSong(data: { songs: Song[] }) {
    if (this.songs.length === 0) return;
    if (!this.playlistId) return;
    const id = this.playlistId;
    const promises: Array<Promise<any>> = [];
    data.songs.forEach((song) => {
      const p = api.removePlaylistSong(id, song.id);
      promises.push(p);
    });
    await Promise.all(promises);
  }

  /* Settings */

  @Action
  public EnableSongNotification() {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission((status) => {
        if (status === 'granted') {
          this.SET_NOTIFY_SONG(true);
        }
      });
    } else {
      this.SET_NOTIFY_SONG(true);
    }
  }

  @Action
  public DisableSongNotification() {
    this.SET_NOTIFY_SONG(false);
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
  // 'artistId',
  // 'playlistId',
  // 'smartlistId',
  'notifySong',
];
export const paths = keys.map((k) => `music.${k}`);
