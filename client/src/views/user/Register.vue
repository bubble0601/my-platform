<template>
  <div class="d-flex pt-12">
    <v-card class="wrapper mx-auto">
      <v-card-title>アカウントの作成</v-card-title>
      <v-card-text>
        <v-alert :value="!!errorMessage" type="error" dense>
          {{ errorMessage }}
        </v-alert>
        <v-form>
          <v-text-field v-model="$v.username.$model" label="ユーザー名" :error-messages="usernameErrors" @input="delayValidate($v.username)"/>
          <v-text-field v-model="password" type="password" label="パスワード" :error-messages="passwordErrors" @blur="$v.password.$touch"/>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" class="ml-auto" :disabled="!$v.$pending && $v.$invalid" @click="register">作成</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Validation } from 'vuelidate';
import { required, minLength, maxLength } from 'vuelidate/lib/validators';
import { AxiosError } from 'axios';
import { map } from 'lodash';
import api from '@/api/user';
import { authModule } from '@/store';

@Component({
  metaInfo: {
    title: 'アカウント作成',
  },
  beforeRouteEnter(to, from, next) {
    if (authModule.isAuthenticated) next('/');
    else next();
  },
  validations: {
    username: {
      required,
      async isUnique(username: string) {
        if (username === '') return true;
        try {
          await api.checkExistence(username);
          return false;
        } catch(e) {
          return true;
        }
      },
    },
    password: {
      required,
      minLength: minLength(8),
      maxLength: maxLength(72),
    },
  },
})
export default class Register extends Vue {
  private touchMap = new WeakMap<Validation, number>();
  private username = '';
  private password = '';
  private errorMessage = '';

  get usernameErrors() {
    const v = this.$v.username;
    if (!v.$dirty || v.$pending) return [];
    const errors: string[] = [];
    !v.required && errors.push('ユーザー名を入力してください');
    !v.isUnique && errors.push('ユーザー名は既に使われています');
    return errors;
  }

  get passwordErrors() {
    const v = this.$v.password;
    if (!v.$dirty) return [];
    const errors: string[] = [];
    !v.required && errors.push('パスワードを入力してください');
    !v.minLength && errors.push('パスワードは8文字以上で入力してください');
    !v.maxLength && errors.push('パスワードは72文字以内で入力してください');
    return errors;
  }

  private delayValidate($v: Validation) {
    $v.$reset();
    if (this.touchMap.has($v)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clearTimeout(this.touchMap.get($v)!);
    }
    this.touchMap.set($v, window.setTimeout($v.$touch, 1000));
  }

  private register() {
    api.register({
      username: this.username,
      password: this.password,
    }).then(() => {
      this.$router.push('/user/signin');
    }).catch((err: AxiosError) => {
      console.log(err.response);
      if (err.response && err.response.data.errors) {
        const errors = err.response.data.errors;
        const message = map(errors, (messages, key) => messages.map((msg: string) => `${key} ${msg}`).join('\n')).join('\n');
        this.errorMessage = (`Failed to register:\n${message}`);
      } else {
        this.errorMessage = ('Failed to register');
      }
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
