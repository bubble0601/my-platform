import Vue from 'vue';
import Router from 'vue-router';
// @ts-ignore
import { Toast } from 'buefy/dist/components/toast';
import { VueOptions } from '../types';
import store from '../store';
import { AUTH_INIT } from '../store/auth';
import Home from '../pages/Home.vue';

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
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    // },
  ],
});

// Authentication check
router.beforeEach((to, from, next) => {
  if (store.getters.isInitialized) {
    if (to.meta.public || store.getters.isAuthenticated) {
      next();
    } else {
      // next('/login?redirect=' + to.path);
      Toast.open({
        type: 'is-danger',
        position: 'is-bottom',
        message: 'Sign in required',
      });
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
          Toast.open({
            type: 'is-danger',
            position: 'is-bottom',
            message: 'Sign in required',
          });
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
