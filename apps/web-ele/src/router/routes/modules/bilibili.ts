import type { RouteRecordRaw } from 'vue-router';

import { VBEN_LOGO_URL } from '@vben/constants';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'carbon:app',
      title: $t('page.bilibili.title'),
    },
    name: 'Bilibili',
    path: '/bilibili',
    redirect: '/bilibili/index',
    children: [
      {
        name: 'BilibiliIndex',
        path: '/bilibili/index',
        component: () => import('#/views/bilibili/index.vue'),  
        meta: {
          icon: 'mdi:video',
          title: $t('page.bilibili.index'), 
        },
      }, {
        name: 'HomeIndex',
        path: '/home/index',
        component: () => import('#/views/home/index.vue'),
        meta: {
          icon: 'mdi:music',
          title: $t('page.home.index'),
        },
      }, {
        name: 'WeiboIndex',
        path: '/weibo/index',
        component: () => import('#/views/weibo/index.vue'),
        meta: {
          icon: 'ri:weibo-fill',
          title: $t('page.weibo.index'),
        },
      }, {
        name: 'xhsIndex',
        path: '/xhs/index',
        component: () => import('#/views/xhs/index.vue'),
        meta: {
          icon: 'mdi:book-open',
          title: $t('page.xiaohongshu.index'),
        },
      },
       {
        name: 'ZhihuIndex',
        path: '/zhihu/index',
        component: () => import('#/views/zhihu/index.vue'),
        meta: {
          icon: 'ri:zhihu-fill',
          title: $t('page.zhihu.index'),
        },
      },

    ],
  },
];

export default routes;
