import { Route } from 'vue-router';

export default [
  {
    path: '/music',
    component: () => import(/* webpackChunkName: "music" */ '../pages/music/Music.vue'),
    meta: { title: 'Music' },
    children: [
      {
        path: '',
        redirect: '/music/artist',
      },
      {
        path: 'all',
        component: () => import(/* webpackChunkName: "music" */ '../pages/music/SongList.vue'),
        props: { context: 'all' },
      },
      {
        path: 'song/new',
        component: () => import(/* webpackChunkName: "music" */ '../pages/music/NewSong.vue'),
      },
      {
        path: 'artist',
        component: () => import(/* webpackChunkName: "music" */ '../pages/music/Artists.vue'),
      },
      {
        path: 'artist/:id',
        component: () => import(/* webpackChunkName: "music" */ '../pages/music/Artists.vue'),
        props: (route: Route) => ({ id: Number(route.params.id) }),
      },
      {
        path: 'playlist',
        component: () => import(/* webpackChunkName: "music" */ '../pages/music/Playlists.vue'),
      },
      {
        path: 'playlist/:id',
        component: () => import(/* webpackChunkName: "music" */ '../pages/music/Playlists.vue'),
        props: (route: Route) => ({ id: Number(route.params.id) }),
      },
      {
        path: 'smartlist',
        redirect: 'playlist',
      },
      {
        path: 'smartlist/:id',
        component: () => import(/* webpackChunkName: "music" */ '../pages/music/Smartlist.vue'),
        props: (route: Route) => ({ id: Number(route.params.id) }),
      },
      {
        path: 'settings',
        component: () => import(/* webpackChunkName: "music" */ '../pages/music/Settings.vue'),
      },
    ],
  },
];
