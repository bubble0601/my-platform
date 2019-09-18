import Vue from 'vue';
import Router, { RouteConfig } from 'vue-router';
import { authModule } from '@/store';
import Home from '@/pages/Home.vue';
import music from './music';

Vue.use(Router);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: 'Home', public: true },
  },
  ...music,
];

const inheritMeta = (route: RouteConfig) => {
  if (route.meta && route.children) {
    route.children.forEach((r) => {
      if (!r.meta) r.meta = route.meta;
      else r.meta = { ...route.meta, ...r.meta };
      inheritMeta(r);
    });
  }
};

routes.forEach(inheritMeta);

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
router.beforeEach((to, from, next) => {
  if (authModule.isInitialized) {
    if (to.meta.public || authModule.isAuthenticated) {
      next();
    } else {
      // next('/login?redirect=' + to.path);
      Vue.prototype.$message.error('Sign in required');
      next(false);
    }
  } else {
    if (to.meta.public) {
      next();
      authModule.Init();
    } else {
      authModule.Init().then(() => {
        if (authModule.isAuthenticated) {
          next();
        } else {
          Vue.prototype.$message.error('Sign in required');
          next('/');
        }
      });
    }
  }
});

router.afterEach((to) => {
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title} | iBubble`;
  } else {
    document.title = 'iBubble';
  }
});

export default router;
