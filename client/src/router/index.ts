import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import { authModule } from '@/store';
import music from './music';
import user from './user';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
    meta: {
      public: true,
      appbarTitle: 'ホーム',
    },
  },
  ...user,
  ...music,
  {
    path: '/note',
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
    meta: {
      appbarTitle: 'Note',
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
  routes,
});

// Authentication check
router.beforeEach(async(to, from, next) => {
  if (!authModule.isInitialized) await authModule.Init();
  if (to.matched.some((record) => record.meta.public) || authModule.isAuthenticated) {
    next();
  } else {
    next({
      path: '/user/signin',
      query: {
        redirect: to.path,
      },
    });
  }
});

export default router;
