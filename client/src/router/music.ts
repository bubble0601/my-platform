import { Route, RouteConfig } from 'vue-router';

const routes: Array<RouteConfig> = [
  {
    path: '',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/Home.vue'),
    meta: {
      appbarTitle: 'ホーム',
    },
  },
  {
    name: 'music-queue',
    path: 'queue',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/QueueView.vue'),
    meta: {
      appbarTitle: 'キュー',
    },
  },
  {
    name: 'music-info',
    path: 'current',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/CurrentSongView.vue'),
    meta: {
      appbarTitle: '♪ 現在の曲',
    },
  },
  {
    name: 'music-lyrics',
    path: 'lyrics',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/LyricsView.vue'),
    meta: {
      appbarTitle: '歌詞',
    },
  },
  {
    name: 'music-search-result',
    path: 'search',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/SearchResultView.vue'),
    meta: {
      appbarTitle: '検索結果',
    },
  },
  {
    path: 'advanced_search',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/AdvancedSearchView.vue'),
    meta: {
      appbarTitle: '高度な検索',
    },
  },
  {
    path: 'songs',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/SongView.vue'),
    meta: {
      appbarTitle: '曲',
    },
  },
  {
    path: 'songs/new',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/NewSong.vue'),
    meta: {
      appbarTitle: '曲を追加',
    },
  },
  {
    path: 'artists',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/ArtistListView.vue'),
    meta: {
      appbarTitle: 'アーティスト',
    },
  },
  {
    path: 'artist/:id',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/ArtistView.vue'),
    props: (route: Route) => ({ artistId: Number(route.params.id) }),
  },
  {
    path: 'playlists',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/PlaylistView.vue'),
    meta: {
      appbarTitle: 'プレイリスト',
    },
  },
  {
    path: 'playlist/:id',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/PlaylistView.vue'),
    props: (route: Route) => ({ playlistId: Number(route.params.id) }),
  },
  {
    path: 'smartlists',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/SmartlistView.vue'),
    meta: {
      appbarTitle: 'スマートリスト',
    },
  },
  {
    path: 'smartlist/:id',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/SmartlistView.vue'),
    props: (route: Route) => ({ smartlistId: Number(route.params.id) }),
  },
  {
    path: 'settings',
    component: () => import(/* webpackChunkName: "music" */ '@/views/music/Settings.vue'),
    meta: {
      appbarTitle: '設定(Music)',
    },
  },
];

const musicRoutes: Array<RouteConfig> = [
  {
    path: '',
    component: () => import(/* webpackChunkName: "fill-height-layout" */'@/layouts/FillHeightLayout.vue'),
    children: [
      {
        path: '/music',
        component: () => import(/* webpackChunkName: "music" */ '@/views/music/Music.vue'),
        children: routes,
      },
    ],
  },
];

export default musicRoutes;
