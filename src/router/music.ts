export default [
  {
    path: '/music',
    name: 'music',
    component: () => import(/* webpackChunkName: "music" */ '../pages/Music.vue'),
    meta: { title: 'Music' },
  },
];
