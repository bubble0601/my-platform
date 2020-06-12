<template>
  <div v-if="list">
    <div class="d-flex my-2 px-2">
      <span v-t="'music.temporaryPlaylist'" class="text-muted"/>
      <b-button v-t="'reset'" variant="outline-danger" size="sm" class="ml-auto" @click="reset"/>
      <b-button v-t="'save'" variant="success" size="sm" class="ml-2"/>
    </div>
    <song-list context='temp' @back="list = null"/>
  </div>
  <div v-else class="p-3">
    <h4 class="mb-1">
      <span>テンポラリープレイリストを作成</span>
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
                  <b-form-select-option value="=">に等しい</b-form-select-option>
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
                  <b-form-select-option value="=">に等しい</b-form-select-option>
                  <b-form-select-option value=">=">以上</b-form-select-option>
                  <b-form-select-option value="<=">以下</b-form-select-option>
                </b-form-select>
              </template>
            </b-form>
          </div>
          <div class="text-right mb-auto ml-auto">
            <b-button variant="info" size="sm" class="rule-btn" @click="removeRule(ruleGroup)">-</b-button>
            <b-button v-b-tooltip="'OR'" variant="info" size="sm" class="rule-btn ml-2" @click="addRule(ruleGroup)">+</b-button>
          </div>
        </b-list-group-item>
      </b-list-group>
      <div v-if="$pc" class="d-flex align-items-center p-2">
        <b-form-checkbox v-model="hasLimit">上限</b-form-checkbox>
        <b-input-group append="曲" class="w-auto ml-2">
          <b-input v-model="limit" type="number" number :disabled="!hasLimit"/>
        </b-input-group>
        <b-input-group class="w-auto align-items-center ml-2">
          <b-input-group-prepend is-text>
            選択方法
          </b-input-group-prepend>
          <b-form-select v-model="sortBy" :options="sortOptions" :disabled="!hasLimit"/>
        </b-input-group>
        <b-button v-b-tooltip="'AND'" variant="info" class="ml-auto" @click="addRule()">+</b-button>
      </div>
      <div v-else class="p-2">
        <div class="d-flex">
          <b-button v-b-tooltip="'AND'" variant="info" class="ml-auto" @click="addRule()">+</b-button>
        </div>
        <div class="d-flex align-items-center mt-2">
          <b-form-checkbox v-model="hasLimit">上限</b-form-checkbox>
          <b-input-group append="曲" class="w-auto ml-2">
            <b-input v-model="limit" type="number" number :disabled="!hasLimit"/>
          </b-input-group>
        </div>
        <b-input-group class="mt-2">
          <b-input-group-prepend is-text>
            選択方法
          </b-input-group-prepend>
          <b-form-select v-model="sortBy" :options="sortOptions" :disabled="!hasLimit"/>
        </b-input-group>
      </div>
      <template #footer>
        <div class="d-flex align-items-center">
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
import { Dictionary } from 'vue-router/types/router';

@Component({
  components: {
    Rate,
    SongList,
  },
})
export default class TemporaryPlaylist extends Vue {
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

  private hasLimit = false;
  private limit = 100;
  private sortBy: string = 'rate__desc';

  get options() {
    return ['title', 'artist', 'album', 'rate', 'created_at'].map((k) => ({
      text: this.$t(`music.fields.${k}`),
      value: k,
    }));
  }

  get sortOptions() {
    return [
      { text: 'レートが高い', value: 'rate__desc' },
      { text: 'レートが低い', value: 'rate__asc' },
      { text: '追加日が新しい', value: 'created_at__desc' },
      { text: '追加日が古い', value: 'created_at__asc' },
    ];
  }

  get list() {
    return musicModule.temporaryPlaylist;
  }

  set list(songs: Song[] | null) {
    musicModule.SET_TEMPORARY_PLAYLIST(songs);
  }

  protected created() {
    this.addRule();
  }

  protected activated() {
    musicModule.SET_TEMPORARY_PLAYLIST();
  }

  private addRule(ruleGroup?: Rule[]) {
    const defaultField = 'artist';
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
    this.list = null;
    this.ruleGroups = [];
    this.ruleCount = 0;
    this.hasLimit = false;
    this.limit = 100;
    this.sortBy = 'rate__desc';
    this.addRule();
  }

  private async create() {
    const params: {
      rules: Rule[][],
      limit?: number,
      sortBy?: string,
    } = {
      rules: this.ruleGroups,
    };
    if (this.hasLimit) {
      params.limit = this.limit;
      params.sortBy = this.sortBy;
    }
    const { data } = await musicModule.FetchSongs(params);
    this.list = data;
  }
}
</script>
<style lang="scss" scoped>
.rule-btn {
  width: 1.8rem;
}
</style>
