<template>
  <b-navbar :type="theme" class="p-0" :class="{ mobile: $mobile }">
    <!-- pc -->
    <div v-if="$pc" class="container h-100">
      <b-navbar-brand to="/">
        <img class="brand" src="../assets/logo.png" alt="Logo">
      </b-navbar-brand>
      <b-navbar-nav>
        <b-nav-item to="/music" active-class="active">Music</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="h-100 ml-auto">
        <icon-button :icon="themeIcon" :variant="themeIcon === 'sun' ? 'secondary' : 'warning'" @click="toggleTheme"/>
        <!-- Not autheticated -->
        <div v-if="!isAuthenticated && $route.path !== '/user/signin'" class="py-1">
          <b-button variant="primary" size="sm" to="/user/signin">ログイン</b-button>
        </div>
        <!-- Authenticated -->
        <b-nav-item-dropdown v-else-if="isAuthenticated" right menu-class="shadow-sm" toggle-class="d-flex align-items-center h-100" class="h-100">
          <template #button-content>
            <b-icon icon="person-fill" size="1.5" :class="{ 'text-muted': !isAuthenticated }"/>
          </template>
          <b-dropdown-text class="d-flex flex-column">
            <div class="text-muted">Signed in as</div>
            <div class="font-weight-bolder">{{ user.name }}</div>
          </b-dropdown-text>
          <b-dropdown-divider/>
          <b-dropdown-item @click="signOut">
            Sign Out
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </div>
    <!-- mobile -->
    <template v-else>
      <icon-button type="square" icon="list" style="width: 3.5rem;" @click="sidebarVisible = true"/>
      <b-navbar-brand class="ml-2">
        <img class="brand" src="../assets/logo.png" alt="Logo">
      </b-navbar-brand>
      <b-navbar-nav class="h-100 ml-auto mr-2">
        <icon-button :icon="themeIcon" :variant="themeIcon === 'sun' ? 'secondary' : 'warning'" @click="toggleTheme"/>
        <!-- Not autheticated -->
        <div v-if="!isAuthenticated && $route.path !== '/user/signin'" class="align-self-center py-1">
          <b-button variant="primary" size="sm" to="/user/signin">ログイン</b-button>
        </div>
        <!-- Authenticated -->
        <b-nav-item-dropdown v-else-if="isAuthenticated" right menu-class="shadow-sm" toggle-class="d-flex align-items-center h-100" class="h-100">
          <template #button-content>
            <b-icon icon="person-fill" size="1.5" :class="{ 'text-muted': !isAuthenticated }"/>
          </template>
          <b-dropdown-text class="d-flex flex-column">
            <div class="text-muted">Signed in as</div>
            <div class="font-weight-bolder">{{ user.name }}</div>
          </b-dropdown-text>
          <b-dropdown-divider/>
          <b-dropdown-item @click="signOut">
            Sign Out
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
      <b-sidebar v-model="sidebarVisible" shadow backdrop width="15rem">
        <template #title="{ hide }">
          <b-navbar-brand to="/" @click="hide">
            <img class="brand" src="../assets/logo.png" alt="Logo">
          </b-navbar-brand>
        </template>
        <template #default="{ hide }">
          <b-nav vertical @click="hide">
            <b-nav-item to="/music" active-class="active">Music</b-nav-item>
          </b-nav>
        </template>
      </b-sidebar>
    </template>
  </b-navbar>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { authModule, settingModule } from '@/store';
import { User } from '@/api/user';
import { IconButton } from '@/components';

@Component({
  components: {
    IconButton,
  },
})
export default class Navbar extends Vue {
  private sidebarVisible = false;

  get isAuthenticated(): boolean {
    return authModule.isAuthenticated;
  }

  get user(): User | null {
    return authModule.user;
  }

  get theme() {
    return settingModule.theme;
  }

  get themeIcon() {
    return this.theme === 'light' ? 'sun' : 'moon';
  }

  private goToSignInPage() {
    this.$router.push('/user/signin', undefined, () => {
      // Abort if try to push the same route
      this.$router.go(0);
    });
  }

  private async signOut() {
    await authModule.SignOut();
    this.$router.push('/user/signin');
  }

  private toggleTheme() {
    if (settingModule.theme === 'light') {
      settingModule.SetTheme('dark');
    } else {
      settingModule.SetTheme('light');
    }
  }
}
</script>
<style lang="scss" scoped>
.navbar {
  box-shadow: 0 .125rem .25rem rgba(0, 0, 0, .075);
  position: relative;
  z-index:  120;
  &.mobile {
    height: 3.5rem;
  }

  @include theme('dark') {
    background-color: var(--dark);
  }
}
.brand {
  max-height: 1.75rem;
}
</style>
