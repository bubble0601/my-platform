<template>
    <b-navbar>
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
                <v-icon name="user" :class="{ 'text-muted': !isAuthenticated }"/>
              </template>
              <b-dropdown-form v-if="!isAuthenticated">
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
import Vue from 'vue';
import { AUTH_REQUEST, AUTH_SIGNOUT, User } from '../store/auth';

export default Vue.extend({
  data() {
    return {
      showUserInfo: false,
      username: '',
      password: '',
    };
  },
  computed: {
    isAuthenticated(): boolean {
      return this.$store.getters.isAuthenticated;
    },
    user(): User {
      return this.$store.getters.user;
    },
  },
  watch: {
    showUserInfo(newVal: boolean) {
      if (!this.isAuthenticated && newVal) (this.$refs.usernameInput as HTMLInputElement).focus();
    },
  },
  mounted() {
    document.addEventListener('click', this.hideUserInfo);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.hideUserInfo);
  },
  methods: {
    hideUserInfo() {
      this.showUserInfo = false;
    },
    signIn() {
      const data = {
        username: this.username,
        password: this.password,
      };
      this.$store.dispatch(AUTH_REQUEST, data).then(() => {
        this.hideUserInfo();
      });
    },
    signOut() {
      this.$store.dispatch(AUTH_SIGNOUT).then(() => {
        this.hideUserInfo();
      });
    },
  },
});
</script>
<style lang="scss" scoped>
.navbar {
  box-shadow: 0 .125rem .25rem rgba(0, 0, 0, .075);

  #navbar_signin-form {
    padding: 1rem;
    width: max-content;
  }
}
.brand {
  max-height: 1.75rem;
}
</style>
