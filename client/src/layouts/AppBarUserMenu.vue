<template>
  <div v-if="!isAuthenticated">
    <v-btn v-if="$route.name !== 'signin'" text color="primary" to="/user/signin" class="font-weight-bold">
      ログイン
    </v-btn>
    <v-menu bottom offset-y :close-on-content-click="false">
      <template #activator="{ on, attrs }">
        <v-btn v-bind="attrs" small icon v-on="on">
          <v-icon>settings</v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <theme-toggler list-item/>
      </v-list>
    </v-menu>
  </div>
  <v-menu v-else-if="isAuthenticated" bottom offset-y :close-on-content-click="false">
    <template #activator="{ on, attrs }">
      <v-btn v-bind="attrs" small icon v-on="on">
        <v-icon>account_circle</v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item>
        <v-list-item-icon>
          <v-icon>person</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="text-h6 font-weight-bold">
            {{ user.name }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider class="my-2"/>
      <theme-toggler list-item/>
      <v-list-item link color="primary" class="min-h-0" @click="signOut">
        <v-list-item-icon>
          <v-icon>logout</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>ログアウト</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { User } from '@/api/user';
import { ThemeToggler } from '@/components';
import { authModule } from '@/store';

@Component({
  components: {
    ThemeToggler,
  },
})
export default class AppBarUserMenu extends Vue {
  get isAuthenticated() {
    return authModule.isAuthenticated;
  }

  get user(): User | null {
    return authModule.user;
  }

  private async signOut() {
    await authModule.SignOut();
    this.$router.push('/user/signin');
  }
}
</script>
