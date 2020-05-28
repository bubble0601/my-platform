import Vue, { VueConstructor } from 'vue';
import { now, isDate } from 'lodash';
import store from '@/store';

export { calcTextareaHeight } from './calcHeight';
export { default as SizeMixin } from './SizeMixin';
export { default as DialogMixin } from './DialogMixin';
export { default as initDialogs } from './Dialogs';

const beforeUnloads: { [s: string]: (e: BeforeUnloadEvent) => any } = {};
export function setBeforeUnload(name: string, isChanged: () => boolean) {
  beforeUnloads[name] = (e: BeforeUnloadEvent) => {
    if (isChanged()) {
      e.returnValue = '';
      return '';
    }
    return undefined;
  };
  window.addEventListener('beforeunload', beforeUnloads[name]);
}
export function unsetBeforeUnload(name: string) {
  window.removeEventListener('beforeunload', beforeUnloads[name]);
}

export function waitUntil(check: () => boolean, timeout: number = 1000) {
  const end = now() + timeout;
  const exec = (resolve: (...args: any) => void, reject: (...args: any) => void) => {
    if (check()) resolve();
    else if (now() > end) reject('timeout');
    else setTimeout(exec, 50, resolve, reject);
  };
  return new Promise(exec);
}

export function escapeHtml(str: string) {
  if (!str) return str;
  return str.replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;');
}

export function download(url: string, filename: string = '') {
  const a = document.createElement('a');
  a.download = filename || url.split('/').pop() || '';
  a.href = url;
  a.click();
}

function parseDate(str: string) {
  const r = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (r === null) return null;
  return new Date(Number(r[1]), Number(r[2]) - 1, Number(r[3]));
}
// Date->曜日(String)
export function getWeekDay(arg: string | Date) {
  let date: any = arg;
  if (typeof arg === 'string') {
    date = parseDate(arg);
  }
  if (!isDate(date)) {
    return null;
  }
  return '日月火水木金土'[date.getDay()];
}

export function formatTime(time: number) {
  const h = Math.floor(time / 3600);
  const m = Math.floor((time - 3600 * h) / 60);
  const s = time % 60;
  const H = h > 0 ? `${h}:` : '';
  const M = m < 10 ? `0${m}` : String(m);
  const S = s < 10 ? `0${s}` : String(s);
  return `${H}${M}:${S}`;
}

export function timeRange(_start: string, _end: string, emphStart = false, emphEnd = false) {
  let start = escapeHtml(_start);
  let end = escapeHtml(_end);
  if (start && emphStart) start = `<strong><u>${start}</u></strong>`;
  if (end && emphEnd) end = `<strong><u>${end}</u></strong>`;
  if (start && end) {
    return `${start}&sim;${end}`;
  }
  if (start) {
    return `${start}&sim;`;
  }
  if (end) {
    return `&sim;${end}`;
  }
  return '';
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const env = {
  os: {},
  render: {
    webkit: navigator.userAgent.indexOf('WebKit') !== -1,
  },
  rem() {
    const fontsize = getComputedStyle(document.documentElement || document.body).fontSize;
    if (fontsize != null) {
      return parseFloat(fontsize);
    }
  },
};

export function createVueInstance(comp: VueConstructor) {
  return new Vue({
    ...comp,
    store,
  });
}
