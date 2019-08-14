import Vue from 'vue';
import Router from 'vue-router';
import { VueOptions } from '../types';
import store from '../store';
import { AUTH_INIT } from '../store/auth';
import Home from '../pages/Home.vue';
import music from './music';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: 'Home', public: true },
    },
    ...music,
  ],
});

// Authentication check
router.beforeEach((to, from, next) => {
  if (store.getters.isInitialized) {
    if (to.meta.public || store.getters.isAuthenticated) {
      next();
    } else {
      // next('/login?redirect=' + to.path);
      Vue.prototype.$message.error('Sign in required');
      next(false);
    }
  } else {
    if (to.meta.public) {
      next();
      store.dispatch(AUTH_INIT);
    } else {
      store.dispatch(AUTH_INIT).then(() => {
        if (store.getters.isAuthenticated) {
          next();
        } else {
          Vue.prototype.$message.error('Sign in required');
          next('/');
        }
      });
    }
  }
});

// Title can be set by both route meta field and component option
router.afterEach((to) => {
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title} | iBubble`;
  }
});

Vue.mixin({
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      const { title } = vm.$options as VueOptions;
      if (title) {
        document.title = `${title} · ${document.title}`;
      }
    });
  },
});

export default router;
