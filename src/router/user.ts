export default [
  {
    path: '/user/signin',
    component: () => import(/* webpackChunkName: "user" */ '../pages/user/SignIn.vue'),
    meta: {
      title: 'ログイン',
      public: true,
    },
  },
  {
    path: '/user/register',
    component: () => import(/* webpackChunkName: "user" */ '../pages/user/Register.vue'),
    meta: {
      title: 'アカウント作成',
      public: true,
    },
  },
];
