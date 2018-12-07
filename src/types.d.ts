import Vue from 'vue';

// type difinitions for Buefy component
export interface Input extends Vue {
  focus(): void;
}

// miscellaneous type difinitions
export interface VueOptions extends Vue {
  title?: string;
}
