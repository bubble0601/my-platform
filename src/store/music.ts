import { VuexModule, Module, Action, Mutation } from 'vuex-module-decorators';
import axios from 'axios';
import { concat, findIndex, last, shuffle as sh } from 'lodash';

export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  hash: string;
  filename: string;
  time: number;
  year: number;
  rate: number;
}

export enum REPEAT {
  NONE,
  ALL,
  ONE,
}
const api = {
  fetchSongs: (tab: string) => axios.get<Song[]>(`/api/music/${tab}`),
  fetchSong: (id: number) => axios.get<Song>(`/api/music/getsong?id=${id}`),
  updateRate: (id: number, val: number) => axios.post('/api/music/updaterate', { id, val }),
};

@Module({ name: 'music' })
export default class Music extends VuexModule {
  public data: Song[] = [];
  public displayedSongs: Song[] = [];
  public current: Song | null = null;
  public queue: Song[] = [];
  public history: Song[] = [];

  public playing = false;
  public shuffle = false;
  public repeat: REPEAT = REPEAT.NONE;
  public mute = false;
  public volume = 100;

  get filename() {
    const s = this.current;
    if (s != null) {
      return `/static/music/${s.hash}/${s.title}.mp3`;
    }
    return null;
  }

  @Mutation
  private SET_DATA(data: Song[]) {
    this.data = data;
  }

  @Mutation
  private UPDATE_DATA(id: number, song: Song) {
    const i = findIndex(this.data, { id });
    if (i >= 0) {
      this.data[i] = song;
    } else {
      this.data.push(song);
    }
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
  private SET_QUEUE(songs: Song[]) {
    this.queue = songs;
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

  @Action
  public async FetchSongs(tab: string) {
    const { data } = await api.fetchSongs(tab);
    this.SET_DATA(data);
  }

  @Action
  private async updateSong(id: number) {
    const { data } = await api.fetchSong(id);
    this.UPDATE_DATA(id, data);
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

  @Action
  public Play(song: Song) {
    this.SET_CURRENT(song);
    this.SET_PLAYING(true);
    this.setQueue(song);
  }

  @Action
  public PlayNext() {
    this.OP_HISTORY('push');
    const next = this.queue[0];
    if (next) {
      this.SET_CURRENT(next);
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
      this.OP_HISTORY('pop');
    }
  }

  @Action
  public async UpdateRate(data: { id: number, val: number }) {
    const { id, val } = data;
    await api.updateRate(id, val);
    this.updateSong(id);
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
