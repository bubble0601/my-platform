export default [
  {
    path: '/music',
    component: () => import(/* webpackChunkName: "music" */ '../pages/Music.vue'),
    meta: { title: 'Music' },
    props: { tab: 'all' },
    children: [
      {
        path: '',
        redirect: '/music/all',
      },
      {
        path: 'artist',
        component: () => import(/* webpackChunkName: "music" */ '../containers/ArtistList.vue'),
      },
      {
        path: 'artist/:id',
        component: () => import(/* webpackChunkName: "music" */ '../containers/ArtistList.vue'),
        props: true,
      },
      {
        path: 'playlist',
        component: () => import(/* webpackChunkName: "music" */ '../containers/Playlists.vue'),
      },
      {
        path: 'playlist/:id',
        component: () => import(/* webpackChunkName: "music" */ '../containers/Playlists.vue'),
        props: true,
      },
      {
        path: ':tab',
        component: () => import(/* webpackChunkName: "music" */ '../containers/SongList.vue'),
        props: true,
      },
    ],
  },
];
