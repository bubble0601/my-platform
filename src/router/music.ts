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
        path: ':tab',
        component: () => import(/* webpackChunkName: "music" */ '../containers/MusicList.vue'),
        props: true,
      },
    ],
  },
];
