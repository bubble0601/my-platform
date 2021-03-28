<template>
  <div class="d-flex pt-5">
    <b-card class="wrapper mx-auto" title="ログイン">
      <b-alert :show="signInFailed" variant="danger">{{ errorMessage }}</b-alert>
      <v-form class="mt-4">
        <v-field label="ユーザー名">
          <v-input v-model="username"/>
        </v-field>
        <v-field label="パスワード" class="mt-2">
          <v-input v-model="password" type="password"/>
        </v-field>
      </v-form>
      <div class="d-flex mt-2">
        <!-- <b-button variant="link" @click="$router.push('/user/register')">アカウント作成</b-button> -->
        <b-button variant="primary" class="ml-auto" @click="signIn">ログイン</b-button>
      </div>
    </b-card>
  </div>
</template>
<script lang="ts">
import { AxiosError } from 'axios';
import { isString } from 'lodash';
import { Vue, Component } from 'vue-property-decorator';
import { authModule } from '@/store';
import { VForm, VField, VInput } from '@/components';

@Component({
  components: {
    VForm,
    VField,
    VInput,
  },
})
export default class Register extends Vue {
  private signInFailed = false;
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
      this.signInFailed = true;
      this.errorMessage = err.response?.data.error_message;
    });
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  width: 80%;
  max-width: 40rem;
}
</style>
