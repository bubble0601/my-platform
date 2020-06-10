<template>
  <div v-if="list.length">
    <div class="d-flex my-2 px-2">
      <b-button v-t="'reset'" variant="outline-danger" size="sm" class="ml-auto" @click="reset"/>
      <b-button v-t="'save'" variant="success" size="sm" class="ml-2"/>
    </div>
    <song-list context='instant'/>
  </div>
  <div v-else class="p-3">
    <h4 class="mb-1">
      <span>インスタントプレイリストを作成</span>
      <v-help class="text-muted ml-2">このプレイリストはページを更新すると消去されます</v-help>
    </h4>
    <b-card header="ルール" no-body class="mt-3">
      <b-list-group flush>
        <b-list-group-item v-for="ruleGroup in ruleGroups" :key="ruleGroup.key" class="d-sm-flex px-2 px-md-3">
          <div>
            <b-form v-for="rule in ruleGroup" :key="rule.key" inline class="mb-1">
              <b-form-select v-model="rule.field" :options="options" class="mr-sm-1" @input="setDefault(rule)"/>
              <template v-if="fields[rule.field].type === 'string'">
                <b-input v-model="rule.value" class="mr-sm-1"/>
                <b-form-select v-model="rule.operator">
                  <b-form-select-option value="include">を含む</b-form-select-option>
                  <b-form-select-option value="prefix">で始まる</b-form-select-option>
                  <b-form-select-option value="postfix">で終わる</b-form-select-option>
                  <b-form-select-option value="match">である</b-form-select-option>
                </b-form-select>
              </template>
              <template v-else-if="fields[rule.field].type === 'number'">
                <b-input type="number" v-model.number="rule.value" class="mr-sm-1"/>
                <b-form-select v-model="rule.operator">
                  <b-form-select-option value="=">である</b-form-select-option>
                  <b-form-select-option value=">=">以上</b-form-select-option>
                  <b-form-select-option value="<=">以下</b-form-select-option>
                </b-form-select>
              </template>
              <template v-else-if="fields[rule.field].type === 'date'">
                <b-input type="number" v-model="rule.value" class="mr-sm-1"/>
                <b-form-select v-model="rule.operator">
                  <b-form-select-option value="in">日以内</b-form-select-option>
                </b-form-select>
              </template>
              <template v-else-if="fields[rule.field].type === 'rate'">
                <rate v-model="rule.value" class="mr-sm-1"/>
                <b-form-select v-model="rule.operator">
                  <b-form-select-option value="=">である</b-form-select-option>
                  <b-form-select-option value=">=">以上</b-form-select-option>
                  <b-form-select-option value="<=">以下</b-form-select-option>
                </b-form-select>
              </template>
            </b-form>
          </div>
          <div class="text-right mt-auto ml-auto">
            <b-button variant="info" size="sm" @click="removeRule(ruleGroup)">-</b-button>
            <b-button variant="info" size="sm" class="ml-2" @click="addRule(ruleGroup)">+</b-button>
          </div>
        </b-list-group-item>
      </b-list-group>
      <div class="p-2">
        <b-button variant="info" @click="addRule()">+</b-button>
      </div>
      <template #footer>
        <div class="d-flex">
          <b-button v-t="'reset'" variant="outline-danger" class="ml-auto" @click="reset"/>
          <b-button v-t="'create'" variant="success" class="ml-2" @click="create"/>
        </div>
      </template>
    </b-card>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Rate } from '@/components';
import { musicModule } from '@/store';
import { Song, Rule } from '@/store/music';
import SongList from './SongList.vue';

@Component({
  components: {
    Rate,
    SongList,
  },
})
export default class InstantPlaylist extends Vue {
  private readonly fields = {
    title: { type: 'string', default_op: 'include', default_val: '' },
    artist: { type: 'string', default_op: 'include', default_val: '' },
    album: { type: 'string', default_op: 'include', default_val: '' },
    album_artist: { type: 'string', default_op: 'include', default_val: '' },
    rate: { type: 'rate', default_op: '>=', default_val: 5 },
    created_at: { type: 'date', default_op: 'in', default_val: '30' },
  };
  private ruleGroups: Rule[][] = [];
  private ruleCount = 0;

  get options() {
    return ['title', 'artist', 'album', 'rate', 'created_at'].map((k) => ({
      text: this.$t(`music.fields.${k}`),
      value: k,
    }));
  }

  get list() {
    return musicModule.instantPlaylist;
  }

  set list(songs: Song[]) {
    musicModule.SET_INSTANT_PLAYLIST(songs);
  }

  protected created() {
    this.addRule();
  }

  private addRule(ruleGroup?: Rule[]) {
    const defaultField = 'title';
    if (ruleGroup) {
      ruleGroup.push({
        key: `rule${this.ruleCount++}`,
        field: defaultField,
        value: this.fields[defaultField].default_val,
        operator: this.fields[defaultField].default_op,
      });
    } else {
      this.ruleGroups.push([{
        key: `rule${this.ruleCount++}`,
        field: defaultField,
        value: this.fields[defaultField].default_val,
        operator: this.fields[defaultField].default_op,
      }]);
    }
  }

  private removeRule(ruleGroup: Rule[]) {
    ruleGroup.pop();
    if (ruleGroup.length === 0) {
      this.ruleGroups = this.ruleGroups.filter((g) => g.length > 0);
    }
  }

  private setDefault(rule: Rule) {
    rule.operator = this.fields[rule.field].default_op;
    rule.value = this.fields[rule.field].default_val;
  }

  private reset() {
    this.list = [];
    this.ruleGroups = [];
    this.ruleCount = 0;
  }

  private async create() {
    const { data } = await musicModule.FetchSongs({ rules: this.ruleGroups });
    this.list = data;
  }
}
</script>
