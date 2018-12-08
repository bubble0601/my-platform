<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-item">
          <img src="../assets/logo.png" alt="Logo">
        </router-link>
        <a class="navbar-burger burger" :class="{ 'is-active': showMenu }" @click="showMenu = !showMenu">
          <span/>
          <span/>
          <span/>
        </a>
      </div>
      <div class="navbar-menu" :class="{ 'is-active': showMenu }">
        <div class="navbar-start">
          <router-link v-if="isAuthenticated" to="/music" class="navbar-item is-tab" active-class="is-active">
            Music
          </router-link>
        </div>
        <div class="navbar-end">
          <div class="navbar-item is-flex has-dropdown" :class="{ 'is-active': showUserInfo }">
            <a class="navbar-link" @click.stop="showUserInfo = !showUserInfo">
              <b-icon icon="user" :class="{ 'has-text-grey-light': !isAuthenticated }"/>
            </a>
            <div v-if="!isAuthenticated" id="navbar_signin-form" class="navbar-dropdown is-right" @click.stop>
              <b-field>
                <b-input ref="usernameInput" v-model="username" size="is-small" placeholder="Username" @keydown.native.enter="$refs.passwordInput.focus()"/>
              </b-field>
              <b-field>
                <!-- b-inputだとなぜかパスワードの自動入力が効かない -->
                <div class="control">
                  <input ref="passwordInput" v-model="password" type="password" class="input is-small" placeholder="Password" @keydown.enter="signIn">
                </div>
              </b-field>
              <button type="submit" class="button is-primary" @click="signIn">Sign in</button>
            </div>
            <div v-else class="navbar-dropdown is-right" @click.stop>
              <div class="navbar-item flex-column align-items-start">
                <div class="has-text-grey-light">Signed in as</div>
                <div class="has-text-weight-semibold">{{ user.name }}</div>
              </div>
              <hr class="navbar-divider">
              <a class="navbar-item" @click="signOut">
                Sign out
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
<script lang="ts">
import Vue from 'vue';
import { Input } from '../types';
import { Button } from '../basics';
import { AUTH_REQUEST, AUTH_SIGNOUT, User } from '../store/auth';

export default Vue.extend({
  data() {
    return {
      showMenu: false,
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
      if (!this.isAuthenticated && newVal) (this.$refs.usernameInput as Input).focus();
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
nav.navbar {
  box-shadow: 0 .125rem .25rem rgba(0,0,0,.075);

  #navbar_signin-form {
    padding: 1rem;
    width: max-content;
  }
}
</style>
