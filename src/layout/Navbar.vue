<template>
  <b-navbar class="p-0" :class="{ mobile: $mobile }">
    <div v-if="$pc" class="container h-100">
      <b-navbar-brand to="/">
        <img class="brand" src="../assets/logo.png" alt="Logo">
      </b-navbar-brand>
      <b-navbar-nav>
        <b-nav-item to="/music" active-class="active">Music</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="h-100 ml-auto">
        <b-nav-item-dropdown right menu-class="shadow-sm" toggle-class="d-flex align-items-center h-100" class="h-100" @toggle="showUserInfo = !showUserInfo">
          <template #button-content>
            <b-icon icon="person-fill" size="1.5" :class="{ 'text-muted': !isAuthenticated }"/>
          </template>
          <b-dropdown-form v-if="!isAuthenticated" form-class="px-2">
            <b-form-group>
              <v-input ref="usernameInput" v-model="username" size="sm" required placeholder="Username" @keydown.native.enter="passwordInput.focus()"/>
            </b-form-group>
            <b-form-group>
              <v-input ref="passwordInput" v-model="password" type="password" size="sm" required placeholder="Password" @keydown.enter="signIn"/>
            </b-form-group>
            <b-button variant="primary" size="sm" @click="signIn">Sign In</b-button>
          </b-dropdown-form>
          <template v-else>
            <b-dropdown-text class="d-flex flex-column">
              <div class="text-muted">Signed in as</div>
              <div class="font-weight-bolder">{{ user.name }}</div>
            </b-dropdown-text>
            <b-dropdown-divider/>
            <b-dropdown-item @click="signOut">
              Sign Out
            </b-dropdown-item>
          </template>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </div>
    <template v-else>
      <icon-button type="square" icon="list" style="width: 3.5rem;" @click="sidebarVisible = true"/>
      <b-navbar-brand class="ml-2">
        <img class="brand" src="../assets/logo.png" alt="Logo">
      </b-navbar-brand>
      <b-navbar-nav class="h-100 ml-auto mr-2">
        <b-nav-item-dropdown right menu-class="shadow-sm" toggle-class="d-flex align-items-center h-100" class="h-100" @toggle="showUserInfo = !showUserInfo">
          <template #button-content>
            <b-icon icon="person-fill" size="1.5" :class="{ 'text-muted': !isAuthenticated }"/>
          </template>
          <b-dropdown-form v-if="!isAuthenticated" form-class="px-2">
            <b-form-group>
              <v-input ref="usernameInput" v-model="username" size="sm" required placeholder="Username" @keydown.native.enter="passwordInput.focus()"/>
            </b-form-group>
            <b-form-group>
              <v-input ref="passwordInput" v-model="password" type="password" size="sm" required placeholder="Password" @keydown.enter="signIn"/>
            </b-form-group>
            <b-button variant="primary" size="sm" @click="signIn">Sign In</b-button>
          </b-dropdown-form>
          <template v-else>
            <b-dropdown-text class="d-flex flex-column">
              <div class="text-muted">Signed in as</div>
              <div class="font-weight-bolder">{{ user.name }}</div>
            </b-dropdown-text>
            <b-dropdown-divider/>
            <b-dropdown-item @click="signOut">
              Sign Out
            </b-dropdown-item>
          </template>
        </b-nav-item-dropdown>
      </b-navbar-nav>
      <b-sidebar v-model="sidebarVisible" shadow backdrop width="15rem">
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
import { Vue, Component, Prop, Watch, Ref } from 'vue-property-decorator';
import { authModule } from '@/store';
import { User } from '@/store/auth';
import { IconButton } from '@/components';

@Component({
  components: {
    IconButton,
  },
})
export default class Navbar extends Vue {
  private sidebarVisible = false;
  private showUserInfo = false;
  private username = '';
  private password = '';

  @Ref() private usernameInput!: HTMLInputElement;
  @Ref() private passwordInput!: HTMLInputElement;

  get isAuthenticated(): boolean {
    return authModule.isAuthenticated;
  }

  get user(): User | null {
    return authModule.user;
  }

  @Watch('showUserInfo')
  private onUserInfoToggled(val: boolean) {
    if (!this.isAuthenticated && val) this.usernameInput.focus();
  }

  private mounted() {
    document.addEventListener('click', this.hideUserInfo);
  }

  private beforeDestroy() {
    document.removeEventListener('click', this.hideUserInfo);
  }

  private hideUserInfo() {
    this.showUserInfo = false;
  }

  private async signIn() {
    const data = {
      username: this.username,
      password: this.password,
    };
    await authModule.SignIn(data);
    this.hideUserInfo();
  }
  private async signOut() {
    await authModule.SignOut();
    this.hideUserInfo();
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
}
.brand {
  max-height: 1.75rem;
}
</style>
