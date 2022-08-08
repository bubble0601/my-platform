import Vue from "vue";
import axios, { AxiosError } from "axios";
import { MusicApi } from "@/api";
import { Song } from "@/api/music";
import { reactive, ref } from "@vue/composition-api";

// export default class MusicService {
//   private instance: Vue;

//   constructor(instance: Vue) {
//     this.instance = instance;
//   }

//   private handleError(err: Error | AxiosError) {
//     console.error(err);
//     if (axios.isAxiosError(err) && err.response) {
//       this.instance.$snackbar.error(err.response.data);
//     } else {
//       this.instance.$snackbar.error(err.message);
//     }
//   }

//   public async addSongToPlaylist(id: number, songs: Song[]) {
//     await MusicApi.addSongToPlaylist(id, songs.map(song => song.id)).catch(this.handleError);
//   }
// }

function handleError(err: Error | AxiosError) {
  console.error(err);
  if (axios.isAxiosError(err) && err.response) {
    return err.response.data;
  } else {
    return err.message;
  }
}

export const usePlaylist = () => {
  const playlists = reactive([]);

  const addSongToPlaylist = async(id: number, songs: Song[]) => {
    let result: any, error: any;
    try {
      result = await MusicApi.addSongToPlaylist(id, songs.map(song => song.id));
    } catch(e) {
      if (e instanceof Error) error = handleError(e);
    }
    return {
      result,
      error,
    };
  };

  return {
    playlists,
    addSongToPlaylist,
  };
};
