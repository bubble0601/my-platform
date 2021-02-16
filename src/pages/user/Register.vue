<template>
  <div class="d-flex pt-5">
    <b-card class="wrapper mx-auto" title="アカウントの作成">
      <v-form class="mt-5">
        <v-field label="ユーザー名" class="field">
          <v-input v-model="$v.username.$model" :state="$v.username.$dirty ? !$v.username.$invalid : null" @input="delayValidate($v.username)"/>
          <template v-if="$v.username.$dirty && !$v.username.$pending">
            <b-form-invalid-feedback v-if="!$v.username.required">ユーザー名を入力してください</b-form-invalid-feedback>
            <b-form-invalid-feedback v-if="!$v.username.isUnique">ユーザー名は既に使われています</b-form-invalid-feedback>
          </template>
        </v-field>
        <v-field label="パスワード" class="field">
          <v-input v-model="$v.password.$model" type="password" :state="$v.password.$dirty ? !$v.password.$invalid : null"/>
          <b-form-invalid-feedback v-if="!$v.password.required">パスワードを入力してください</b-form-invalid-feedback>
          <b-form-invalid-feedback v-if="!$v.password.minLength">パスワードは8文字以上で入力してください</b-form-invalid-feedback>
          <b-form-invalid-feedback v-if="!$v.password.maxLength">パスワードは72文字以内で入力してください</b-form-invalid-feedback>
        </v-field>
      </v-form>
      <div class="d-flex mt-4">
        <b-button variant="primary" class="ml-auto" @click="register">作成</b-button>
      </div>
    </b-card>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { required, minLength, maxLength } from 'vuelidate/lib/validators';
import { AxiosError } from 'axios';
import { map } from 'lodash';
import api from '@/api/user';
import { authModule } from '@/store';
import { VForm, VField, VInput } from '@/components';
import { Validation } from 'vuelidate';

@Component({
  components: {
    VForm,
    VField,
    VInput,
  },
  beforeRouteEnter(to, from, next) {
    if (authModule.isAuthenticated) next('/');
    else next();
  },
  validations: {
    username: {
      required,
      isUnique(username) {
        if (username === '') return true;
        return new Promise((resolve, _) => {
          api.checkExistence(username).then(() => resolve(false)).catch(() => resolve(true));
        });
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
  private touchMap = new WeakMap<Validation, NodeJS.Timeout>();
  private username = '';
  private password = '';
  private v = '';

  private delayValidate($v: Validation) {
    $v.$reset();
    if (this.touchMap.has($v)) {
      clearTimeout(this.touchMap.get($v)!);
    }
    this.touchMap.set($v, setTimeout($v.$touch, 1000));
  }

  private register() {
    api.register({
      username: this.username,
      password: this.password,
    }).then(() => {
      this.$router.push('/user/signin');
    }).catch((err: AxiosError) => {
      if (err.response && err.response.data.errors) {
        const errors = err.response.data.errors;
        const message = map(errors, (messages, key) => messages.map((msg: string) => `${key} ${msg}`).join('\n')).join('\n');
        this.$message.error(`Failed to register:\n${message}`);
      } else {
        this.$message.error('Failed to register');
      }
    });
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  width: 80%;
  max-width: 40rem;
}
.field {
  min-height: 6rem;
  margin-bottom: 0.5rem;
}
</style>
