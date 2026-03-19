import type { RouteRecordRaw } from 'vue-router';

import { VBEN_LOGO_URL } from '@vben/constants';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ix:full-screen',
      title: $t('page.sjbig.title'),
    },
    name: 'sjbig',
    path: '/sjbig/index.vue',
    component:()=>import('#/views/sjbig/index.vue'),
   
  },
];

export default routes;
