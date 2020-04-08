<template>
  <b-navbar class="py-0">
    <div class="container">
      <b-navbar-brand to="/">
        <img class="brand" src="../assets/logo.png" alt="Logo">
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"/>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item to="/music">Music</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown right menu-class="shadow-sm" @toggle="showUserInfo = !showUserInfo">
            <template #button-content>
              <b-icon icon="person-fill" size="1.5" :class="{ 'text-muted': !isAuthenticated }"/>
            </template>
            <b-dropdown-form v-if="!isAuthenticated" class="px-2">
              <b-form-group>
                <v-input ref="usernameInput" v-model="username" size="sm" required placeholder="Username" @keydown.native.enter="$refs.passwordInput.focus()"/>
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
      </b-collapse>
    </div>
  </b-navbar>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Ref } from 'vue-property-decorator';
import { authModule } from '@/store';
import { User } from '@/store/auth';

@Component
export default class Navbar extends Vue {
  private showUserInfo = false;
  private username = '';
  private password = '';

  @Ref() private usernameInput!: HTMLInputElement;

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
  z-index:  10;
}
.brand {
  max-height: 1.75rem;
}
</style>
