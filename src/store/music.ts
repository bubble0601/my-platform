import { VuexModule, Module, Action, Mutation } from 'vuex-module-decorators';
import axios from 'axios';

export interface Song {
  title: string;
  artist: string;
  album: string;
  hash: string;
  filename: string;
  time: number;
  year: number;
}

const api = {
  fetchSongs: (tab: string) => axios.get<Song[]>(`/api/music/${tab}`),
};

@Module({ name: 'music' })
export default class Music extends VuexModule {
  public data: Song[] = [];
  public queue: Song[] = [];
  public current: Song | null = null;

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
  private SET_CURRENT(song: Song) {
    this.current = song;
  }

  @Mutation
  private SET_QUEUE(songs: Song[]) {
    this.queue = songs;
  }

  @Action
  public async FetchSongs(tab: string) {
    const { data } = await api.fetchSongs(tab);
    this.SET_DATA(data);
  }

  @Action
  public Play(data: { song: Song, songs: Song[] }) {
    this.SET_CURRENT(data.song);
    this.SET_QUEUE(data.songs);
  }
}
