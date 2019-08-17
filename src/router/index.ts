import Vue from 'vue';
import Router from 'vue-router';
import AuthModule from '@/store/auth';
import Home from '@/pages/Home.vue';
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
  if (AuthModule.isInitialized) {
    if (to.meta.public || AuthModule.isAuthenticated) {
      next();
    } else {
      // next('/login?redirect=' + to.path);
      Vue.prototype.$message.error('Sign in required');
      next(false);
    }
  } else {
    if (to.meta.public) {
      next();
      AuthModule.Init();
    } else {
      AuthModule.Init().then(() => {
        if (AuthModule.isAuthenticated) {
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
  }
});

export default router;
