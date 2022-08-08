import { VuexModule, Module, Action, Mutation, config } from 'vuex-module-decorators';
config.rawError = true;

import { clone, concat, fill, findIndex, last, sample, shuffle, takeRight } from 'lodash';
import { MusicApi } from '@/api';
import { Song, Playlist, Metadata } from '@/api/music';

export enum REPEAT {
  NONE,
  ALL,
  ONE,
}

@Module({ namespaced: true, name: 'music' })
export default class MusicModule extends VuexModule {
  public playlists: Playlist[] = [];

  // player data
  public currentSong: Song | null = null;
  public currentAudio: Blob | null = null;
  public currentAudioSrc: string | null = null;
  public currentMetadata: Metadata | null = null;

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
  private SET_PLAYLISTS(playlists: Playlist[]) {
    this.playlists = playlists;
  }

  // player control
  @Mutation
  public SET_CURRENT(song: Song | null) {
    this.currentSong = song;
  }

  @Mutation
  private SET_AUDIO(data: Blob | null) {
    if (data) {
      this.currentAudio = data;
      this.currentAudioSrc = URL.createObjectURL(data);
    } else {
      if (this.currentAudioSrc) URL.revokeObjectURL(this.currentAudioSrc);
      this.currentAudio = null;
      this.currentAudioSrc = '';
    }
  }

