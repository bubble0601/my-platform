import { RouteConfig } from 'vue-router';

const routes: Array<RouteConfig> = [
  {
    name: 'signin',
    path: '/user/signin',
    component: () => import(/* webpackChunkName: "user" */ '@/views/user/SignIn.vue'),
    meta: {
      public: true,
      appbarTitle: 'ログイン',
    },
  },
  {
    name: 'register',
    path: '/user/register',
    component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register.vue'),
    meta: {
      public: true,
      appbarTitle: '登録',
    },
  },
];

const userRoutes: Array<RouteConfig> = [
  {
    path: '/user',
    component: () => import(/* webpackChunkName: "fill-height-layout" */'@/layouts/FillHeightLayout.vue'),
    children: routes,
  },
];

export default userRoutes;
