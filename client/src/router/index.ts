import Vue from 'vue';
import Router from 'vue-router';
import { authModule } from '@/store';
import Home from '@/pages/Home.vue';
import music from './music';
import user from './user';

Vue.use(Router);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: 'Home', public: true },
  },
  ...user,
  ...music,
];

const router = new Router({
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

router.afterEach((to) => {
  let title: string | null = null;
  to.matched.forEach((record) => {
    if (record.meta.title) title = record.meta.title;
  });
  if (title) {
    document.title = `${title} | iBubble`;
  } else {
    document.title = 'iBubble';
  }
});

export default router;
