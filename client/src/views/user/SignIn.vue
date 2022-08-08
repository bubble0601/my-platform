<template>
  <default-layout v-if="false" title="ログイン">
    <div class="d-flex pt-12">
      <v-card class="wrapper mx-auto">
        <v-card-title>ログイン</v-card-title>
        <v-card-text>
          <v-alert :value="!!errorMessage" type="error" dense>
            {{ errorMessage }}
          </v-alert>
          <v-form class="mt-2">
            <v-text-field v-model="username" label="ユーザー名"/>
            <v-text-field v-model="password" type="password" label="パスワード"  @keydown.enter="signIn"/>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <!-- <v-btn color="blue accent-4" plain to="/user/register">アカウント作成</v-btn> -->
          <v-btn color="primary" small class="ml-auto" @click="signIn">ログイン</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </default-layout>
  <div v-else>
    <div class="d-flex pt-12">
      <v-card class="wrapper mx-auto">
        <v-card-title>ログイン</v-card-title>
        <v-card-text>
          <v-alert :value="!!errorMessage" type="error" dense>
            {{ errorMessage }}
          </v-alert>
          <v-form class="mt-2">
            <v-text-field v-model="username" label="ユーザー名"/>
            <v-text-field v-model="password" type="password" label="パスワード"  @keydown.enter="signIn"/>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <!-- <v-btn color="blue accent-4" plain to="/user/register">アカウント作成</v-btn> -->
          <v-btn color="primary" small class="ml-auto" @click="signIn">ログイン</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>
<script lang="ts">
import { AxiosError } from 'axios';
import { isString } from 'lodash';
import { Vue, Component } from 'vue-property-decorator';
import { authModule } from '@/store';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

@Component({
  metaInfo: {
    title: 'ログイン',
  },
  components: {
    DefaultLayout,
  },
})
export default class SignIn extends Vue {
  private errorMessage = '';
  private username = '';
  private password = '';

  private signIn() {
    authModule.SignIn({
      username: this.username,
      password: this.password,
    }).then(() => {
      let redirectPath = '/';
      if (isString(this.$route.query.redirect)) {
        redirectPath = this.$route.query.redirect;
      }
      this.$router.push(redirectPath);
    }).catch((err: AxiosError) => {
      this.errorMessage = err.response?.data.error_message || 'Sign in failed';
    });
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  width: 80%;
  max-width: 560px;
}
</style>