  @Mutation
  private SET_METADATA(data: Metadata | null) {
    this.currentMetadata = data;
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
  private UNSHIFT_QUEUE(song = this.currentSong) {
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

  // @Mutation
  // private OP_HISTORY(op: string) {
  //   switch (op) {
  //     case 'push':
  //       if (this.current) {
  //         this.history.push(this.current);
  //         if (this.history.length > 100) this.history = takeRight(this.history, 100);
  //       }
  //       break;
  //     case 'pop':
  //       this.history.pop();
  //       break;
  //   }
  // }
  @Mutation
  private PUSH_HISTORY() {
    if (this.currentSong) {
      this.history.push(this.currentSong);
      if (this.history.length > 100) this.history = takeRight(this.history, 100);
    }
  }

  @Mutation
  private POP_HISTORY() {
    this.history.pop();
  }

  @Mutation
  public SET_PLAYING(val: boolean) {
    if (val === false || this.currentSong != null) {
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
      for (const s of rsongs) {
        songs.push(...fill(Array(s.weight), s));
      }
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
        queue = shuffle(queue);
        if (this.repeat === REPEAT.ALL) {
          while (queue.length < 30) {
            queue.push(...shuffle(songs));
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
      this.PUSH_QUEUE(this.shuffle ? shuffle(queue) : queue);
    }
  }

  /* Fetch */
  // @Action
  // public async FetchAll() {
  //   const { data } = await MusicApi.fetchSongs();
  //   return data;
  // }

  // @Action
  // public async FetchSongs(params: { rules: Rule[][], limit?: number, sortBy?: string }) {
  //   return await MusicApi.fetchSongs(params);
  // }

  @Action
  public async FetchPlaylists() {
    const { data } = await MusicApi.fetchPlaylists();
    this.SET_PLAYLISTS(data);
  }

  @Action
  public async ReloadSong(id: number) {
    let data = null;
    // if (this.playlistId) {
    //   const res = await MusicApi.fetchPlaylistSong(this.playlistId, id);
    //   data = res.data;
    // } else {
    //   const res = await MusicApi.fetchSong(id);
    //   data = res.data;
    // }
    const res = await MusicApi.fetchSong(id);
    data = res.data;
    // this.UPDATE_SONGS({ id, song: data });
    this.UPDATE_QUEUE_ITEM(data);
    if (this.currentSong && this.currentSong.id === id) {
      this.SET_CURRENT(data);
    }
    return data;
  }

  @Action
  public async ReloadSongs() {
    // if (this.artistId) {
    //   const { data } = await MusicApi.fetchArtistSongs(this.artistId);
    //   this.SET_SONGS(data);
    // } else if (this.playlistId) {
    //   const { data } = await MusicApi.fetchPlaylistSongs(this.playlistId);
    //   this.SET_SONGS(data);
    // } else if (this.smartlistId) {
    //   const { data } = await MusicApi.fetchSmartlistSongs(this.smartlistId);
    //   this.SET_SONGS(data);
    // } else { // all
    //   const { data } = await MusicApi.fetchSongs();
    //   this.SET_SONGS(data);
    // }
  }

  @Action
  public async FetchAudio(song: Song) {
    const results = await Promise.all([
      MusicApi.fetchAudio(song),
      MusicApi.fetchMetadata(song.id),
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
      if (this.currentSong) {
        this.setQueue(this.currentSong);
      }
    }
    if (repeat != null) {
      this.SET_REPEAT(repeat);
      if (this.currentSong) {
        this.setQueue(this.currentSong);
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
  public async PlayAndSet(data: { song?: Song, songs?: Song[] }) {
    const { song } = data;
    if (!song) return;
    let { songs } = data;
    if (!songs) songs = this.displayedSongs;
    this.Play(song);
    this.setQueue({ song, songs: this.songs });
  }

  @Action
  public PlaySongs(songs: Song[]) {
    const song = sample(songs);
    if (!song) return;
    this.Play(song);
    this.setQueue({ song, songs });
  }

  @Action
  public PlayFromQueue(i: number) {
    const song = this.queue[i];
    this.SET_CURRENT(song);
    this.FetchAudioForPlay(song).then(() => {
      this.SET_PLAYING(true);
    });
    this.SET_QUEUE(this.queue.slice(i + 1));
    this.updateQueue();
  }

  @Mutation
  public MOVE_TO_HEAD(i: number) {
    const song = this.queue[i];
    this.queue = concat(song, this.queue.slice(0, i), this.queue.slice(i + 1));
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
    // Array#reverse is destructive method!
    songs.reverse();
    songs.forEach((s) => {
      this.UNSHIFT_QUEUE(s);
    });
  }

  /* CRUD Operations */
  @Action
  public async UpdateSong(payload: { id: number, data: Partial<Song> }) {
    const { id, data } = payload;
    await MusicApi.updateSong(id, data);
  }

  @Action
  public async IncrementPlayedCount(id: number) {
    return await MusicApi.incrementPlayedCount(id);
  }

  @Action
  public async UpdateSongTag(payload: { id: number, data: Record<string, string | null> }) {
    const { id, data } = payload;
    return await MusicApi.updateSongTag(id, data);
  }

  @Action
  public DeleteSong(id: number) {
    MusicApi.deleteSong(id);
    this.UPDATE_SONGS({ id, song: null });
  }

  @Action
  public async CreatePlaylist(data: { name: string, songs: Song[]}) {
    const res = await MusicApi.createPlaylist(data.name);
    if (data.songs.length === 0) return res.data.id;
    await MusicApi.addSongToPlaylist(res.data.id, data.songs.map((s) => s.id));
    return res.data.id;
  }

  @Action
  public async AddPlaylistSong(data: { id: number, songs: Song[] }) {
    if (this.songs.length === 0) return;
    return await MusicApi.addSongToPlaylist(data.id, data.songs.map((s) => s.id));
  }

  @Action
  public async UpdatePlaylistSong(payload: { id: number, data: { weight: number } }) {
    const { id, data } = payload;
    if (this.playlistId) {
      await MusicApi.updatePlaylistSong(this.playlistId, id, data.weight);
    } else {
      // message.error('An error occurred');
    }
  }

  @Action
  public async RemovePlaylistSong(data: { songs: Song[] }) {
    if (this.songs.length === 0) return;
    if (!this.playlistId) return;
    const id = this.playlistId;
    const promises: Array<Promise<unknown>> = [];
    data.songs.forEach((song) => {
      const p = MusicApi.removePlaylistSong(id, song.id);
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

// 永続化するstate
const keys = [
  'currentSong',
  'queue',
  'queueSet',
  'history',
  'shuffle',
  'repeat',
  'mute',
  'volume',
  'notifySong',
];
export const paths = keys.map((k) => `music.${k}`);
